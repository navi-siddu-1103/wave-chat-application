# Security Policy

This document outlines the security measures implemented in the Wave Chat Application.

## Security Features Implemented

### 1. Authentication & Authorization

- **Phone-based OTP**: SMS verification for account creation and login
- **JWT Tokens**: Secure session management with access and refresh tokens
- **Token Rotation**: Automatic refresh token rotation for enhanced security
- **Expiration**: Access tokens expire after 7 days, refresh tokens after 30 days
- **Timing Attack Prevention**: Constant-time comparison for sensitive operations

### 2. Input Validation & Sanitization

- **Zod Schemas**: Runtime validation for all API inputs
- **Phone Number Validation**: International phone number format support
- **Length Limits**: Maximum limits enforced for all text inputs
- **Type Checking**: Strict TypeScript types throughout
- **XSS Prevention**: Input sanitization in all forms

### 3. Rate Limiting

- **Auth Endpoints**: 5 requests per 15 minutes
- **API Endpoints**: 60 requests per minute
- **Message Endpoints**: 10 messages per second (burst)
- **IP-based Tracking**: Rate limits tracked by IP address

### 4. Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 5. CORS Configuration

- **Whitelisted Origins**: Only configured domains allowed
- **Development Support**: Localhost variants for development
- **Credential Support**: Cookies and credentials handled securely

### 6. Error Handling

- **Generic Error Messages**: Production error messages don't expose details
- **Structured Logging**: All errors logged with context for debugging
- **Stack Traces**: Hidden from clients in production

### 7. Database Security

- **Connection Pooling**: Optimized and cached connections
- **Query Optimization**: Proper indexing for performance
- **No SQL Injection**: All queries use ORM abstraction
- **Environment Variables**: Credentials never hardcoded

## Security Best Practices

### Development

1. **Never commit secrets**: Use `.env.example` for configuration template
2. **Pre-commit hooks**: Enforce linting and type checking
3. **Code reviews**: All changes reviewed before merge
4. **Dependency audits**: Regular `npm audit` checks

### Production

1. **HTTPS Only**: All traffic encrypted with TLS 1.2+
2. **Secure Cookies**: HttpOnly, Secure, SameSite flags set
3. **CSRF Protection**: Double-submit cookie pattern
4. **CSP Headers**: Content Security Policy to prevent injection
5. **IP Whitelisting**: Optional admin IP restrictions

### Monitoring

1. **Rate Limit Alerts**: Notifications on repeated failures
2. **Audit Logging**: All authentication events logged
3. **Error Tracking**: Sentry integration for error monitoring
4. **Performance Monitoring**: Datadog for performance issues

## Secrets Management

### Environment Variables (Production)

Required secrets:
- `JWT_SECRET`: Min 32 characters
- `JWT_REFRESH_SECRET`: Min 32 characters
- `NEXTAUTH_SECRET`: Min 32 characters
- `MONGODB_URI`: Database connection string
- `GEMINI_API_KEY`: AI service key

### Secure Storage

- Use AWS Secrets Manager, Azure Key Vault, or similar
- Rotate secrets regularly
- Never version control `.env` files
- Use `.env.example` as template

## Vulnerability Disclosure

If you discover a security vulnerability, please email security@example.com instead of using the issue tracker.

### Vulnerability Report Format

```
Subject: Security Vulnerability Report - [Brief Description]

Description: Detailed explanation of the vulnerability
Severity: Critical/High/Medium/Low
Affected Version: [Version number]
Steps to Reproduce: [Steps]
Potential Impact: [Impact description]
Suggested Fix: [If applicable]
```

## Regular Security Audits

- **Dependencies**: Monthly audit with `npm audit`
- **Code Review**: All PRs reviewed for security issues
- **Penetration Testing**: Quarterly professional assessments
- **Dependency Updates**: Security patches applied immediately

## Compliance

### Data Protection

- **GDPR Compliant**: User data deletion on request
- **CCPA Compliant**: Privacy policy and data handling
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Retention Policy**: Clear data retention guidelines

### Logging & Auditing

- All authentication attempts logged
- API access logged with user identification
- Sensitive operations logged with audit trail
- Logs retained for 90 days minimum

## Incident Response

### Process

1. **Detection**: Security issue identified
2. **Containment**: Isolate affected systems
3. **Investigation**: Determine scope and cause
4. **Remediation**: Fix vulnerability
5. **Communication**: Notify affected users if necessary
6. **Documentation**: Document lessons learned

### Contacts

- **Security Team**: security@example.com
- **Incident Response**: incidents@example.com

## Security Checklist

- [ ] All secrets in `.env` and never in code
- [ ] HTTPS/TLS enabled in production
- [ ] Rate limiting active
- [ ] Security headers configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (ORM usage)
- [ ] XSS protection (input sanitization)
- [ ] CSRF tokens implemented
- [ ] Authentication properly implemented
- [ ] Authorization checks on all endpoints
- [ ] Sensitive data not logged
- [ ] Error messages don't leak information
- [ ] Dependencies up to date
- [ ] Pre-commit hooks enabled
- [ ] Code review process followed

## Third-party Security

- **npm Packages**: Vetted before installation
- **API Keys**: Scoped and rotated regularly
- **CDN**: Verified SSL certificates
- **Database**: Encryption enabled, backups secured

## Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)

## Updates

This security policy is reviewed and updated quarterly. Last updated: January 2024.

For questions about security, please contact: security@example.com
