# TimeCapsule Architecture

## Overview
TimeCapsule is a Next.js 15 application that allows users to create time capsules with messages that remain locked until future dates. The application features OAuth authentication, premium functionality via Stripe payments, secure data storage, and enterprise-grade security measures.

## Tech Stack
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4, React 19
- **Backend**: Next.js API Routes with comprehensive middleware
- **Database**: MongoDB with native driver and connection pooling
- **Authentication**: OAuth (Google, GitHub) with JWT tokens and HttpOnly cookies
- **Payments**: Stripe Payment Intents with validation
- **Security**: Rate limiting, input validation, security headers middleware
- **Development**: ESLint, TypeScript strict mode, Turbopack

## Core Functionality

### Time Capsule System
- **Message Storage**: Users create time capsules with custom messages (1-1000 characters)
- **Lock Mechanism**: Messages remain locked until specified unlock date (minimum 24 hours future)
- **Access Control**: Strict user ownership validation ensures data privacy
- **Free Tier**: 10 time capsules per user without payment
- **Premium Tier**: Unlimited capsules via Stripe payment integration

### User Management
- **OAuth Integration**: Google and GitHub authentication
- **Profile Management**: User data storage and updates
- **Premium Status**: Payment-based feature unlocking
- **Session Management**: JWT tokens with automatic refresh

## Security Features
- **Rate Limiting**: Configurable per-endpoint rate limiting with IP tracking
- **Input Validation**: Zod schemas for all user inputs with HTML sanitization
- **Security Headers**: Comprehensive middleware with CSP, HSTS, XSS protection
- **JWT Security**: Short-lived tokens (15 min), HttpOnly cookies, secure validation
- **Database Security**: User ownership checks, ObjectId validation, parameterized queries
- **OAuth Security**: State parameter validation, secure redirect handling, provider verification

## Authentication Flow
1. User clicks login with OAuth provider (Google/GitHub)
2. Client redirects to OAuth provider with encoded state parameter
3. OAuth callback processes authorization code and validates state
4. Server exchanges authorization code for access token
5. User profile fetched from provider and upserted in database
6. JWT access token created with user data and set as HttpOnly cookie
7. User redirected to main application with authentication complete
8. Client-side auth state updated via custom event system
9. Subsequent API calls authenticated via JWT cookie validation

## Database Models

### Users Collection
```typescript
{
  _id: ObjectId,
  email: string,
  name: string,
  avatar?: string,
  provider: 'google' | 'github',
  providerId: string,
  isPremium: boolean,
  premiumExpiresAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### TimeCapsules Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  message: string,
  deliveryDate: Date,
  isDelivered: boolean,
  deliveredAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Payments Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  stripePaymentIntentId: string,
  amount: number,
  currency: string,
  status: string,
  metadata?: object,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/complete` - Complete OAuth flow, set JWT cookie
- `GET /api/auth/config` - Get OAuth configuration and validation status
- `POST /api/auth/logout` - Clear authentication cookie
- `POST /api/auth/token` - Token management and validation
- `GET /api/session` - Get current user session from JWT

### User Management
- `GET /api/users?id={userId}` - Get user profile (own data only)
- `POST /api/users` - Create/update user profile
- `PATCH /api/users` - Update specific user profile fields

### Time Capsule Operations
- `GET /api/capsules` - Get user's time capsules with unlock status
- `POST /api/capsules` - Create new time capsule (respects free tier limits)
- `DELETE /api/capsules?id={capsuleId}` - Delete time capsule (ownership verified)

### Payment & Premium Features
- `POST /api/create-payment-intent` - Create Stripe payment intent for premium upgrade
- `GET /api/stripe/config` - Get Stripe configuration status and validation

### Development & Debugging
- `GET /api/debug/env` - Environment variable validation (development only)

## Rate Limiting Configuration
- **Auth endpoints**: 5 requests per 15 minutes per IP (stricter for security)
- **API endpoints**: 100 requests per 15 minutes per IP (general usage)
- **IP identification**: X-Forwarded-For, X-Real-IP headers for proper detection
- **Storage**: In-memory with automatic cleanup and reset
- **Bypass**: Configurable for development environments

## Input Validation System
- **Message validation**: 1-1000 characters with HTML sanitization to prevent XSS
- **Date validation**: Must be at least 24 hours in future, ISO date format required
- **Email validation**: RFC-compliant format and length validation
- **ID validation**: MongoDB ObjectId format validation for all database references
- **Schema validation**: Zod schemas for all API endpoints with comprehensive error messages

