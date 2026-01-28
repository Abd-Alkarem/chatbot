# Real-Time Chat Application

A modern, feature-rich chat application similar to WhatsApp/Telegram with user authentication, friends, groups, and dark mode!

## Features

### Core Features
- 💬 **Real-time messaging** with Socket.IO
- 🎤 **Voice Chat** - WebRTC-powered real-time voice communication
- 🔐 **User authentication** - Sign up and sign in with email
- 👥 **Friend system** - Add friends and manage friend requests
- 🏠 **Public & Private groups** - Create and join chat groups
- ⌨️ **Typing indicators** - see when others are typing
- 🌙 **Dark mode** - Toggle between light and dark themes
- ⚙️ **Settings panel** - Customize your experience
- 🎨 **Modern UI** - beautiful gradient design with smooth animations
- 📱 **Fully Responsive** - Optimized for all devices (desktop, tablet, mobile)
- 🎨 **Colorful avatars** - automatically generated for each user
- 🔔 **Notifications** - Get notified about messages and friend requests
- 🔊 **Voice Activity Detection** - See who's speaking in real-time
- 📲 **Mobile-Optimized** - Touch-friendly UI with hamburger menu

## How It Works

1. **Sign up** with username, email, and password
2. **Sign in** to access your account
3. **Add friends** by searching for users
4. **Create groups** (public or private)
5. **Join public groups** or get invited to private ones
6. **Chat in real-time** with friends and group members
7. **Customize settings** including dark mode
8. **Manage your profile** and preferences

## 🚀 Deploy for Free (Use with Friends Online!)

Want to host this chat app online so your friends can use it? Check out the **[DEPLOYMENT.md](DEPLOYMENT.md)** guide for step-by-step instructions to deploy for FREE on:
- **Render.com** (Recommended - easiest)
- Railway.app
- Fly.io
- Glitch.com

No credit card required! 🎉

## Installation

1. Navigate to the project directory:
```bash
cd chat-app
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the server:
```bash
npm start
```

The chat app will be available at: **http://localhost:3000**

## Usage

### Getting Started
1. Open `http://localhost:3000` in your browser
2. **Sign Up**: Click "Sign Up" tab and create an account with username, email, and password
3. **Sign In**: Use your credentials to log in
4. You'll automatically join the General group

### Managing Friends
1. Click the **Friends** tab in the sidebar
2. **Search for users** using the search bar
3. **Send friend requests** by clicking "Add Friend"
4. **Accept/Reject requests** in the Friend Requests section
5. View all your friends in the Friends list

### Creating Groups
1. Click the **Groups** tab in the sidebar
2. Click the "+" button next to "My Groups"
3. Enter group name, description, and select type:
   - **Public**: Anyone can join
   - **Private**: Invite-only
4. Click "Create Group"

### Joining Groups
- **Public Groups**: Click on any public group to join instantly
- **Private Groups**: Must be invited by a group admin
- Switch between groups by clicking them in the sidebar

### Chatting
- Type your message in the input field at the bottom
- Press Enter or click the send button
- Messages are sent in real-time to all group members
- See typing indicators when others are typing

### Voice Chat
- Click the **microphone button** (bottom right) to start voice chat
- Grant microphone permissions when prompted
- See all participants in the voice chat panel
- Voice activity indicator shows who's speaking (🔊/🔇)
- Click the button again to leave voice chat
- Works with multiple participants simultaneously using WebRTC

### Settings
1. Click the **Settings** icon (gear) in the sidebar header
2. **Appearance**: Toggle dark mode on/off
3. **Notifications**: Enable/disable notifications and sounds
4. **Profile**: Update your username and bio
5. **Account**: Logout when needed

### Mobile Usage
- **Hamburger Menu**: Tap the menu icon (top left) to open/close sidebar
- **Touch Optimized**: All buttons are sized for easy tapping (44px minimum)
- **Responsive Layout**: Adapts to all screen sizes:
  - 📱 Small phones (320px+)
  - 📱 Standard phones (375px+)
  - 📱 Large phones (480px+)
  - 📱 Tablets (768px+)
  - 💻 Desktops (1024px+)
- **Landscape Mode**: Optimized layouts for horizontal orientation
- **Auto-zoom Prevention**: Input fields prevent unwanted zoom on mobile

## Project Structure

```
chat-app/
├── server.js           # Express & Socket.IO server with authentication
├── database.js         # In-memory database for users, groups, friends
├── package.json        # Project dependencies
├── .gitignore         # Git ignore file
├── README.md          # This file
└── public/
    ├── auth.html      # Sign in/Sign up page
    ├── auth.css       # Authentication page styling
    ├── auth.js        # Authentication logic
    ├── index.html     # Main chat interface
    ├── styles.css     # Main app styling with dark mode
    └── script.js      # Client-side chat logic
```

