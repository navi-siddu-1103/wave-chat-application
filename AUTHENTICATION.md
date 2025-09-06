# Phone Authentication Setup Guide

This guide explains how to set up phone number authentication with MongoDB for the Wave chat application.

## Prerequisites

1. **MongoDB** - Either local installation or MongoDB Atlas account
2. **Twilio Account** (optional) - For real SMS verification
3. **Node.js** - Version 18 or higher

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update your `.env` file with the following variables:

   ```env
   # AI Configuration
   GEMINI_API_KEY=your_gemini_api_key_here

   # MongoDB Configuration
   MONGODB_URI=
   # Or for MongoDB Atlas: 

   # Authentication
   NEXTAUTH_SECRET=your_random_secret_here
   NEXTAUTH_URL=http://localhost:9002

   # Twilio SMS Configuration (Optional - will simulate SMS if not provided)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number

   # JWT Secret
   JWT_SECRET=your_jwt_secret_here
   ```

## MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service: `mongod`
3. Use connection string: ` use mongodb connection string`

### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI`
4. Whitelist your IP address

## Twilio Setup (Optional)

If you want real SMS verification:

1. Create account at [Twilio](https://www.twilio.com/)
2. Get Account SID, Auth Token, and phone number
3. Update environment variables

**Note**: If Twilio is not configured, the app will simulate SMS verification by logging codes to the console.

## Database Schema

The application automatically creates the following collections:

### Users Collection
```javascript
{
  _id: ObjectId,
  phoneNumber: String (unique),
  name: String,
  avatar: String,
  isVerified: Boolean,
  verificationCode: String,
  verificationExpires: Date,
  online: Boolean,
  lastSeen: Date,
  contacts: [ObjectId],
  blockedUsers: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Chats Collection
```javascript
{
  _id: ObjectId,
  type: 'direct' | 'group',
  name: String,
  description: String,
  avatar: String,
  participants: [ObjectId],
  admins: [ObjectId],
  lastMessage: ObjectId,
  lastActivity: Date,
  pinnedMessages: [ObjectId],
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  content: String,
  sender: ObjectId,
  chatId: ObjectId,
  messageType: 'text' | 'image' | 'file',
  reactions: [{
    emoji: String,
    users: [ObjectId]
  }],
  isPinned: Boolean,
  isEdited: Boolean,
  editedAt: Date,
  replyTo: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Endpoints

- **POST** `/api/auth/register` - Register new user with phone number
- **POST** `/api/auth/login` - Login with existing phone number  
- **POST** `/api/auth/verify` - Verify phone number with SMS code

### User Endpoints

- **GET** `/api/user/profile` - Get user profile (requires auth)
- **PUT** `/api/user/profile` - Update user profile (requires auth)

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Start the Genkit server (in another terminal):
   ```bash
   npm run genkit:watch
   ```

4. Open browser and navigate to `http://localhost:9002`

## Authentication Flow

1. **Registration/Login**: User enters phone number
2. **SMS Verification**: 6-digit code sent to phone
3. **Code Entry**: User enters verification code
4. **JWT Token**: App receives authentication token
5. **Persistent Session**: Token stored in localStorage

## Security Features

- Phone number validation and formatting
- SMS verification codes with expiration (10 minutes)
- JWT tokens for session management
- Password-less authentication
- Rate limiting for verification attempts

## Development Notes

- In development mode, SMS codes are logged to console if Twilio is not configured
- JWT tokens expire after 7 days
- MongoDB connection is cached for performance
- All API routes include proper error handling

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running locally
   - Verify connection string format
   - Check network access for Atlas

2. **SMS Not Sending**
   - Verify Twilio credentials
   - Check phone number format
   - Ensure sufficient Twilio balance

3. **JWT Token Issues**
   - Check JWT_SECRET is set
   - Clear localStorage if having auth issues
   - Verify token hasn't expired

### Debug Mode

To see detailed logs, add to your `.env`:
```env
NODE_ENV=development
DEBUG=true
```
