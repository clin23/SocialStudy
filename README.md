# React Firebase Application

A modern React application with Firebase integration, featuring authentication, real-time updates, and a comprehensive task management system.

## Features

- 🔐 User Authentication
- 📅 Calendar Integration
- ✅ Todo List Management
- 👥 User Groups
- 📝 Session Recording
- 📱 Responsive Design
- 🔄 Real-time Updates

## Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # React components
├── constants/       # Application constants
├── context/         # React context providers
├── firebase/        # Firebase configuration
├── hooks/           # Custom React hooks
├── services/        # API and service functions
├── styles/          # Global styles and CSS
└── utils/           # Utility functions
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Firebase project and enable:
   - Authentication
   - Firestore Database
   - Storage (if needed)

4. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

5. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 