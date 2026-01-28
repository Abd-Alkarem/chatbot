if (!localStorage.getItem('chatToken')) {
    window.location.href = '/auth.html';
}

const socket = io();
let currentUser = null;
let currentGroup = 'general';
let typingTimeout = null;

const currentUsername = document.getElementById('currentUsername');
const currentUserAvatar = document.getElementById('currentUserAvatar');
const groupList = document.getElementById('groupList');
const publicGroupList = document.getElementById('publicGroupList');
const friendList = document.getElementById('friendList');
const friendRequests = document.getElementById('friendRequests');
const searchResults = document.getElementById('searchResults');
const messagesContainer = document.getElementById('messagesContainer');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const currentGroupName = document.getElementById('currentGroupName');
const currentGroupDesc = document.getElementById('currentGroupDesc');
const typingIndicator = document.getElementById('typingIndicator');
const onlineCount = document.getElementById('onlineCount');
const requestCount = document.getElementById('requestCount');
const friendCount = document.getElementById('friendCount');

const sidebarTabs = document.querySelectorAll('.sidebar-tab');
const tabContents = document.querySelectorAll('.tab-content');

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const notificationsToggle = document.getElementById('notificationsToggle');
const soundToggle = document.getElementById('soundToggle');
const profileUsername = document.getElementById('profileUsername');
const profileBio = document.getElementById('profileBio');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');

const createGroupBtn = document.getElementById('createGroupBtn');
const createGroupModal = document.getElementById('createGroupModal');
const closeGroupModalBtn = document.getElementById('closeGroupModalBtn');
const createGroupForm = document.getElementById('createGroupForm');

const friendSearchInput = document.getElementById('friendSearchInput');
const searchUsersBtn = document.getElementById('searchUsersBtn');
const refreshGroupsBtn = document.getElementById('refreshGroupsBtn');

socket.on('connect', () => {
    const token = localStorage.getItem('chatToken');
    socket.emit('authenticate', { token });
});

socket.on('authenticated', (data) => {
    currentUser = data.user;
    currentUsername.textContent = currentUser.username;
    currentUserAvatar.style.backgroundColor = currentUser.avatar;
    currentUserAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
    
    profileUsername.value = currentUser.username;
    profileBio.value = currentUser.bio || '';
    
    if (currentUser.settings) {
        darkModeToggle.checked = currentUser.settings.darkMode;
        notificationsToggle.checked = currentUser.settings.notifications;
        soundToggle.checked = currentUser.settings.soundEnabled;
        
        if (currentUser.settings.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }
    
    loadGroups(data.groups);
    loadPublicGroups();
    loadFriends();
    loadFriendRequests();
});

socket.on('auth-error', () => {
    localStorage.removeItem('chatToken');
    localStorage.removeItem('chatUser');
    window.location.href = '/auth.html';
});

socket.on('message-history', (messages) => {
    messagesContainer.innerHTML = '';
    messages.forEach(msg => displayMessage(msg));
    scrollToBottom();
});

socket.on('new-message', (message) => {
    displayMessage(message);
    scrollToBottom();
});

socket.on('user-joined', (data) => {
    if (data.room === currentGroup) {
        const systemMsg = document.createElement('div');
        systemMsg.className = 'system-message';
        systemMsg.textContent = `${data.username} joined the group`;
        messagesContainer.appendChild(systemMsg);
        scrollToBottom();
    }
});

socket.on('user-left', (data) => {
    if (data.room === currentGroup) {
        const systemMsg = document.createElement('div');
        systemMsg.className = 'system-message';
        systemMsg.textContent = `${data.username} left the group`;
        messagesContainer.appendChild(systemMsg);
        scrollToBottom();
    }
});

socket.on('group-joined', (groupId) => {
    currentGroup = groupId;
    messagesContainer.innerHTML = '';
    updateActiveGroup();
});

socket.on('group-created', () => {
    loadPublicGroups();
});

socket.on('online-users', (users) => {
    onlineCount.textContent = users.length;
});

socket.on('user-typing', (data) => {
    if (data.userId !== currentUser?.id) {
        typingIndicator.innerHTML = `<div class="typing-text">${data.username} is typing...</div>`;
        setTimeout(() => {
            typingIndicator.innerHTML = '';
        }, 3000);
    }
});

socket.on('friend-request-received', (data) => {
    loadFriendRequests();
    showNotification(`Friend request from ${data.from.username}`);
});

socket.on('friend-request-accepted', (data) => {
    loadFriends();
    showNotification(`${data.user.username} accepted your friend request`);
});

socket.on('friend-added', (data) => {
    loadFriends();
    loadFriendRequests();
});

socket.on('added-to-group', (data) => {
    showNotification(`You were added to ${data.group.name}`);
    loadGroups();
});

socket.on('error', (data) => {
    alert(data.message);
});

sidebarTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        sidebarTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        tabContents.forEach(content => {
            if (content.id === `${tabName}Tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    });
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (text) {
        socket.emit('send-message', { text, room: currentGroup });
        messageInput.value = '';
        socket.emit('typing', false);
    }
});

messageInput.addEventListener('input', () => {
    socket.emit('typing', true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('typing', false);
    }, 1000);
});

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

darkModeToggle.addEventListener('change', async () => {
    const darkMode = darkModeToggle.checked;
    document.body.classList.toggle('dark-mode', darkMode);
    
    await fetch(`/api/user/${currentUser.id}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ darkMode })
    });
});

