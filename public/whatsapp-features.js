// WhatsApp Complete Features Implementation

// Status Management
const statusData = new Map();
let selectedStatusColor = '#25D366';

// Calls Management
const callsHistory = [];

// Communities Management
const communities = [];

// Starred Messages
const starredMessages = new Set();

// Archived Chats
const archivedChats = new Set();

// Broadcast Lists
const broadcastLists = [];

// Tab Switching
document.querySelectorAll('.sidebar-tab-main').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        document.querySelectorAll('.sidebar-tab-main').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.tab-content-main').forEach(content => {
            content.classList.remove('active');
        });
        
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Load data for the selected tab
        if (tabName === 'status') loadStatusUpdates();
        if (tabName === 'calls') loadCallsHistory();
        if (tabName === 'communities') loadCommunities();
    });
});

// Status Feature
const addStatusBtn = document.getElementById('addStatusBtn');
const statusModal = document.getElementById('statusModal');
const closeStatusBtn = document.getElementById('closeStatusBtn');
const statusForm = document.getElementById('statusForm');
const myStatusAvatar = document.getElementById('myStatusAvatar');

if (addStatusBtn) {
    addStatusBtn.addEventListener('click', () => {
        statusModal.classList.remove('hidden');
    });
}

if (closeStatusBtn) {
    closeStatusBtn.addEventListener('click', () => {
        statusModal.classList.add('hidden');
    });
}

// Color picker for status
document.querySelectorAll('.color-option').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedStatusColor = btn.dataset.color;
    });
});

if (statusForm) {
    statusForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('statusText').value.trim();
        
        if (text && currentUser) {
            const status = {
                id: Date.now(),
                userId: currentUser.id,
                username: currentUser.username,
                avatar: currentUser.avatar,
                text: text,
                color: selectedStatusColor,
                timestamp: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                views: []
            };
            
            socket.emit('post-status', status);
            statusModal.classList.add('hidden');
            statusForm.reset();
            
            // Update my status display
            updateMyStatus(status);
        }
    });
}

function updateMyStatus(status) {
    const myStatus = document.getElementById('myStatus');
    if (myStatus && currentUser) {
        myStatusAvatar.style.backgroundColor = currentUser.avatar;
        myStatusAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
        
        const statusInfo = myStatus.querySelector('.status-info');
        statusInfo.innerHTML = `
            <div class="status-name">My status</div>
            <div class="status-time">${getTimeAgo(status.timestamp)}</div>
        `;
    }
}

function loadStatusUpdates() {
    socket.emit('get-status-updates');
}

socket.on('status-updates', (statuses) => {
    displayStatusUpdates(statuses);
});

socket.on('new-status', (status) => {
    displayStatusUpdates([status]);
});

function displayStatusUpdates(statuses) {
    const statusList = document.getElementById('statusList');
    const viewedStatusList = document.getElementById('viewedStatusList');
    
    if (!statusList || !viewedStatusList) return;
    
    statusList.innerHTML = '';
    viewedStatusList.innerHTML = '';
    
    statuses.forEach(status => {
        const isViewed = status.views.includes(currentUser?.id);
        const targetList = isViewed ? viewedStatusList : statusList;
        
        const item = document.createElement('div');
        item.className = 'list-item status-item';
        item.style.cursor = 'pointer';
        
        const avatar = document.createElement('div');
        avatar.className = 'status-avatar-container';
        avatar.innerHTML = `
            <div class="status-avatar" style="background: ${status.avatar}; ${!isViewed ? 'border: 3px solid var(--whatsapp-green);' : ''}">
                ${status.username.charAt(0).toUpperCase()}
            </div>
        `;
        
        const info = document.createElement('div');
        info.style.flex = '1';
        info.innerHTML = `
            <div class="status-name">${status.username}</div>
            <div class="status-time">${getTimeAgo(status.timestamp)}</div>
        `;
        
        item.appendChild(avatar);
        item.appendChild(info);
        
        item.addEventListener('click', () => viewStatus(status));
        
        targetList.appendChild(item);
    });
}

function viewStatus(status) {
    const viewStatusModal = document.getElementById('viewStatusModal');
    const statusViewerContent = document.getElementById('statusViewerContent');
    
    if (!viewStatusModal || !statusViewerContent) return;
    
    statusViewerContent.innerHTML = `
        <div class="status-user-info">
            <div class="user-avatar" style="background: ${status.avatar}">
                ${status.username.charAt(0).toUpperCase()}
            </div>
            <div class="username">${status.username}</div>
        </div>
        <div class="status-display" style="background: ${status.color}">
            ${status.text}
        </div>
    `;
    
    viewStatusModal.classList.remove('hidden');
    
    // Mark as viewed
    if (!status.views.includes(currentUser?.id)) {
        socket.emit('view-status', status.id);
    }
}

const closeViewStatusBtn = document.getElementById('closeViewStatusBtn');
if (closeViewStatusBtn) {
    closeViewStatusBtn.addEventListener('click', () => {
        document.getElementById('viewStatusModal').classList.add('hidden');
    });
}

