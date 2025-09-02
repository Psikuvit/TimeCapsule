## TimeCapsule Architecture

### Overview
TimeCapsule is a Next.js 14 application that allows users to create time capsules with messages that are delivered at future dates. The application includes OAuth authentication, premium features via Stripe, and secure data storage.

### Tech Stack
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with native driver
- **Authentication**: OAuth (Google, GitHub) with JWT tokens
- **Payments**: Stripe Payment Intents
- **Security**: Rate limiting, input validation, security headers

### Security Features
- **Rate Limiting**: All API endpoints protected against abuse
- **Input Validation**: Zod schemas for all user inputs
- **Security Headers**: CSP, HSTS, XSS protection, CSRF protection
- **JWT Security**: Short-lived tokens (15 min), HttpOnly cookies, issuer/audience validation
- **Database Security**: User ownership checks, ObjectId validation, parameterized queries
- **OAuth Security**: State parameter validation, secure redirect handling

### Authentication Flow
1. User clicks login with OAuth provider
2. Redirect to OAuth provider with encoded state parameter
3. OAuth callback processes authorization code
4. Server exchanges code for access token
5. User profile fetched and upserted in database
6. JWT access token created and set as HttpOnly cookie
7. User redirected to main application
8. Client-side auth state updated via custom event

### Database Models
- **Users**: OAuth profiles, premium status, timestamps
- **TimeCapsules**: Messages, delivery dates, user ownership
- **Payments**: Stripe payment intents, user associations
- **UserSettings**: User preferences and configurations

### API Endpoints

#### Authentication
- `POST /api/auth/complete` - Complete OAuth flow, set JWT cookie
- `GET /api/session` - Get current user session from JWT
- `POST /api/auth/logout` - Clear authentication cookie

#### Users
- `GET /api/users?id={userId}` - Get user profile (own data only)
- `PATCH /api/users` - Update user profile (own data only)
- `POST /api/users` - Update user profile (own data only)

#### Capsules
- `GET /api/capsules` - Get user's time capsules
- `POST /api/capsules` - Create new time capsule
- `DELETE /api/capsules?id={capsuleId}` - Delete time capsule

#### Payments
- `POST /api/create-payment-intent` - Create Stripe payment intent

### Rate Limiting
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **API endpoints**: 100 requests per 15 minutes per IP
- **IP identification**: X-Forwarded-For, X-Real-IP headers

### Input Validation
- **Message validation**: 1-1000 characters, HTML sanitization
- **Date validation**: Must be 24+ hours in future
- **Email validation**: Format and length validation
- **ID validation**: ObjectId format validation

### Security Headers
- **Content Security Policy**: Restricts script and resource loading
- **HSTS**: Enforces HTTPS in production
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: XSS protection for older browsers
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### Data Flow Summary
1. **Authentication**: OAuth → JWT → HttpOnly cookie → API calls
2. **Capsule Creation**: Client input → Validation → Database storage
3. **Data Retrieval**: JWT verification → User ownership check → Database query
4. **Premium Features**: Stripe payment → Database update → Feature unlock

### Production Considerations
- **Environment Variables**: Secure configuration management
- **MongoDB Atlas**: Cloud database with SSL/TLS
- **Vercel Deployment**: Edge functions, automatic HTTPS
- **Monitoring**: Rate limit tracking, error logging, security alerts
- **Backup**: Regular database backups, environment variable backups

### Security Checklist
- [x] JWT tokens with strong secrets
- [x] HttpOnly, Secure cookies
- [x] Rate limiting on all endpoints
- [x] Input validation and sanitization
- [x] Security headers middleware
- [x] User ownership verification
- [x] OAuth state validation
- [x] Database connection security
- [x] Error handling and logging
- [x] Production environment template


