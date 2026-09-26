# DoodleSync

DoodleSync is a real-time collaborative whiteboard for teams, classrooms, and friends. Create a room, sketch ideas together, and keep the conversation beside the canvas.

## What you can do

- Draw and brainstorm together on a shared whiteboard with live cursors and presence.
- Chat in a room while ideas are taking shape.
- Start from a Moodboard, Weekly Planner, Storyboard, or a blank page.
- Sign in with email or Google, manage a profile, and collaborate in public or private rooms.
- Use the animated pencil sketch, page toss, and dustbin interactions on the home canvas.
- Switch between light and dark themes.

## Built with

- **Frontend:** React 19, Vite 7, Tailwind CSS 4, TypeScript, React Router, Motion, Three.js, tldraw, Socket.IO Client
- **Backend:** Node.js, Express 5, Socket.IO, MongoDB, Mongoose, Passport, JWT, Nodemailer

## Getting started

### Requirements

- Node.js 20 or newer and npm
- MongoDB, locally or through MongoDB Atlas
- Email credentials for email verification and password-reset emails (optional)
- Google OAuth credentials for Google sign-in (optional)

### 1. Get the project

```sh
git clone https://github.com/Shivansh1251/DoodleSync.git
cd DoodleSync
```

### 2. Configure the backend

```sh
cd backend
npm install
```

Create `backend/.env`:

```dotenv
PORT=4000
MONGODB_URI=mongodb://localhost:27017/doodlesync
JWT_SECRET=replace-with-a-long-random-secret
SESSION_SECRET=replace-with-another-long-random-secret
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Optional: configure email delivery
EMAIL_USER=you@example.com
EMAIL_PASSWORD=your-email-app-password

# Optional: configure Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

Keep real credentials in your local environment or deployment secret store—never commit `.env` files. `SESSION_SECRET` and `JWT_SECRET` must be unique, strong values in production.

### 3. Configure the frontend

In a second terminal, from the repository root:

```sh
cd frontend
npm install
```

Create `frontend/.env.local`:

```dotenv
VITE_SERVER_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000/api
VITE_SITE_URL=http://localhost:5173
```

Only put public configuration in `VITE_` variables; Vite bundles them into frontend files.

### 4. Run the app

Start the backend from `backend/`:

```sh
npm run dev
```

Start the frontend from `frontend/` in the second terminal:

```sh
npm run dev
```

Open <http://localhost:5173>.

## Useful commands

Run these from `frontend/`:

```sh
npm run lint         # Check the frontend source
npm run build        # Create the production frontend build
npm run build:budget  # Build and check JavaScript bundle budgets
```

Run `npm start` from `backend/` to start the backend without the development watcher.

## Contributing

Contributions, bug reports, and feature ideas are welcome. For substantial changes, open an issue first so the approach can be discussed.

1. Fork the repository and create a focused branch.
2. Make the change and run the relevant lint/build checks.
3. Open a pull request describing the change and how you verified it.
4. Follow the project’s [Code of Conduct](CODE_OF_CONDUCT.md).

## License

DoodleSync is licensed under the [MIT License](LICENSE).

## Made by

Made with care by [Shivansh Garg](https://github.com/Shivansh1251).