## Technologies Used

- **Backend**: Node.js, Express, Socket.IO
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Session Management**: express-session
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Real-time**: WebSockets via Socket.IO
- **Voice Chat**: WebRTC (Peer-to-peer audio)
- **Audio Processing**: Web Audio API (voice activity detection)
- **Database**: In-memory storage (Map-based)
- **UUID**: For unique IDs
- **Responsive Design**: CSS Media Queries, Flexbox, CSS Grid

## Features Explained

### Authentication System
- **Sign Up**: Create account with username, email, and password
- **Sign In**: Secure login with JWT tokens
- **Password Security**: Passwords hashed with bcryptjs
- **Session Persistence**: Stay logged in with token storage
- **Auto-redirect**: Logged-in users skip auth page

### Friend System
- **Search Users**: Find users by username or email
- **Friend Requests**: Send and receive friend requests
- **Accept/Reject**: Manage incoming requests
- **Friends List**: View all your friends
- **Real-time Updates**: Get notified instantly

### Group System
- **Public Groups**: Anyone can discover and join
- **Private Groups**: Invite-only, admin-controlled
- **Group Creation**: Create unlimited groups
- **Member Management**: Admins can add members
- **Group Discovery**: Browse all public groups

### Settings & Customization
- **Dark Mode**: Beautiful dark theme with smooth transitions
- **Notifications**: Toggle browser notifications
- **Sound Effects**: Enable/disable message sounds
- **Profile Editing**: Update username and bio
- **Persistent Settings**: Saved to your account

### Real-Time Communication
- Messages sent and received instantly via WebSockets
- Typing indicators show when others are typing
- Online user count displayed
- Join/leave notifications
- Message history (last 100 messages per group)

### Voice Chat Features
- **WebRTC Technology**: Peer-to-peer voice communication
- **Low Latency**: Direct connections between users
- **Voice Activity Detection**: Automatic detection of who's speaking
- **Echo Cancellation**: Built-in audio processing for clear calls
- **Noise Suppression**: Reduces background noise
- **Auto Gain Control**: Normalizes audio levels
- **Multi-participant**: Support for group voice calls
- **Visual Indicators**: Real-time speaking status with animations
- **Easy Controls**: One-click to join/leave voice chat

### User Interface
- **Tabbed Sidebar**: Switch between Groups and Friends
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Polished user experience
- **Color-coded Avatars**: Unique colors for each user
- **Modern Modals**: Clean popup interfaces

## Testing with Multiple Users

To test the chat with multiple users:

1. **Create multiple accounts**:
   - Open the app in multiple browser windows/tabs
   - Sign up with different emails for each window
   - Use different usernames

2. **Test friend features**:
   - Search for users from one account
   - Send friend requests
   - Accept requests from another account
   - View friends list updates

3. **Test group features**:
   - Create public and private groups
   - Join public groups from different accounts
   - Add friends to private groups
   - Chat in real-time across accounts

4. **Test settings**:
   - Toggle dark mode and see instant changes
   - Update profiles and see changes reflected
   - Test notifications

5. **Watch real-time updates**:
   - See typing indicators
   - Observe online user counts
   - Notice join/leave notifications

## Customization

### Change Port
Edit the `PORT` variable in `server.js` or set an environment variable:
```bash
PORT=8080 npm start
```

### Modify Message History Limit
In `server.js`, find this line and change the number:
```javascript
if (messages.get(message.room).length > 100) {
```

### Customize Colors
Edit the `generateAvatar()` function in `database.js` to change avatar colors.

### Change JWT Secret
In production, change the JWT secret in `server.js`:
```javascript
const JWT_SECRET = 'your-secret-key-change-in-production';
```

### Customize Dark Mode Colors
Edit CSS variables in `styles.css` under `:root` and `body.dark-mode`.

## Security Notes

⚠️ **Important for Production**:
- Change the JWT secret to a strong, random value
- Use a real database (MongoDB, PostgreSQL, etc.) instead of in-memory storage
- Implement rate limiting for API endpoints
- Add input validation and sanitization
- Use HTTPS in production
- Implement proper session management
- Add CORS configuration for production domains

## Browser Support

Works in all modern browsers that support:
- WebSockets
- ES6 JavaScript
- CSS Grid and Flexbox
- WebRTC (for voice chat)
- Web Audio API (for voice detection)
- getUserMedia API (for microphone access)

**Recommended Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

**Mobile Browsers:**
- Chrome Mobile
- Safari iOS 14.3+
- Samsung Internet
- Firefox Mobile

## License

MIT