notificationsToggle.addEventListener('change', async () => {
    await fetch(`/api/user/${currentUser.id}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: notificationsToggle.checked })
    });
});

soundToggle.addEventListener('change', async () => {
    await fetch(`/api/user/${currentUser.id}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soundEnabled: soundToggle.checked })
    });
});

saveProfileBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/user/${currentUser.id}/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: profileUsername.value,
                bio: profileBio.value
            })
        });
        
        const data = await response.json();
        if (data.success) {
            currentUser = data.user;
            currentUsername.textContent = currentUser.username;
            alert('Profile updated successfully!');
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Failed to update profile');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('chatToken');
    localStorage.removeItem('chatUser');
    window.location.href = '/auth.html';
});

createGroupBtn.addEventListener('click', () => {
    createGroupModal.classList.remove('hidden');
});

closeGroupModalBtn.addEventListener('click', () => {
    createGroupModal.classList.add('hidden');
    createGroupForm.reset();
});

createGroupModal.addEventListener('click', (e) => {
    if (e.target === createGroupModal) {
        createGroupModal.classList.add('hidden');
        createGroupForm.reset();
    }
});

createGroupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('groupNameInput').value;
    const description = document.getElementById('groupDescInput').value;
    const type = document.getElementById('groupTypeSelect').value;
    
    socket.emit('create-group', { name, description, type });
    createGroupModal.classList.add('hidden');
    createGroupForm.reset();
});

searchUsersBtn.addEventListener('click', async () => {
    const query = friendSearchInput.value.trim();
    if (!query) return;
    
    try {
        const response = await fetch('/api/search/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, userId: currentUser.id })
        });
        
        const data = await response.json();
        if (data.success) {
            displaySearchResults(data.results);
        }
    } catch (error) {
        console.error('Search failed:', error);
    }
});

friendSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchUsersBtn.click();
    }
});

refreshGroupsBtn.addEventListener('click', () => {
    loadPublicGroups();
});

async function loadGroups(groups) {
    groupList.innerHTML = '';
    
    if (!groups || groups.length === 0) {
        groupList.innerHTML = '<p style="color: var(--text-secondary); padding: 10px;">No groups yet</p>';
        return;
    }
    
    groups.forEach(group => {
        const item = document.createElement('div');
        item.className = 'list-item';
        if (group.id === currentGroup) {
            item.classList.add('active');
        }
        
        item.innerHTML = `
            <div class="list-item-header">
                <span class="list-item-name">${group.name}</span>
                <span class="badge">${group.type}</span>
            </div>
            <div class="list-item-info">${group.memberCount} members</div>
        `;
        
        item.addEventListener('click', () => {
            socket.emit('join-group', group.id);
            currentGroupName.textContent = group.name;
            currentGroupDesc.textContent = group.description;
        });
        
        groupList.appendChild(item);
    });
}