// Calls Feature
const newCallBtn = document.getElementById('newCallBtn');
const callsList = document.getElementById('callsList');

if (newCallBtn) {
    newCallBtn.addEventListener('click', () => {
        addFriendModal.classList.remove('hidden');
    });
}

function loadCallsHistory() {
    socket.emit('get-calls-history');
}

socket.on('calls-history', (calls) => {
    displayCallsHistory(calls);
});

socket.on('new-call', (call) => {
    callsHistory.unshift(call);
    displayCallsHistory(callsHistory);
});

function displayCallsHistory(calls) {
    if (!callsList) return;
    
    callsList.innerHTML = '';
    
    if (calls.length === 0) {
        callsList.innerHTML = '<p style="color: var(--text-secondary); padding: 20px; text-align: center;">No calls yet</p>';
        return;
    }
    
    calls.forEach(call => {
        const item = document.createElement('div');
        item.className = 'call-item';
        
        const iconClass = call.type === 'missed' ? 'missed' : call.direction === 'incoming' ? 'incoming' : 'outgoing';
        const iconSvg = call.callType === 'video' ? 
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' :
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
        
        item.innerHTML = `
            <div class="call-icon ${iconClass}">
                ${iconSvg}
            </div>
            <div class="call-info">
                <div class="call-name">${call.username}</div>
                <div class="call-details">
                    <span>${call.type === 'missed' ? 'Missed' : call.direction === 'incoming' ? 'Incoming' : 'Outgoing'}</span>
                    <span>•</span>
                    <span>${getTimeAgo(call.timestamp)}</span>
                    ${call.duration ? `<span>• ${formatDuration(call.duration)}</span>` : ''}
                </div>
            </div>
            <div class="call-actions">
                <button class="call-btn" onclick="initiateCall('${call.userId}', 'voice')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </button>
                <button class="call-btn video" onclick="initiateCall('${call.userId}', 'video')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                </button>
            </div>
        `;
        
        callsList.appendChild(item);
    });
}

function initiateCall(userId, type) {
    const call = {
        userId: userId,
        callType: type,
        direction: 'outgoing',
        timestamp: new Date().toISOString()
    };
    
    socket.emit('initiate-call', call);
    alert(`${type === 'video' ? 'Video' : 'Voice'} call initiated!`);
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Communities Feature
const startCommunityBtn = document.getElementById('startCommunityBtn');
const newCommunityBtn = document.getElementById('newCommunityBtn');
const communityModal = document.getElementById('communityModal');
const closeCommunityBtn = document.getElementById('closeCommunityBtn');
const communityForm = document.getElementById('communityForm');

if (startCommunityBtn) {
    startCommunityBtn.addEventListener('click', () => {
        communityModal.classList.remove('hidden');
    });
}

if (newCommunityBtn) {
    newCommunityBtn.addEventListener('click', () => {
        communityModal.classList.remove('hidden');
    });
}

if (closeCommunityBtn) {
    closeCommunityBtn.addEventListener('click', () => {
        communityModal.classList.add('hidden');
    });
}

if (communityForm) {
    communityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('communityName').value.trim();
        const description = document.getElementById('communityDesc').value.trim();
        
        if (name && currentUser) {
            const community = {
                id: Date.now(),
                name: name,
                description: description,
                adminId: currentUser.id,
                members: [currentUser.id],
                groups: [],
                createdAt: new Date().toISOString()
            };
            
            socket.emit('create-community', community);
            communityModal.classList.add('hidden');
            communityForm.reset();
        }
    });
}

function loadCommunities() {
    socket.emit('get-communities');
}

socket.on('communities-list', (communitiesList) => {
    displayCommunities(communitiesList);
});

