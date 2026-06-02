# Deployment Guide

This guide covers deploying the Wave Chat Application to production environments.

## Prerequisites

- Docker and Docker Compose installed
- MongoDB Atlas account or local MongoDB
- Cloud hosting account (AWS, Google Cloud, Azure, or Vercel)
- Environment variables configured

## Environment Variables

Create a `.env.production` file with required variables:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com
GEMINI_API_KEY=your_gemini_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
ALLOWED_ORIGINS=https://yourdomain.com
LOG_LEVEL=WARN
ENABLE_RATE_LIMITING=true
ENABLE_CSRF_PROTECTION=true
```

## Local Deployment with Docker

### 1. Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

The app will be available at `http://localhost:9002`

### 2. Manual Docker Build

```bash
# Build the image
docker build -t wave-chat:latest .

# Run the container
docker run -p 3000:3000 \
  -e MONGODB_URI=your_connection_string \
  -e JWT_SECRET=your_secret \
  -e NEXTAUTH_SECRET=your_secret \
  -e GEMINI_API_KEY=your_key \
  wave-chat:latest
```

## Cloud Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Sign in to [Vercel](https://vercel.com)
3. Click "New Project" and select your repository
4. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `NEXTAUTH_SECRET`
   - `GEMINI_API_KEY`
5. Click "Deploy"

### AWS (Using ECS/Fargate)

1. Create an ECR repository:
```bash
aws ecr create-repository --repository-name wave-chat
```

2. Build and push image:
```bash
docker build -t wave-chat:latest .
docker tag wave-chat:latest YOUR_ECR_URI:latest
docker push YOUR_ECR_URI:latest
```

3. Create ECS task definition with environment variables
4. Deploy using ECS service

### Google Cloud Run

1. Build and push to Container Registry:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/wave-chat
```

2. Deploy:
```bash
gcloud run deploy wave-chat \
  --image gcr.io/PROJECT_ID/wave-chat \
  --platform managed \
  --region us-central1 \
  --set-env-vars MONGODB_URI=your_uri,JWT_SECRET=your_secret
```

## Database Setup

### MongoDB Atlas (Recommended)

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Add to `MONGODB_URI` environment variable

### Local MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0-alpine

# Or install locally and run
mongod
```

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring & Logging

### Health Check Endpoint

```bash
curl https://yourdomain.com/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": "5ms"
    }
  }
}
```

### Application Monitoring

Set up monitoring using:
- **Datadog**: Ship logs and metrics
- **New Relic**: Application performance monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay and logging

Example Sentry setup:
```typescript
// In next.config.ts
const withSentry = require("@sentry/nextjs");

module.exports = withSentry({
  org: "your-org",
  project: "wave-chat",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // ... other config
});
```

## Performance Optimization

### Database Optimization

```bash
# Connect to MongoDB and create indexes
db.users.createIndex({ phoneNumber: 1 })
db.users.createIndex({ isVerified: 1 })
db.messages.createIndex({ chatId: 1, createdAt: -1 })
db.chats.createIndex({ participants: 1 })
```

### Caching Strategy

Consider adding Redis for:
- Session management
- Message caching
- Rate limit tracking

### CDN Configuration

- Use CloudFlare or AWS CloudFront for static assets
- Cache headers: `Cache-Control: public, max-age=31536000`

## Scaling Strategy

### Horizontal Scaling

1. Load Balancer (AWS ELB, Google Load Balancer)
2. Multiple app instances
3. Shared MongoDB database
4. Shared session store (Redis)

### Auto-Scaling

```yaml
# AWS Auto Scaling configuration
TargetValue: 70
PredefinedMetricSpecification:
  PredefinedMetricType: ASGAverageCPUUtilization
```

## Backup & Disaster Recovery

### MongoDB Backup

```bash
# Using mongodump
mongodump --uri "******cluster.mongodb.net/wave"

# Restore
mongorestore dump/
```

### Automated Backups

- Enable MongoDB Atlas backup
- Schedule daily backups
- Test restore procedures

## Security Checklist

- [ ] Enable HTTPS/TLS
- [ ] Set secure environment variables
- [ ] Enable rate limiting
- [ ] Enable CORS protection
- [ ] Set security headers
- [ ] Use strong passwords
- [ ] Enable 2FA for admin accounts
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Configure firewall rules

## Troubleshooting

### Application won't start

```bash
# Check logs
docker logs container_id

# Verify environment variables
docker exec container_id env | grep MONGODB_URI
```

### Database connection issues

```bash
# Test MongoDB connection
mongosh "******cluster.mongodb.net/wave"
```

### Performance issues

```bash
# Check app metrics
curl https://yourdomain.com/api/health

# Monitor database
mongosh
> db.stats()
> db.currentOp()
```

## Maintenance

### Regular Tasks

- Monitor disk space
- Review error logs
- Update dependencies monthly
- Test backup restoration
- Performance benchmarking

### Update Procedure

1. Test updates in staging
2. Schedule maintenance window
3. Create database backup
4. Update application
5. Run database migrations if needed
6. Monitor for errors

## Support

For issues or questions:
- Check [documentation](./AUTHENTICATION.md)
- Review logs in `/var/log/app/`
- Contact support team
