# Wave - Real-Time Chat Application

Wave is a modern, real-time chat application built with Next.js and powered by AI to provide a seamless and intelligent messaging experience. It's designed to be intuitive, feature-rich, and highly performant.

## ✨ Features

### Core Messaging
- **Real-Time Chat**: Instantaneous message delivery in both direct and group chats.
- **Direct & Group Chats**: Easily create one-on-one conversations or group channels.
- **Message Management**: Edit and delete your sent messages.
- **Message Reactions**: React to messages with a variety of emojis.
- **Pinned Messages**: Pin important messages in any chat for quick access from the header.

### Social & Personalization
- **Online Presence**: See at a glance who is online with status indicators.
- **Contact Management**: Add new contacts to start direct conversations.
- **Group Creation**: Create new group channels with custom names and avatars.
- **Custom Avatars**: Upload profile and group photos directly from your device.

### AI-Powered Convenience
- **Smart Replies**: Get AI-generated suggestions for quick replies based on the conversation context.
- **Chat Summarization**: Catch up on long conversations instantly with AI-powered summaries.
- **Emoji Suggestions**: Receive relevant emoji suggestions as you type your message.

### Privacy & Security
- **Block Users**: Block users in direct messages to prevent unwanted communication.

### User Experience
- **Splash Screen**: A smooth loading animation is displayed when the app starts.
- **Responsive Design**: A seamless experience across desktop and mobile devices.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) for generative AI features.
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or a compatible package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google AI API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```env
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the Next.js application, typically on `http://localhost:9002`.

2.  **Start the Genkit development server (in a separate terminal):**
    The Genkit server runs the AI flows. It's useful for testing and debugging your AI features.
    ```bash
    npm run genkit:watch
    ```

Now you can open your browser and navigate to the app's URL to start using Wave.