## Security Headers (Middleware Implementation)
- **Content Security Policy**: Restricts script sources, allows Stripe integration
- **HSTS**: Enforces HTTPS in production (max-age: 1 year)
- **X-Frame-Options**: DENY to prevent clickjacking attacks
- **X-Content-Type-Options**: nosniff to prevent MIME type confusion
- **X-XSS-Protection**: Legacy XSS protection for older browsers
- **Referrer-Policy**: strict-origin-when-cross-origin for privacy
- **Permissions-Policy**: Restricts camera, microphone, geolocation access

## Data Flow Architecture
1. **Authentication**: OAuth provider → JWT generation → HttpOnly cookie → API authorization
2. **Capsule Creation**: Client validation → Server validation → Database storage → Real-time UI update
3. **Data Retrieval**: JWT verification → User ownership validation → Database query → Response formatting
4. **Premium Features**: Stripe payment → Payment verification → Database update → Feature unlock
5. **Security**: Middleware headers → Rate limiting → Input validation → Database security

## Environment Validation System
- **Comprehensive validation**: All environment variables validated on startup
- **Helpful errors**: Clear messages with setup instructions for missing variables
- **Development tools**: Debug endpoint for configuration verification
- **Production safety**: Automatic fallbacks and secure defaults where appropriate
- **Setup guidance**: Direct links to OAuth provider setup pages

## Component Architecture

### Frontend Components
- **CreateCapsule**: Form with validation, payment integration, real-time limits
- **CapsuleList**: Display user capsules with unlock status and delete functionality  
- **LoginModal**: OAuth provider selection with error handling
- **PaymentModal**: Stripe integration with payment status tracking
- **UserProfile**: User data management and premium status display

### Backend Services
- **Database Service**: MongoDB operations with connection pooling
- **Authentication Service**: JWT management and OAuth integration
- **Validation Service**: Zod schemas and input sanitization
- **Rate Limiting Service**: IP-based request tracking with configurable limits
- **Payment Service**: Stripe integration with webhook handling

## Production Considerations
- **Environment Variables**: Comprehensive validation with secure configuration management
- **MongoDB Atlas**: Cloud database with SSL/TLS, network restrictions, regular backups
- **Vercel Deployment**: Edge functions, automatic HTTPS, environment variable management
- **Monitoring**: Rate limit tracking, error logging, security alerts, performance metrics
- **Backup Strategy**: Database backups, environment variable documentation, code repository
- **Security Updates**: Regular dependency updates, security patch management

## Performance Optimizations
- **Database Indexing**: Optimized queries for user capsules and authentication
- **Connection Pooling**: MongoDB connection reuse for better performance
- **Middleware Optimization**: Efficient security header application
- **Client-Side Caching**: Strategic caching of user data and configuration
- **Bundle Optimization**: Next.js automatic code splitting and optimization

## Development Experience
- **TypeScript Integration**: Strict mode with comprehensive type safety
- **Environment Validation**: Automatic validation with helpful error messages
- **Hot Reload**: Turbopack for fast development iteration
- **Code Quality**: ESLint configuration for consistent code standards
- **Debug Tools**: Development endpoint for configuration verification
- **Error Handling**: Comprehensive error boundaries and logging

## Security Implementation Checklist
- [x] JWT tokens with cryptographically secure secrets and short expiration
- [x] HttpOnly, Secure cookies with proper domain and path settings
- [x] Comprehensive rate limiting on all endpoints with IP-based tracking
- [x] Input validation and HTML sanitization using Zod schemas
- [x] Security headers middleware with CSP, HSTS, XSS protection
- [x] User ownership verification on all data operations
- [x] OAuth state parameter validation to prevent CSRF attacks
- [x] Database connection security with proper authentication
- [x] Comprehensive error handling and security-focused logging
- [x] Environment variable validation with secure defaults
- [x] Payment integration security with Stripe best practices
- [x] Regular security dependency updates and vulnerability scanning

## Scalability Considerations
- **Database Scaling**: MongoDB Atlas auto-scaling with proper indexing
- **Application Scaling**: Vercel edge functions with global distribution
- **Rate Limiting**: Configurable limits based on usage patterns
- **Caching Strategy**: Strategic use of browser and CDN caching
- **Payment Processing**: Stripe handles payment scaling and compliance
- **Monitoring**: Real-time performance and error tracking
- [x] Production environment template


