# Development Guide

This guide helps developers set up and contribute to the Wave Chat Application.

## Project Setup

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- MongoDB 5+ (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- npm or yarn package manager
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/navi-siddu-1103/wave-chat-application.git
cd wave-chat-application

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Environment Configuration

Required variables in `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/wave

# JWT
JWT_SECRET=your_random_secret_min_32_chars
JWT_REFRESH_SECRET=your_random_refresh_secret_min_32_chars

# Authentication
NEXTAUTH_SECRET=your_random_nextauth_secret_min_32_chars
NEXTAUTH_URL=http://localhost:9002

# AI
GEMINI_API_KEY=your_gemini_api_key

# Optional: SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## Running the Application

### Development Mode

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start Genkit AI server (in separate terminal)
npm run genkit:watch
```

App available at: http://localhost:9002

### Production Mode

```bash
# Build application
npm run build

# Start production server
npm start
```

## Development Workflow

### Code Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Auth components
│   ├── chat/             # Chat components
│   └── ui/               # UI component library
├── contexts/             # React context
├── hooks/                # Custom React hooks
├── lib/                  # Utilities & helpers
├── models/               # MongoDB schemas
└── ai/                   # AI/Genkit integration
```

### Creating New Routes

1. **Create API endpoint**:
```typescript
// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, addSecurityHeaders } from '@/lib/security';
import { logger } from '@/lib/logger';

export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    logger.info('Fetching user', { userId: id });
    
    // Implementation
    return NextResponse.json({ user: {} });
  } catch (error) {
    logger.error('Error fetching user', error);
    throw error;
  }
});
```

2. **Validate inputs**:
```typescript
import { userSchema } from '@/lib/validation';

const userData = await userSchema.parseAsync(body);
```

3. **Add rate limiting**:
```typescript
import { apiRateLimiter } from '@/lib/rate-limit';

const rateLimitResponse = checkRateLimit(request, apiRateLimiter);
if (rateLimitResponse) return rateLimitResponse;
```

### Creating Components

```typescript
// src/components/user-card.tsx
import React from 'react';
import { Card } from '@/components/ui/card';

interface UserCardProps {
  userId: string;
  name: string;
  avatar?: string;
  online?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  userId,
  name,
  avatar,
  online,
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className={online ? 'text-green-500' : 'text-gray-500'}>
            {online ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
    </Card>
  );
};
```

### Database Operations

```typescript
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

export async function getUser(userId: string) {
  await dbConnect();
  
  const user = await User.findById(userId)
    .select('-verificationCode') // Exclude sensitive fields
    .lean(); // Return plain objects for better performance
  
  return user;
}
```

## Code Quality

### Running Linter

```bash
npm run lint
```

### Type Checking

```bash
npm run typecheck
```

### Both Together

```bash
npm run lint && npm run typecheck
```

### Fixing Issues

```bash
# ESLint will auto-fix most issues
npm run lint -- --fix

# Manual fixes for remaining issues
```

## Testing

### Run Tests

```bash
npm test
```

### Watch Mode

```bash
npm test -- --watch
```

### Coverage Report

```bash
npm test -- --coverage
```

See [TESTING.md](./TESTING.md) for detailed testing guide.

## Debugging

### VS Code Debugging

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "skipFiles": ["<node_internals>/**"],
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

### Browser DevTools

- Open DevTools (F12 or Cmd+Option+I)
- Network tab: Monitor API requests
- Console: Check for errors
- React DevTools: Inspect component state

### Server Logs

Check terminal output for:
- API request logs
- Database operations
- Error stack traces
- Performance metrics

## Git Workflow

### Branch Naming

```
feature/user-authentication
bugfix/message-read-status
docs/api-documentation
```

### Commits

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add user authentication"

# Push to remote
git push origin feature/your-feature

# Create Pull Request on GitHub
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code reorganization
- `test`: Adding tests
- `chore`: Maintenance

Example:
```
feat(auth): add JWT refresh token rotation

Implement automatic refresh token rotation for improved security.
Tokens now rotate on every refresh, invalidating old tokens.

Closes #123
```

## Performance Optimization

### Database Queries

```typescript
// Bad: Multiple queries
const user = await User.findById(userId);
const chats = await Chat.find({ participants: userId });

// Good: Parallel queries
const [user, chats] = await Promise.all([
  User.findById(userId),
  Chat.find({ participants: userId }),
]);

// Good: Lean queries (when you don't need full document)
const user = await User.findById(userId).lean();
```

### React Performance

```typescript
// Use React.memo for pure components
export const UserCard = React.memo(({ user }: Props) => (
  <div>{user.name}</div>
));

// Use useCallback for stable functions
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);

// Use useMemo for expensive calculations
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);
```

## Deployment

### Local Docker Deployment

```bash
docker-compose up -d
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide.

## Common Issues & Solutions

### MongoDB Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

Solution:
```bash
# Start MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Dependencies Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. **Read the guidelines**: Check [CONTRIBUTING.md](./CONTRIBUTING.md)
2. **Fork the repository**: Create your own copy
3. **Create feature branch**: Use naming convention above
4. **Write tests**: Cover your changes
5. **Follow code style**: Run `npm run lint --fix`
6. **Submit PR**: Include description and related issues

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Support

- **Discord**: Join our Discord community
- **GitHub Issues**: Report bugs or request features
- **Email**: dev@example.com

## Code Style

We follow ESLint and Prettier configurations. Auto-formatting runs on save if properly configured.

Key points:
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas
- 80 character line length where possible
- TypeScript strict mode enabled

## Additional Commands

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Run production build
npm start

# Database tests
node test-mongodb.js
```

Happy coding! 🚀