async function loadPublicGroups() {
    try {
        const response = await fetch('/api/groups/public');
        const data = await response.json();
        
        if (data.success) {
            publicGroupList.innerHTML = '';
            
            const userGroups = await fetch(`/api/user/${currentUser.id}/groups`).then(r => r.json());
            const userGroupIds = new Set(userGroups.groups.map(g => g.id));
            
            const publicGroups = data.groups.filter(g => !userGroupIds.has(g.id));
            
            if (publicGroups.length === 0) {
                publicGroupList.innerHTML = '<p style="color: var(--text-secondary); padding: 10px;">No public groups available</p>';
                return;
            }
            
            publicGroups.forEach(group => {
                const item = document.createElement('div');
                item.className = 'list-item';
                
                item.innerHTML = `
                    <div class="list-item-header">
                        <span class="list-item-name">${group.name}</span>
                    </div>
                    <div class="list-item-info">${group.description || 'No description'} • ${group.memberCount} members</div>
                `;
                
                item.addEventListener('click', () => {
                    socket.emit('join-group', group.id);
                    currentGroupName.textContent = group.name;
                    currentGroupDesc.textContent = group.description;
                    setTimeout(() => loadGroups(), 500);
                });
                
                publicGroupList.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Failed to load public groups:', error);
    }
}

async function loadFriends() {
    try {
        const response = await fetch(`/api/user/${currentUser.id}/friends`);
        const data = await response.json();
        
        if (data.success) {
            friendList.innerHTML = '';
            friendCount.textContent = data.friends.length;
            
            if (data.friends.length === 0) {
                friendList.innerHTML = '<p style="color: var(--text-secondary); padding: 10px;">No friends yet</p>';
                return;
            }
            
            data.friends.forEach(friend => {
                const item = document.createElement('div');
                item.className = 'list-item';
                
                item.innerHTML = `
                    <div class="list-item-header">
                        <span class="list-item-name">${friend.username}</span>
                    </div>
                    <div class="list-item-info">${friend.email}</div>
                `;
                
                friendList.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Failed to load friends:', error);
    }
}

async function loadFriendRequests() {
    try {
        const response = await fetch(`/api/user/${currentUser.id}/friend-requests`);
        const data = await response.json();
        
        if (data.success) {
            friendRequests.innerHTML = '';
            requestCount.textContent = data.requests.length;
            
            if (data.requests.length === 0) {
                friendRequests.innerHTML = '<p style="color: var(--text-secondary); padding: 10px;">No pending requests</p>';
                return;
            }
            
            data.requests.forEach(request => {
                const item = document.createElement('div');
                item.className = 'list-item';
                
                item.innerHTML = `
                    <div class="list-item-header">
                        <span class="list-item-name">${request.from.username}</span>
                    </div>
                    <div class="list-item-info">${request.from.email}</div>
                    <div class="list-item-actions" style="margin-top: 10px;">
                        <button class="btn-accept" data-id="${request.id}">Accept</button>
                        <button class="btn-reject" data-id="${request.id}">Reject</button>
                    </div>
                `;
                
                item.querySelector('.btn-accept').addEventListener('click', (e) => {
                    e.stopPropagation();
                    socket.emit('accept-friend-request', request.id);
                });
                
                item.querySelector('.btn-reject').addEventListener('click', (e) => {
                    e.stopPropagation();
                    socket.emit('reject-friend-request', request.id);
                });
                
                friendRequests.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Failed to load friend requests:', error);
    }
}

function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p style="color: var(--text-secondary); padding: 10px;">No users found</p>';
        return;
    }
    
    results.forEach(user => {
        const item = document.createElement('div');
        item.className = 'list-item';
        
        item.innerHTML = `
            <div class="list-item-header">
                <span class="list-item-name">${user.username}</span>
            </div>
            <div class="list-item-info">${user.email}</div>
            <div class="list-item-actions" style="margin-top: 10px;">
                <button class="btn-add" data-username="${user.username}">Add Friend</button>
            </div>
        `;
        
        item.querySelector('.btn-add').addEventListener('click', (e) => {
            e.stopPropagation();
            socket.emit('send-friend-request', { username: user.username });
            e.target.textContent = 'Request Sent';
            e.target.disabled = true;
        });
        
        searchResults.appendChild(item);
    });
}

function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    if (message.userId === currentUser?.id) {
        messageDiv.classList.add('own');
    }

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.style.backgroundColor = message.avatar;
    avatar.textContent = message.username.charAt(0).toUpperCase();

    const content = document.createElement('div');
    content.className = 'message-content';

    const header = document.createElement('div');
    header.className = 'message-header';

    const username = document.createElement('span');
    username.className = 'message-username';
    username.textContent = message.username;

    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = formatTime(message.timestamp);

    header.appendChild(username);
    header.appendChild(time);

    const text = document.createElement('div');
    text.className = 'message-text';
    text.textContent = message.text;

    content.appendChild(header);
    content.appendChild(text);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    messagesContainer.appendChild(messageDiv);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateActiveGroup() {
    document.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('active');
    });
}

function showNotification(message) {
    if (currentUser?.settings?.notifications && Notification.permission === 'granted') {
        new Notification('Chat App', { body: message });
    }
}

if (Notification.permission === 'default') {
    Notification.requestPermission();
}

setTimeout(() => {
    if (currentUser) {
        fetch(`/api/user/${currentUser.id}/groups`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    loadGroups(data.groups);
                }
            });
    }
}, 1000);