function displayCommunities(communitiesList) {
    const communitiesListEl = document.getElementById('communitiesList');
    if (!communitiesListEl) return;
    
    communitiesListEl.innerHTML = '';
    
    communitiesList.forEach(community => {
        const item = document.createElement('div');
        item.className = 'community-item';
        
        item.innerHTML = `
            <div class="community-avatar">
                ${community.name.charAt(0).toUpperCase()}
            </div>
            <div class="community-info">
                <div class="community-name">${community.name}</div>
                <div class="community-members">${community.members.length} members • ${community.groups.length} groups</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            alert(`Community: ${community.name}\n${community.description}`);
        });
        
        communitiesListEl.appendChild(item);
    });
}

// Starred Messages Feature
const starredMessagesBtn = document.getElementById('starredMessagesBtn');
const starredMessagesModal = document.getElementById('starredMessagesModal');
const closeStarredBtn = document.getElementById('closeStarredBtn');

if (starredMessagesBtn) {
    starredMessagesBtn.addEventListener('click', () => {
        menuModal.classList.add('hidden');
        loadStarredMessages();
        starredMessagesModal.classList.remove('hidden');
    });
}

if (closeStarredBtn) {
    closeStarredBtn.addEventListener('click', () => {
        starredMessagesModal.classList.add('hidden');
    });
}

function loadStarredMessages() {
    socket.emit('get-starred-messages');
}

socket.on('starred-messages', (messages) => {
    displayStarredMessages(messages);
});

function displayStarredMessages(messages) {
    const starredMessagesList = document.getElementById('starredMessagesList');
    if (!starredMessagesList) return;
    
    starredMessagesList.innerHTML = '';
    
    if (messages.length === 0) {
        starredMessagesList.innerHTML = '<p style="color: var(--text-secondary); padding: 20px; text-align: center;">No starred messages</p>';
        return;
    }
    
    messages.forEach(msg => {
        const item = document.createElement('div');
        item.className = 'starred-message-item';
        
        item.innerHTML = `
            <div class="starred-message-header">
                <div class="user-avatar" style="background: ${msg.avatar}">
                    ${msg.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style="color: var(--text-primary); font-weight: 500;">${msg.username}</div>
                    <div class="starred-message-time">${getTimeAgo(msg.timestamp)}</div>
                </div>
            </div>
            <div class="starred-message-text">${msg.text}</div>
        `;
        
        starredMessagesList.appendChild(item);
    });
}

function toggleStarMessage(messageId) {
    if (starredMessages.has(messageId)) {
        starredMessages.delete(messageId);
        socket.emit('unstar-message', messageId);
    } else {
        starredMessages.add(messageId);
        socket.emit('star-message', messageId);
    }
}

// Broadcast Lists Feature
const broadcastListBtn = document.getElementById('broadcastListBtn');
const broadcastModal = document.getElementById('broadcastModal');
const closeBroadcastBtn = document.getElementById('closeBroadcastBtn');
const broadcastForm = document.getElementById('broadcastForm');

if (broadcastListBtn) {
    broadcastListBtn.addEventListener('click', () => {
        menuModal.classList.add('hidden');
        loadBroadcastRecipients();
        broadcastModal.classList.remove('hidden');
    });
}

if (closeBroadcastBtn) {
    closeBroadcastBtn.addEventListener('click', () => {
        broadcastModal.classList.add('hidden');
    });
}

async function loadBroadcastRecipients() {
    const response = await fetch(`/api/user/${currentUser.id}/friends`);
    const data = await response.json();
    
    const recipientsEl = document.getElementById('broadcastRecipients');
    if (!recipientsEl) return;
    
    recipientsEl.innerHTML = '';
    
    if (data.success && data.friends) {
        data.friends.forEach(friend => {
            const item = document.createElement('div');
            item.className = 'recipient-item';
            
            item.innerHTML = `
                <input type="checkbox" value="${friend.id}" id="recipient-${friend.id}">
                <div class="user-avatar" style="background: ${friend.avatar}">
                    ${friend.username.charAt(0).toUpperCase()}
                </div>
                <div class="recipient-info">
                    <div class="recipient-name">${friend.username}</div>
                </div>
            `;
            
            recipientsEl.appendChild(item);
        });
    }
}

if (broadcastForm) {
    broadcastForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('broadcastName').value.trim();
        const checkboxes = document.querySelectorAll('#broadcastRecipients input[type="checkbox"]:checked');
        const recipients = Array.from(checkboxes).map(cb => cb.value);
        
        if (name && recipients.length > 0) {
            const broadcast = {
                id: Date.now(),
                name: name,
                recipients: recipients,
                createdBy: currentUser.id,
                createdAt: new Date().toISOString()
            };
            
            socket.emit('create-broadcast-list', broadcast);
            broadcastModal.classList.add('hidden');
            broadcastForm.reset();
            alert(`Broadcast list "${name}" created with ${recipients.length} recipients!`);
        } else {
            alert('Please enter a name and select at least one recipient.');
        }
    });
}

// Archived Chats Feature
const archivedChatsBtn = document.getElementById('archivedChatsBtn');
const archivedCount = document.getElementById('archivedCount');

if (archivedChatsBtn) {
    archivedChatsBtn.addEventListener('click', () => {
        alert('Archived chats feature - Coming soon!');
    });
}

function archiveChat(chatId) {
    archivedChats.add(chatId);
    socket.emit('archive-chat', chatId);
    updateArchivedCount();
}

function unarchiveChat(chatId) {
    archivedChats.delete(chatId);
    socket.emit('unarchive-chat', chatId);
    updateArchivedCount();
}

function updateArchivedCount() {
    if (archivedCount) {
        archivedCount.textContent = archivedChats.size;
    }
}

// Utility Functions
function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    
    return time.toLocaleDateString();
}

// Initialize features when user is authenticated
socket.on('authenticated', (data) => {
    if (myStatusAvatar && data.user) {
        myStatusAvatar.style.backgroundColor = data.user.avatar;
        myStatusAvatar.textContent = data.user.username.charAt(0).toUpperCase();
    }
});

console.log('WhatsApp features loaded successfully!');
