# Production Deployment Guide

## 🚀 Pre-Deployment Security Checklist

### 1. Environment Variables
- [ ] Set `NODE_ENV=production`
- [ ] Generate a strong `JWT_SECRET` (32+ random characters)
- [ ] Configure MongoDB connection string
- [ ] Set OAuth client secrets and redirect URIs
- [ ] Configure Stripe production keys

### 2. Security Configuration
- [ ] All API endpoints have rate limiting
- [ ] Input validation enabled on all endpoints
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] CORS properly configured

### 3. Database Security
- [ ] MongoDB Atlas with network access restrictions
- [ ] Database user with minimal required permissions
- [ ] Connection string uses SSL/TLS
- [ ] Regular backups enabled

## 🔐 Environment Variables Setup

### Required Variables
```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/timecapsule?retryWrites=true&w=majority

# JWT (REQUIRED - Generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secure-jwt-secret-here-minimum-32-characters

# OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_here
NODE_ENV=production
```

## 🌐 OAuth Configuration

### GitHub OAuth
1. Go to GitHub Developer Settings
2. Create new OAuth App
3. Set Authorization callback URL: `https://yourdomain.com/auth/callback`
4. Copy Client ID and Client Secret

### Google OAuth
1. Go to Google Cloud Console
2. Create new OAuth 2.0 Client ID
3. Set Authorized redirect URIs: `https://yourdomain.com/auth/callback`
4. Copy Client ID and Client Secret

## 🗄️ MongoDB Atlas Setup

### 1. Create Cluster
- Choose M0 (free) or higher tier
- Select region closest to your users
- Enable backup

### 2. Database Access
- Create database user with read/write permissions
- Use strong password
- Restrict network access to your deployment IPs

### 3. Network Access
- Add your deployment IP addresses
- Or use `0.0.0.0/0` for Vercel (less secure but required)

## 🚀 Vercel Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy
```bash
vercel --prod
```

### 3. Set Environment Variables
```bash
vercel env add JWT_SECRET
vercel env add MONGODB_URI
vercel env add GITHUB_CLIENT_ID
vercel env add GITHUB_CLIENT_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add GOOGLE_REDIRECT_URI
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add NODE_ENV
```

## 🔒 Security Best Practices

### 1. JWT Security
- Use strong, random secrets
- Keep tokens short-lived (15 minutes)
- Store in HttpOnly cookies
- Validate issuer and audience

### 2. Rate Limiting
- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 100 requests per 15 minutes
- Use IP-based identification

### 3. Input Validation
- Validate all user inputs
- Sanitize strings to prevent XSS
- Use Zod schemas for validation
- Limit input lengths

### 4. Database Security
- Use parameterized queries
- Validate ObjectId formats
- Implement user ownership checks
- Regular security audits

## 📊 Monitoring & Logging

### 1. Error Tracking
- Implement proper error logging
- Monitor rate limit violations
- Track authentication failures
- Monitor database performance

### 2. Security Monitoring
- Failed login attempts
- Suspicious IP addresses
- Unusual API usage patterns
- Database access logs

## 🧪 Testing

### 1. Security Testing
- Test rate limiting
- Verify input validation
- Check authentication flows
- Test authorization boundaries

### 2. Load Testing
- Test API endpoints under load
- Verify rate limiting effectiveness
- Monitor database performance
- Test OAuth flows

## 🚨 Incident Response

### 1. Security Breach
- Immediately rotate JWT_SECRET
- Review access logs
- Check for unauthorized access
- Update security measures

### 2. Rate Limit Abuse
- Monitor IP addresses
- Implement additional restrictions
- Consider CAPTCHA for auth endpoints
- Block malicious IPs

## 📚 Additional Resources

- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/security/)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

## ✅ Post-Deployment Verification

- [ ] All endpoints return proper security headers
- [ ] Rate limiting is working correctly
- [ ] Input validation is enforced
- [ ] Authentication flows work properly
- [ ] Database connections are secure
- [ ] OAuth redirects work correctly
- [ ] Stripe integration is functional
- [ ] Error handling is appropriate
- [ ] Logging is working correctly
- [ ] Monitoring is set up
