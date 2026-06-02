# Wave - Real-Time Chat Application

Wave is a modern, real-time chat application built with Next.js and powered by AI to provide a seamless and intelligent messaging experience. It's designed to be intuitive, feature-rich, highly performant, and secure.

## ✨ Features

### Core Messaging
- **Real-Time Chat**: Instantaneous message delivery in both direct and group chats.
- **Direct & Group Chats**: Easily create one-on-one conversations or group channels.
- **Message Management**: Edit and delete your sent messages.
- **Message Reactions**: React to messages with a variety of emojis.
- **Pinned Messages**: Pin important messages in any chat for quick access from the header.
- **Message Read Status**: Track who has read your messages.
- **Typing Indicators**: See when other users are typing.

### Social & Personalization
- **Online Presence**: See at a glance who is online with status indicators.
- **Contact Management**: Add new contacts to start direct conversations.
- **Group Creation**: Create new group channels with custom names and avatars.
- **Custom Avatars**: Upload profile and group photos directly from your device.
- **User Activity Tracking**: Track last seen and activity timestamps.

### AI-Powered Convenience
- **Smart Replies**: Get AI-generated suggestions for quick replies based on the conversation context.
- **Chat Summarization**: Catch up on long conversations instantly with AI-powered summaries.
- **Emoji Suggestions**: Receive relevant emoji suggestions as you type your message.

### Privacy & Security
- **Block Users**: Block users in direct messages to prevent unwanted communication.
- **Phone OTP Authentication**: Secure SMS-based authentication.
- **JWT Token Authentication**: Secure session management with token rotation.
- **Rate Limiting**: Protection against brute force and DOS attacks.
- **Input Validation**: Comprehensive input validation with Zod schemas.
- **Security Headers**: Protection against common web vulnerabilities.

### User Experience
- **Splash Screen**: A smooth loading animation is displayed when the app starts.
- **Responsive Design**: A seamless experience across desktop and mobile devices.
- **Health Check Endpoint**: Monitor application status.
- **Structured Logging**: Comprehensive logging for debugging and monitoring.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) for generative AI features.
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Validation**: [Zod](https://zod.dev/) for runtime type checking
- **Testing**: Jest, Playwright for E2E testing
- **Deployment**: Docker, GitHub Actions CI/CD

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or a compatible package manager
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/navi-siddu-1103/wave-chat-application.git
    cd wave-chat-application
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project:
    ```bash
    cp .env.example .env
    nano .env
    ```
    See [.env.example](./.env.example) for all available configuration options.

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

## 📚 Documentation

- **[Authentication Guide](./AUTHENTICATION.md)** - Phone OTP authentication setup and usage
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to production (Docker, Vercel, AWS, GCP)
- **[Security Policy](./SECURITY.md)** - Security features and best practices
- **[Testing Guide](./TESTING.md)** - Unit, integration, and E2E testing
- **[Development Guide](./DEVELOPMENT.md)** - Developer setup and workflow
- **[Twilio Setup](./TWILIO_SETUP.md)** - Optional: Real SMS verification with Twilio

## 🐳 Docker Deployment

### Local Development with Docker

```bash
# Start all services (MongoDB + App)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

App available at: `http://localhost:9002`

### Production Deployment

See [Deployment Guide](./DEPLOYMENT.md) for production deployment options.

## 🔒 Security

Wave implements comprehensive security measures:

- ✅ Phone OTP authentication
- ✅ JWT token-based sessions with refresh rotation
- ✅ Rate limiting on all endpoints
- ✅ Input validation with Zod schemas
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ CORS protection
- ✅ XSS prevention
- ✅ CSRF protection
- ✅ Structured error handling
- ✅ Secure database indexing

See [Security Policy](./SECURITY.md) for detailed information.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

See [Testing Guide](./TESTING.md) for comprehensive testing documentation.

## 📊 Project Structure

```
wave-chat-application/
├── src/
│   ├── app/              # Next.js app router and API routes
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities, helpers, and middleware
│   ├── models/           # MongoDB schemas
│   └── ai/               # AI and Genkit integration
├── .github/workflows/    # GitHub Actions CI/CD
├── docs/                 # Documentation
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose for local development
├── .env.example          # Environment variables template
├── AUTHENTICATION.md     # Authentication setup guide
├── DEPLOYMENT.md         # Deployment guide
├── DEVELOPMENT.md        # Development guide
├── SECURITY.md           # Security policy
├── TESTING.md            # Testing guide
├── TWILIO_SETUP.md       # Twilio SMS setup (optional)
└── README.md             # This file
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run genkit:dev` - Start Genkit AI server (one-time)
- `npm run genkit:watch` - Start Genkit AI server with watch mode
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests

## 🔄 Continuous Integration

The project uses GitHub Actions for automated:
- Linting and type checking
- Building
- Testing
- Security scanning
- Docker image building
- Deployment (when configured)

See [CI/CD Workflow](./.github/workflows/ci-cd.yml) for details.

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user with phone number
- `POST /api/auth/login` - Login with existing phone number
- `POST /api/auth/verify` - Verify phone number with SMS code
- `POST /api/auth/refresh` - Refresh access token with refresh token

### User Management
- `GET /api/user/profile` - Get current user profile (requires auth)
- `PUT /api/user/profile` - Update user profile (requires auth)

### Health
- `GET /api/health` - Application health check

See [Authentication Guide](./AUTHENTICATION.md#api-endpoints) for full API reference.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: add your feature"`
3. Push to remote: `git push origin feature/your-feature`
4. Create a Pull Request

See [Development Guide](./DEVELOPMENT.md) for detailed setup instructions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 📞 Support

For support and questions:
- 📧 Email: support@example.com
- 🐛 Report Issues: [GitHub Issues](https://github.com/navi-siddu-1103/wave-chat-application/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/navi-siddu-1103/wave-chat-application/discussions)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI Components from [shadcn/ui](https://ui.shadcn.com/)
- Database by [MongoDB](https://www.mongodb.com/)
- AI powered by [Google Genkit](https://firebase.google.com/docs/genkit)

---

**Happy Chatting! 🚀**
