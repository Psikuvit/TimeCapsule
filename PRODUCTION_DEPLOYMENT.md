# Production Deployment Guide

This comprehensive guide covers deploying TimeCapsule to production with enterprise-grade security and performance considerations.

## 🚀 Pre-Deployment Security Checklist

### 1. Environment Variables Security
- [ ] Generate a **new, unique JWT_SECRET** for production (minimum 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB Atlas connection with SSL/TLS
- [ ] Set up production OAuth applications with correct redirect URIs
- [ ] Configure Stripe live API keys and webhook endpoints
- [ ] Verify all environment variables using the debug endpoint
- [ ] Document all environment variables securely

### 2. Security Configuration Verification
- [ ] All API endpoints properly protected with rate limiting
- [ ] Input validation enabled and tested on all endpoints
- [ ] Security headers configured via middleware
- [ ] HTTPS enforced in production environment
- [ ] CORS properly configured for production domains
- [ ] JWT tokens using secure, HttpOnly cookies
- [ ] User ownership validation on all data operations

### 3. Database Security
- [ ] MongoDB Atlas cluster with network access restrictions
- [ ] Database user with minimal required permissions (readWrite on specific database)
- [ ] Connection string uses SSL/TLS encryption
- [ ] Regular automated backups enabled and tested
- [ ] Database monitoring and alerting configured
- [ ] Connection pooling properly configured

## 🔐 Environment Variables Setup

### Required Production Variables
```bash
# Environment
NODE_ENV=production

# Database (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/timecapsule?retryWrites=true&w=majority&ssl=true

# JWT Security (CRITICAL - Generate new for production)
JWT_SECRET=your-super-secure-production-jwt-secret-minimum-32-characters

# GitHub OAuth (Production App)
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret

# Google OAuth (Production App)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback

# Stripe (Live Environment)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
PRICE_ID=price_your_live_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional Production Settings
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### JWT Secret Generation for Production
```bash
# Generate a cryptographically secure JWT secret
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or using the built-in utility
npm run generate-jwt
```

**CRITICAL**: Never reuse development JWT secrets in production!

## 🌐 OAuth Configuration for Production

### GitHub OAuth Production Setup
1. **Create Production OAuth App**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Create a new OAuth App (separate from development)
   - Application name: `TimeCapsule Production`
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://yourdomain.com/auth/callback`
   - Copy Client ID and generate Client Secret

2. **Security Considerations**
   - Use a separate OAuth app for production
   - Restrict callback URLs to your production domain only
   - Store client secret securely in environment variables
   - Monitor OAuth usage through GitHub's developer dashboard

### Google OAuth Production Setup
1. **Create Production OAuth 2.0 Client**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or use existing production project
   - Enable Google OAuth2 API
   - Create OAuth 2.0 Client ID for web application
   - Set authorized redirect URIs: `https://yourdomain.com/auth/callback`
   - Copy Client ID and Client Secret

2. **Production Security**
   - Use a separate Google Cloud project for production
   - Configure OAuth consent screen for production use
   - Set up domain verification if using custom domains
   - Monitor API usage and quotas

### OAuth Security Best Practices
- **Domain Verification**: Ensure callback URLs use your verified domain
- **HTTPS Only**: All OAuth callbacks must use HTTPS in production
- **Separate Applications**: Use different OAuth apps for each environment
- **Regular Monitoring**: Monitor OAuth usage and potential abuse
- **Access Scopes**: Request minimal required scopes from OAuth providers

## 🗄️ MongoDB Atlas Production Setup

### 1. Create Production Cluster
- **Cluster Tier**: Choose M10+ for production (M0 free tier not recommended for production)
- **Region Selection**: Select region closest to your users and deployment
- **Backup**: Enable continuous backups with point-in-time recovery
- **Monitoring**: Enable MongoDB Atlas monitoring and alerting

### 2. Database Security Configuration
- **Database Access**:
  - Create dedicated database user for production
  - Use strong, unique password (generated recommended)
  - Grant only `readWrite` permissions on the specific database
  - Enable database auditing if required

- **Network Access**:
  - **Vercel**: Add `0.0.0.0/0` (required for Vercel's dynamic IPs)
  - **Specific IPs**: If using dedicated servers, whitelist specific IP ranges
  - **VPC Peering**: For advanced security, consider VPC peering

### 3. Connection Configuration
```bash
# Production MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://produser:strongpassword@cluster.mongodb.net/timecapsule?retryWrites=true&w=majority&ssl=true
```

### 4. Performance Optimization
- **Connection Pooling**: Configured automatically by the MongoDB driver
- **Indexes**: Ensure proper indexes are created for performance
- **Read Preferences**: Configure appropriate read preferences for your use case
- **Write Concerns**: Use appropriate write concerns for data consistency

### 5. Monitoring and Alerts
- Set up alerts for:
  - High connection count
  - Slow queries
  - Disk space usage
  - CPU and memory usage
  - Failed authentication attempts

## 🚀 Vercel Deployment

### 1. Preparation
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Build and test locally first
npm run build
npm run start
```

### 2. Initial Deployment
```bash
# Deploy to preview environment first
vercel

# Deploy to production after testing
vercel --prod
```

### 3. Environment Variables Configuration

**Via Vercel CLI:**
```bash
# Set all required environment variables
vercel env add NODE_ENV
vercel env add JWT_SECRET
vercel env add MONGODB_URI
vercel env add NEXT_PUBLIC_GITHUB_CLIENT_ID
vercel env add GITHUB_CLIENT_SECRET
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add GOOGLE_REDIRECT_URI
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add PRICE_ID
```

**Via Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required variables for production
4. Ensure sensitive variables are marked as "Encrypted"

### 4. Custom Domain Setup
1. **Add Domain**: In Vercel dashboard, add your custom domain
2. **DNS Configuration**: Update DNS records as instructed by Vercel
3. **SSL Certificate**: Vercel automatically provisions SSL certificates
4. **Redirect Configuration**: Set up www to non-www redirects if needed

### 5. Production Verification
After deployment:
- [ ] Test all OAuth providers with production URLs
- [ ] Verify time capsule creation and retrieval
- [ ] Test payment flow with Stripe live mode
- [ ] Check security headers using security testing tools
- [ ] Verify rate limiting is working correctly
- [ ] Test error handling and logging

## 🔒 Production Security Best Practices

### 1. JWT Security Implementation
- **Strong Secrets**: Use cryptographically secure secrets (minimum 32 characters)
- **Short Expiration**: Keep tokens short-lived (15 minutes default)
- **Secure Storage**: Store in HttpOnly cookies with Secure flag
- **Token Validation**: Comprehensive issuer and audience validation
- **Secret Rotation**: Plan for regular JWT secret rotation

### 2. Rate Limiting Configuration
- **Auth Endpoints**: 5 requests per 15 minutes per IP (stricter for security)
- **API Endpoints**: 100 requests per 15 minutes per IP (adjustable based on usage)
- **IP Detection**: Proper handling of X-Forwarded-For headers for Vercel
- **Monitoring**: Track rate limit violations and potential abuse
- **Escalation**: Implement progressive restrictions for repeat offenders

### 3. Input Validation & Sanitization
- **Schema Validation**: Zod schemas for all API endpoints
- **HTML Sanitization**: Prevent XSS attacks on user-generated content
- **Length Limits**: Enforce reasonable input length restrictions
- **Character Filtering**: Filter potentially dangerous characters
- **Database Validation**: ObjectId format validation for database queries

### 4. Database Security Implementation
- **Connection Security**: SSL/TLS encryption for all database connections
- **Authentication**: Strong database user credentials with minimal permissions
- **Query Security**: Parameterized queries to prevent injection attacks
- **Access Control**: User ownership validation on all data operations
- **Audit Logging**: Track database access and modifications

### 5. Security Headers (Middleware Implementation)
```typescript
// Comprehensive security headers applied via middleware
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 📊 Monitoring & Logging Strategy

### 1. Application Monitoring
- **Error Tracking**: Implement comprehensive error logging and tracking
- **Performance Monitoring**: Track API response times and database query performance
- **Rate Limit Monitoring**: Monitor rate limit violations and IP patterns
- **Authentication Monitoring**: Track failed login attempts and suspicious activity
- **Payment Monitoring**: Monitor Stripe payment flows and failures

### 2. Security Monitoring Implementation
- **Failed Authentication Attempts**: Log and monitor OAuth failures
- **Suspicious IP Activity**: Track multiple failed attempts from single IPs
- **Rate Limit Violations**: Monitor and alert on rate limiting abuse
- **Database Access Patterns**: Unusual query patterns or access attempts
- **Input Validation Failures**: Track attempts to submit malicious input

### 3. Performance Metrics
- **API Endpoint Performance**: Response time distribution and error rates
- **Database Performance**: Query execution times and connection pool usage
- **Authentication Flow Performance**: OAuth completion times and success rates
- **Payment Processing Performance**: Stripe integration response times

### 4. Alerting Configuration
Set up alerts for:
- Application errors above threshold
- Database connection failures
- High rate limit violation rates
- Failed authentication attempt spikes
- Payment processing failures
- SSL certificate expiration warnings

### 5. Log Management
- **Structured Logging**: Use consistent log formats for better parsing
- **Log Retention**: Configure appropriate retention periods
- **Log Security**: Ensure logs don't contain sensitive information
- **Log Analysis**: Regular review of logs for security incidents

## 🧪 Production Testing Strategy

### 1. Pre-Deployment Testing
- **Environment Validation**: Test all environment variables using `/debug` endpoint
- **Security Headers**: Verify all security headers are properly set
- **Rate Limiting**: Test rate limits on all protected endpoints
- **Authentication Flows**: Test both Google and GitHub OAuth with production apps
- **Payment Integration**: Test Stripe payment flow with live API keys
- **Database Operations**: Verify all CRUD operations work correctly

### 2. Security Testing Checklist
- [ ] **Authentication Security**: Test OAuth flows with production credentials
- [ ] **Authorization**: Verify users can only access their own data
- [ ] **Input Validation**: Test all input validation and sanitization
- [ ] **Rate Limiting**: Confirm rate limits are enforced correctly
- [ ] **HTTPS Enforcement**: Verify all traffic is encrypted
- [ ] **Security Headers**: Check CSP, HSTS, and other security headers
- [ ] **JWT Security**: Test token expiration and validation
- [ ] **Database Security**: Verify connection encryption and access controls

### 3. Load Testing
- **API Endpoints**: Test performance under expected load
- **Database Performance**: Monitor query performance under load
- **Rate Limiting**: Verify rate limiting doesn't impact legitimate users
- **Authentication**: Test OAuth flows under concurrent load
- **Payment Processing**: Test Stripe integration with multiple concurrent payments

### 4. Integration Testing
- **End-to-End Flows**: Test complete user workflows
- **Cross-Browser Testing**: Verify functionality across different browsers
- **Mobile Responsiveness**: Test mobile interface and functionality
- **Payment Flows**: Complete payment testing with test cards
- **Error Handling**: Test error scenarios and recovery mechanisms

## 🚨 Incident Response & Recovery

### 1. Security Incident Response
- **Immediate Actions**:
  - Rotate JWT_SECRET immediately if compromised
  - Review and analyze access logs for unauthorized access
  - Check database for any unauthorized data modifications
  - Monitor for unusual API usage patterns
  - Update security measures and patch vulnerabilities

- **Investigation Process**:
  - Document the incident timeline and impact
  - Identify root cause and attack vectors
  - Assess data exposure and user impact
  - Implement additional security measures
  - Communicate with affected users if necessary

### 2. Rate Limiting Abuse Response
- **Detection**: Monitor rate limit violations and IP patterns
- **Response**: Implement additional IP-based restrictions
- **Mitigation**: Consider implementing CAPTCHA for auth endpoints
- **Prevention**: Update rate limiting rules based on abuse patterns

### 3. Database Recovery Procedures
- **Backup Strategy**: Regular automated backups with point-in-time recovery
- **Recovery Testing**: Regular testing of backup restoration procedures
- **Data Validation**: Verify data integrity after any recovery operations
- **Access Audit**: Review database access logs during incidents

### 4. Service Degradation Response
- **Performance Monitoring**: Real-time monitoring of API response times
- **Scaling Strategy**: Horizontal scaling through Vercel's infrastructure
- **Database Optimization**: Query optimization and index management
- **Graceful Degradation**: Implement fallback mechanisms for non-critical features

## ✅ Post-Deployment Verification Checklist

### Core Functionality
- [ ] **Authentication**: Both Google and GitHub OAuth work with production URLs
- [ ] **Time Capsule Creation**: Users can create capsules with future unlock dates
- [ ] **Time Capsule Retrieval**: Users can view their capsules and unlock status
- [ ] **Free Tier Limits**: 10 capsule limit enforced for free users
- [ ] **Premium Upgrade**: Stripe payment flow works correctly
- [ ] **User Profile**: Profile management and data updates work properly

### Security Verification
- [ ] **Security Headers**: All security headers present and properly configured
- [ ] **HTTPS Enforcement**: All traffic encrypted, HTTP redirects to HTTPS
- [ ] **Rate Limiting**: Rate limits enforced on all protected endpoints
- [ ] **Input Validation**: All user inputs properly validated and sanitized
- [ ] **Authentication Security**: JWT tokens secure with proper expiration
- [ ] **Database Security**: Connection encrypted, access properly restricted
- [ ] **OAuth Security**: State validation and secure redirect handling
- [ ] **Error Handling**: Sensitive information not exposed in errors

### Performance & Monitoring
- [ ] **API Response Times**: All endpoints respond within acceptable timeframes
- [ ] **Database Performance**: Queries execute efficiently under load
- [ ] **Error Tracking**: Comprehensive error logging and monitoring in place
- [ ] **Rate Limit Monitoring**: Rate limit violations tracked and alerted
- [ ] **Authentication Monitoring**: Failed login attempts monitored
- [ ] **Payment Monitoring**: Stripe integration monitored for failures

### Infrastructure
- [ ] **Domain Configuration**: Custom domain properly configured with SSL
- [ ] **Environment Variables**: All required variables set and validated
- [ ] **Database Connection**: Production database accessible and performant
- [ ] **Backup Strategy**: Automated backups configured and tested
- [ ] **Monitoring Setup**: Application and security monitoring operational
- [ ] **Alert Configuration**: Critical alerts configured and tested

## 📚 Additional Production Resources

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web application security risks
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/security/)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

### Monitoring & Performance
- [Vercel Analytics](https://vercel.com/analytics) - Performance monitoring
- [MongoDB Atlas Monitoring](https://docs.atlas.mongodb.com/monitoring/) - Database monitoring
- [Stripe Dashboard](https://dashboard.stripe.com/) - Payment monitoring

### Deployment & Infrastructure
- [Vercel Documentation](https://vercel.com/docs) - Platform documentation
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/) - Database platform
- [Stripe Integration Guide](https://stripe.com/docs) - Payment integration

## 🔄 Maintenance & Updates

### Regular Maintenance Tasks
- **Weekly**: Review error logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Security audit and penetration testing
- **Annually**: JWT secret rotation and OAuth app review

### Security Updates
- Monitor security advisories for all dependencies
- Implement security patches promptly
- Regular review of authentication and authorization logic
- Periodic review of rate limiting effectiveness

### Performance Optimization
- Regular database query optimization
- Monitor and optimize API response times
- Review and update caching strategies
- Analyze user behavior patterns for optimization opportunities

---

**🎉 Congratulations on deploying TimeCapsule to production!**

Your application is now running with enterprise-grade security and performance. Continue monitoring and maintaining the system for optimal user experience and security.
