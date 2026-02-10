# DoodleSync

Collaborative online whiteboard and chat app for teams, classrooms, and friends. Draw, brainstorm, and chat in real time with room-based presence and admin controls.

## Features
- **Infinite Whiteboard**: Draw, sketch, and plan together using Tldraw.
- **Real-time Chat**: Integrated side chat with live presence and activity indicators.
- **Room System**: Create public or private rooms, invite others, and manage access.
- **Admin Controls**: Private room creators become admins and can share room IDs.
- **Presence & Activity**: See who's online, who's drawing, and who's typing.
- **Template Gallery**: Choose from pre-designed templates for brainstorming, planning, design, and more.
- **Help Center**: Comprehensive guides, FAQs, and keyboard shortcuts to get you started quickly.
- **User Authentication**: Sign up with email or Google OAuth, or continue as a guest.
- **Modern UI**: Beautiful gradient designs, animations, and dark mode support.
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices.
- **Responsive UI**: Works on desktop and mobile, with overlay chat on small screens.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
1. **Clone the repo**
   ```sh
   git clone https://github.com/Shivansh1251/DoodleSync.git
   cd DoodleSync
   ```
2. **Install dependencies**
   ```sh
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

### Running Locally
1. **Start the backend**
   ```sh
   cd backend
   node server.js
   ```
2. **Start the frontend**
   ```sh
   cd ../frontend
   npm run dev
   ```
3. **Open in browser**
   - Visit [http://localhost:5173](http://localhost:5173)

## Usage
- **Home Page**: Click "Start your whiteboard" to join or create a room.
- **Templates**: Browse the template gallery and choose a pre-designed template for your use case.
- **Help Center**: Access guides, tutorials, keyboard shortcuts, and FAQs.
- **Room Entry**: Enter your name, choose public/private, or create a private room (admin).
- **Board**: Draw, chat, and collaborate. Room ID is shown in chat for sharing.
- **Presence**: See who is online and their activity (drawing/writing).

## Tech Stack
- **Frontend**: React + Vite
- **Whiteboard**: Tldraw
- **Real-time**: Socket.IO
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT + Passport.js (Google OAuth)

## Contributing
Pull requests welcome! For major changes, open an issue first to discuss what you’d like to change.

## License
MIT

---

Made with ❤️ by Shivansh1251
