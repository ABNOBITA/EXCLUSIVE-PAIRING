# Only U & ME 🚀

A futuristic, real-time messenger app designed for exactly two users to be paired together privately. Built with a **Live 2060** aesthetic, featuring glassmorphism, smooth animations, and a focus on intimate, private communication.

## ✨ Features

- **Private Pairing**: Connect with exactly one person using a unique secret code.
- **Real-Time Chat**: Instant messaging powered by Firebase Firestore.
- **Live 2060 Aesthetic**: Futuristic UI with glassmorphism, atmospheric backgrounds, and fluid animations.
- **Typing Indicators**: See when your partner is typing in real-time.
- **Message Deletion**: Delete your own messages with a secure confirmation dialog.
- **Emoji Picker**: Over 100 emojis to express yourself.
- **Smart Replies**: Quick, animated suggestions for common responses.
- **Secure Auth**: Google and Email/Password authentication.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4
- **Animations**: Framer Motion
- **Backend**: Firebase (Auth & Firestore)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- NPM or Yarn
- A Firebase Project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/only-u-and-me.git
   cd only-u-and-me
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   Create a `firebase-applet-config.json` in the root directory with your Firebase credentials:
   ```json
   {
     "apiKey": "YOUR_API_KEY",
     "authDomain": "YOUR_AUTH_DOMAIN",
     "projectId": "YOUR_PROJECT_ID",
     "storageBucket": "YOUR_STORAGE_BUCKET",
     "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
     "appId": "YOUR_APP_ID",
     "firestoreDatabaseId": "(default)"
   }
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 🔒 Security Rules

Ensure your Firestore security rules are configured to protect user data. A prototype `firestore.rules` file is included in the repository.

## 📄 License

This project is licensed under the Apache-2.0 License.
