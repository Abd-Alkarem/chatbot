const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'chat-app-secret',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static('public'));

const onlineUsers = new Map();
const userSockets = new Map();
const messages = new Map();

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userId = await db.registerUser(username, email, password);
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, userId });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userId = await db.loginUser(email, password);
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
        const user = db.getUserSafe(userId);
        res.json({ success: true, token, user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/user/:userId', (req, res) => {
    const user = db.getUserSafe(req.params.userId);
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(404).json({ success: false, error: 'User not found' });
    }
});

app.post('/api/user/:userId/settings', (req, res) => {
    try {
        db.updateUserSettings(req.params.userId, req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/user/:userId/profile', (req, res) => {
    try {
        db.updateUserProfile(req.params.userId, req.body);
        const user = db.getUserSafe(req.params.userId);
        res.json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.get('/api/groups/public', (req, res) => {
    const groups = db.getAllPublicGroups();
    res.json({ success: true, groups });
});

app.get('/api/user/:userId/groups', (req, res) => {
    const groups = db.getUserGroups(req.params.userId);
    res.json({ success: true, groups });
});

app.get('/api/user/:userId/friends', (req, res) => {
    const friends = db.getFriends(req.params.userId);
    res.json({ success: true, friends });
});

app.get('/api/user/:userId/friend-requests', (req, res) => {
    const requests = db.getFriendRequests(req.params.userId);
    res.json({ success: true, requests });
});

app.post('/api/search/users', (req, res) => {
    const { query, userId } = req.body;
    const results = db.searchUsers(query, userId);
    res.json({ success: true, results });
});

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.on('authenticate', (data) => {
        try {
            const decoded = jwt.verify(data.token, JWT_SECRET);
            const user = db.getUser(decoded.userId);
            
            if (user) {
                socket.userId = user.id;
                userSockets.set(user.id, socket.id);
                onlineUsers.set(socket.id, {
                    userId: user.id,
                    username: user.username,
                    avatar: user.avatar,
                    currentRoom: 'general'
                });
                
                socket.join('general');
                const group = db.getGroup('general');
                if (group) {
                    group.members.add(user.id);
                }
                
                socket.emit('authenticated', {
                    user: db.getUserSafe(user.id),
                    groups: db.getUserGroups(user.id)
                });
                
                if (messages.has('general')) {
                    socket.emit('message-history', messages.get('general'));
                }
                
                io.to('general').emit('user-joined', {
                    username: user.username,
                    userId: user.id,
                    room: 'general'
                });
                
                emitOnlineUsers();
            }
        } catch (error) {
            socket.emit('auth-error', { error: 'Invalid token' });
        }
    });

    socket.on('send-message', (data) => {
        const onlineUser = onlineUsers.get(socket.id);
        if (!onlineUser) return;
        
        const user = db.getUser(onlineUser.userId);
        if (!user) return;

        const message = {
            id: uuidv4(),
            userId: user.id,
            username: user.username,
            avatar: user.avatar,
            text: data.text,
            room: data.room || onlineUser.currentRoom,
            timestamp: new Date().toISOString()
        };

        if (!messages.has(message.room)) {
            messages.set(message.room, []);
        }
        messages.get(message.room).push(message);

        if (messages.get(message.room).length > 100) {
            messages.get(message.room).shift();
        }

        io.to(message.room).emit('new-message', message);
    });

    socket.on('create-group', (groupData) => {
        const onlineUser = onlineUsers.get(socket.id);
        if (!onlineUser) return;
        
        try {
            const groupId = db.createGroup(
                groupData.name,
                groupData.description || '',
                groupData.type || 'public',
                onlineUser.userId
            );
            
            messages.set(groupId, []);
            socket.join(groupId);
            
            const group = db.getGroup(groupId);
            io.emit('group-created', {
                id: group.id,
                name: group.name,
                description: group.description,
                type: group.type,
                memberCount: group.members.size
            });
            
            socket.emit('group-joined', groupId);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('join-group', (groupId) => {
        const onlineUser = onlineUsers.get(socket.id);
        if (!onlineUser) return;

        try {
            const oldRoom = onlineUser.currentRoom;
            if (oldRoom) {
                socket.leave(oldRoom);
                io.to(oldRoom).emit('user-left', {
                    username: onlineUser.username,
                    userId: onlineUser.userId,
                    room: oldRoom
                });
            }

            db.joinGroup(groupId, onlineUser.userId);
            socket.join(groupId);
            onlineUser.currentRoom = groupId;
            
            socket.emit('group-joined', groupId);
            
            if (messages.has(groupId)) {
                socket.emit('message-history', messages.get(groupId));
            }
            
            io.to(groupId).emit('user-joined', {
                username: onlineUser.username,
                userId: onlineUser.userId,
                room: groupId
            });
            
            emitOnlineUsers();
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('send-friend-request', (data) => {
        const onlineUser = onlineUsers.get(socket.id);
        if (!onlineUser) return;
        
        try {
            const toUserId = db.sendFriendRequest(onlineUser.userId, data.username);
            const toSocketId = userSockets.get(toUserId);
            
            if (toSocketId) {
                io.to(toSocketId).emit('friend-request-received', {
                    from: db.getUserSafe(onlineUser.userId)
                });
            }
            
            socket.emit('friend-request-sent', { success: true });
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('accept-friend-request', (requestId) => {
        const onlineUser = onlineUsers.get(socket.id);
        if (!onlineUser) return;
        
        try {
            const fromUserId = db.acceptFriendRequest(requestId, onlineUser.userId);
            const fromSocketId = userSockets.get(fromUserId);
            
            if (fromSocketId) {
                io.to(fromSocketId).emit('friend-request-accepted', {
                    user: db.getUserSafe(onlineUser.userId)
                });
            }
            
            socket.emit('friend-added', { user: db.getUserSafe(fromUserId) });
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('reject-friend-request', (requestId) => {
        const onlineUser = onlineUsers.get(socket.id);
        if (!onlineUser) return;
        
        try {
            db.rejectFriendRequest(requestId, onlineUser.userId);
            socket.emit('friend-request-rejected', { success: true });
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('add-group-member', (data) => {
        const onlineUser = onlineUsers.get(socket.id);
        if (!onlineUser) return;
        
        try {
            db.addGroupMember(data.groupId, data.userId, onlineUser.userId);
            const memberSocketId = userSockets.get(data.userId);
            
            if (memberSocketId) {
                io.to(memberSocketId).emit('added-to-group', {
                    group: db.getGroup(data.groupId)
                });
            }
            
            io.to(data.groupId).emit('member-added', {
                user: db.getUserSafe(data.userId)
            });
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('typing', (isTyping) => {
        const onlineUser = onlineUsers.get(socket.id);
        if (!onlineUser) return;
        
        socket.to(onlineUser.currentRoom).emit('user-typing', {
            userId: onlineUser.userId,
            username: onlineUser.username,
            isTyping: isTyping
        });
    });

    socket.on('disconnect', () => {
        const onlineUser = onlineUsers.get(socket.id);
        if (onlineUser) {
            io.to(onlineUser.currentRoom).emit('user-left', {
                username: onlineUser.username,
                userId: onlineUser.userId,
                room: onlineUser.currentRoom
            });
            
            userSockets.delete(onlineUser.userId);
            onlineUsers.delete(socket.id);
            emitOnlineUsers();
        }
        console.log('User disconnected:', socket.id);
    });
});

function emitOnlineUsers() {
    const users = Array.from(onlineUsers.values()).map(u => ({
        userId: u.userId,
        username: u.username,
        avatar: u.avatar,
        currentRoom: u.currentRoom
    }));
    io.emit('online-users', users);
}


server.listen(PORT, () => {
    console.log(`💬 Chat server running on http://localhost:${PORT}`);
});
