const bcrypt = require('bcryptjs');

class Database {
    constructor() {
        this.users = new Map();
        this.groups = new Map();
        this.friendRequests = new Map();
        this.friends = new Map();
        
        this.initializeDefaultGroups();
    }

    initializeDefaultGroups() {
        this.groups.set('general', {
            id: 'general',
            name: 'General',
            description: 'General discussion room',
            type: 'public',
            creator: 'system',
            members: new Set(),
            admins: new Set(['system']),
            createdAt: new Date().toISOString()
        });
    }

    async registerUser(username, email, password) {
        if (this.findUserByEmail(email)) {
            throw new Error('Email already exists');
        }
        if (this.findUserByUsername(username)) {
            throw new Error('Username already taken');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const user = {
            id: userId,
            username,
            email,
            password: hashedPassword,
            avatar: this.generateAvatar(),
            bio: '',
            createdAt: new Date().toISOString(),
            settings: {
                darkMode: false,
                notifications: true,
                soundEnabled: true
            }
        };

        this.users.set(userId, user);
        this.friends.set(userId, new Set());
        return userId;
    }

    async loginUser(email, password) {
        const user = this.findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        return user.id;
    }

    findUserByEmail(email) {
        for (let user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    findUserByUsername(username) {
        for (let user of this.users.values()) {
            if (user.username.toLowerCase() === username.toLowerCase()) {
                return user;
            }
        }
        return null;
    }

    getUser(userId) {
        return this.users.get(userId);
    }

    getUserSafe(userId) {
        const user = this.users.get(userId);
        if (!user) return null;
        
        const { password, ...safeUser } = user;
        return safeUser;
    }

    updateUserSettings(userId, settings) {
        const user = this.users.get(userId);
        if (user) {
            user.settings = { ...user.settings, ...settings };
            return true;
        }
        return false;
    }

    updateUserProfile(userId, updates) {
        const user = this.users.get(userId);
        if (user) {
            if (updates.username && updates.username !== user.username) {
                if (this.findUserByUsername(updates.username)) {
                    throw new Error('Username already taken');
                }
                user.username = updates.username;
            }
            if (updates.bio !== undefined) {
                user.bio = updates.bio;
            }
            return true;
        }
        return false;
    }

    createGroup(name, description, type, creatorId) {
        const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const group = {
            id: groupId,
            name,
            description,
            type,
            creator: creatorId,
            members: new Set([creatorId]),
            admins: new Set([creatorId]),
            createdAt: new Date().toISOString()
        };

        this.groups.set(groupId, group);
        return groupId;
    }

    getGroup(groupId) {
        return this.groups.get(groupId);
    }

    getAllPublicGroups() {
        const publicGroups = [];
        for (let group of this.groups.values()) {
            if (group.type === 'public') {
                publicGroups.push({
                    id: group.id,
                    name: group.name,
                    description: group.description,
                    type: group.type,
                    memberCount: group.members.size,
                    createdAt: group.createdAt
                });
            }
        }
        return publicGroups;
    }

    getUserGroups(userId) {
        const userGroups = [];
        for (let group of this.groups.values()) {
            if (group.members.has(userId)) {
                userGroups.push({
                    id: group.id,
                    name: group.name,
                    description: group.description,
                    type: group.type,
                    memberCount: group.members.size,
                    isAdmin: group.admins.has(userId)
                });
            }
        }
        return userGroups;
    }

    joinGroup(groupId, userId) {
        const group = this.groups.get(groupId);
        if (!group) {
            throw new Error('Group not found');
        }
        if (group.type === 'private') {
            throw new Error('Cannot join private group without invitation');
        }
        group.members.add(userId);
        return true;
    }

    leaveGroup(groupId, userId) {
        const group = this.groups.get(groupId);
        if (!group) {
            throw new Error('Group not found');
        }
        group.members.delete(userId);
        group.admins.delete(userId);
        return true;
    }

    addGroupMember(groupId, userId, addedBy) {
        const group = this.groups.get(groupId);
        if (!group) {
            throw new Error('Group not found');
        }
        if (!group.admins.has(addedBy)) {
            throw new Error('Only admins can add members');
        }
        group.members.add(userId);
        return true;
    }

    sendFriendRequest(fromUserId, toUsername) {
        const toUser = this.findUserByUsername(toUsername);
        if (!toUser) {
            throw new Error('User not found');
        }
        if (fromUserId === toUser.id) {
            throw new Error('Cannot send friend request to yourself');
        }
        if (this.areFriends(fromUserId, toUser.id)) {
            throw new Error('Already friends');
        }

        const requestId = `${fromUserId}_${toUser.id}`;
        if (!this.friendRequests.has(toUser.id)) {
            this.friendRequests.set(toUser.id, new Map());
        }
        
        this.friendRequests.get(toUser.id).set(requestId, {
            id: requestId,
            from: fromUserId,
            to: toUser.id,
            timestamp: new Date().toISOString()
        });

        return toUser.id;
    }

    acceptFriendRequest(requestId, userId) {
        const userRequests = this.friendRequests.get(userId);
        if (!userRequests || !userRequests.has(requestId)) {
            throw new Error('Friend request not found');
        }

        const request = userRequests.get(requestId);
        this.friends.get(request.from).add(request.to);
        this.friends.get(request.to).add(request.from);
        
        userRequests.delete(requestId);
        return request.from;
    }

    rejectFriendRequest(requestId, userId) {
        const userRequests = this.friendRequests.get(userId);
        if (!userRequests || !userRequests.has(requestId)) {
            throw new Error('Friend request not found');
        }
        userRequests.delete(requestId);
        return true;
    }

    getFriendRequests(userId) {
        const requests = this.friendRequests.get(userId);
        if (!requests) return [];
        
        return Array.from(requests.values()).map(req => ({
            id: req.id,
            from: this.getUserSafe(req.from),
            timestamp: req.timestamp
        }));
    }

    getFriends(userId) {
        const friendIds = this.friends.get(userId);
        if (!friendIds) return [];
        
        return Array.from(friendIds).map(id => this.getUserSafe(id)).filter(u => u);
    }

    areFriends(userId1, userId2) {
        const friends = this.friends.get(userId1);
        return friends ? friends.has(userId2) : false;
    }

    searchUsers(query, currentUserId) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        for (let user of this.users.values()) {
            if (user.id !== currentUserId && 
                (user.username.toLowerCase().includes(lowerQuery) || 
                 user.email.toLowerCase().includes(lowerQuery))) {
                results.push(this.getUserSafe(user.id));
            }
        }
        
        return results.slice(0, 10);
    }

    generateAvatar() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

module.exports = new Database();
