# 🕰️ TimeCapsule

A secure, production-ready Next.js application that allows users to create time capsules with messages that are unlocked at future dates. Built with enterprise-grade security features, OAuth authentication, Stripe payments, and comprehensive SEO optimization.

## ✨ Features

- **🔐 Secure Authentication**: OAuth with Google and GitHub using JWT tokens
- **🛡️ Enterprise Security**: Comprehensive rate limiting, input validation, security headers
- **💾 MongoDB Storage**: Scalable database with proper indexing and user ownership validation
- **💳 Premium Features**: Stripe integration for unlimited capsule creation (free users get 10 capsules)
- **📱 Modern UI**: Responsive design with Tailwind CSS and React 19
- **🚀 Production Ready**: Security headers, middleware, validation, comprehensive error handling
- **⏰ Time Capsule Logic**: Messages remain locked until their specified unlock date
- **🎯 User Experience**: Real-time updates, tab-based interface, payment integration
- **📄 Legal Compliance**: Complete Terms of Service, Privacy Policy, and Contact pages
- **🔍 SEO Optimized**: Comprehensive metadata, sitemap, robots.txt, and Google Analytics
- **📊 Analytics**: Integrated Google Analytics for tracking and insights

## 🏗️ Architecture

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4, React 19
- **Backend**: Next.js API Routes with comprehensive rate limiting and validation
- **Database**: MongoDB with native driver and proper user ownership checks
- **Authentication**: JWT tokens (15-min expiry) with HttpOnly, Secure cookies
- **Security**: Middleware with security headers, rate limiting, input validation, XSS protection
- **Payments**: Stripe Payment Intents with environment validation
- **SEO**: Sitemap generation, robots.txt, structured data, Open Graph tags
- **Analytics**: Google Analytics 4 integration with gtag.js
- **Development**: ESLint, TypeScript strict mode, environment validation utilities

## 🎯 Core Functionality

### Time Capsule System
- **Message Creation**: Users can create time capsules with custom messages
- **Future Unlock**: Messages are locked until their specified unlock date (minimum 24 hours)
- **Ownership Protection**: Users can only access their own capsules
- **Free Tier**: 10 free time capsules per user
- **Premium Tier**: Unlimited capsules via Stripe payment

### Security Model
- **Rate Limiting**: Auth endpoints (5/15min), API endpoints (100/15min)
- **Input Validation**: Zod schemas, HTML sanitization, date validation
- **Authentication**: OAuth providers with JWT token management
- **Authorization**: User ownership validation on all operations

### Legal & Compliance
- **Terms of Service**: Comprehensive legal terms and conditions
- **Privacy Policy**: Detailed data protection and privacy information
- **Contact Support**: Professional support page with FAQ
- **Support Email**: nacer.msi1@gmail.com for technical support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- OAuth apps (Google, GitHub)
- Stripe account (for premium features)
- Google Analytics account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd timecapsule
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate JWT Secret**
   ```bash
   npm run generate-jwt
   ```
   Copy the generated secret for the next step.

4. **Set up environment variables**
   Create a `.env.local` file in the project root:
   ```bash
   # MongoDB (defaults to local instance)
   MONGODB_URI=mongodb://127.0.0.1:27017/timecapsule
   
   # JWT (REQUIRED - Use the generated secret from step 3)
   JWT_SECRET=your-generated-jwt-secret
   
   # GitHub OAuth (REQUIRED)
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   
   # Google OAuth (REQUIRED)
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
   
   # Stripe (REQUIRED for premium features)
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   PRICE_ID=price_your_stripe_price_id
   
   # Google Analytics (Optional - for tracking)
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-T3Y3PT7SSZ
   ```

5. **Start MongoDB** (if using local instance)
   ```bash
   # Start MongoDB service
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Verify setup**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Visit [http://localhost:3000/debug](http://localhost:3000/debug) to check environment configuration

## 🔐 Security Features

### Rate Limiting
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **API endpoints**: 100 requests per 15 minutes per IP
- **IP identification**: Uses X-Forwarded-For and X-Real-IP headers

### Input Validation
- **Zod schemas**: Comprehensive validation for all user inputs
- **HTML sanitization**: Prevents XSS attacks on message content
- **Date validation**: Ensures unlock dates are 24+ hours in future
- **ObjectId validation**: Validates MongoDB ObjectId formats
- **Message limits**: 1-1000 characters with content sanitization

### Security Headers (via Middleware)
- **Content Security Policy (CSP)**: Restricts script and resource loading
- **HTTP Strict Transport Security (HSTS)**: Enforces HTTPS in production
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: XSS protection for older browsers
- **X-Content-Type-Options**: Prevents MIME sniffing attacks
- **Referrer-Policy**: Controls referrer information leakage
- **Permissions-Policy**: Restricts browser features

### Authentication Security
- **JWT tokens**: Short-lived (15 minutes) with secure secrets
- **HttpOnly cookies**: Prevents XSS access to tokens
- **OAuth state validation**: Prevents CSRF attacks during OAuth flow
- **User ownership checks**: All data access verified against user ownership

## 📁 Project Structure

```
```
timecapsule/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   │   ├── auth/          # Authentication routes
│   │   │   ├── capsules/      # Time capsule CRUD
│   │   │   ├── create-payment-intent/ # Stripe payment
│   │   │   ├── session/       # Session management
│   │   │   ├── stripe/        # Stripe configuration
│   │   │   └── users/         # User management
│   │   ├── auth/              # OAuth callback pages
│   │   ├── contact/           # Contact & Support page
│   │   ├── privacy/           # Privacy Policy page
│   │   ├── terms/             # Terms of Service page
│   │   ├── payment-success/   # Payment completion page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout with AuthProvider & SEO
│   │   ├── page.tsx           # Main application page
│   │   ├── sitemap.ts         # Auto-generated sitemap
│   │   └── robots.ts          # Search engine instructions
│   ├── components/            # React components
│   │   ├── CapsuleList.tsx    # Display user's capsules
│   │   ├── CreateCapsule.tsx  # Capsule creation form
│   │   ├── Footer.tsx         # Site footer with legal links
│   │   ├── JsonLd.tsx         # Structured data for SEO
│   │   ├── LoginModal.tsx     # OAuth authentication modal
│   │   ├── PaymentModal.tsx   # Stripe payment integration
│   │   └── UserProfile.tsx    # User profile management
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication state management
│   ├── lib/                   # Core utilities
│   │   ├── auth.ts           # Authentication utilities```
│   │   ├── database.ts       # MongoDB connection and services
│   │   ├── env-validation.ts # Environment variable validation
│   │   ├── jwt.ts            # JWT token management
│   │   ├── rate-limit.ts     # Rate limiting implementation
│   │   ├── stripe-client.ts  # Stripe client configuration
│   │   ├── stripe.ts         # Stripe server utilities
│   │   └── validation.ts     # Input validation schemas
│   ├── types/                 # TypeScript type definitions
│   │   └── capsule.ts        # Time capsule interfaces
│   ├── utils/                 # Helper functions
│   │   └── capsule.ts        # Capsule utility functions
│   └── middleware.ts          # Security headers middleware
├── public/                    # Static assets
├── generate-jwt-secret.js     # JWT secret generation utility
├── eslint.config.mjs         # ESLint configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration
├── tsconfig.json             # TypeScript configuration
├── ARCHITECTURE.md           # Technical architecture documentation
├── PRODUCTION_DEPLOYMENT.md  # Production deployment guide
├── SETUP_GUIDE.md           # Environment setup guide
└── README.md                # This file
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/complete` - Complete OAuth flow, set JWT cookie
- `GET /api/auth/config` - Get OAuth configuration
- `POST /api/auth/logout` - Clear authentication cookie
- `POST /api/auth/token` - Token management
- `GET /api/session` - Get current user session from JWT

### Users
- `GET /api/users?id={userId}` - Get user profile (own data only)
- `POST /api/users` - Create/update user profile
- `PATCH /api/users` - Update user profile (own data only)

### Time Capsules
- `GET /api/capsules` - Get user's time capsules
- `POST /api/capsules` - Create new time capsule (with limits)
- `DELETE /api/capsules?id={capsuleId}` - Delete time capsule (own only)

### Payments & Premium
- `POST /api/create-payment-intent` - Create Stripe payment intent
- `GET /api/stripe/config` - Get Stripe configuration status

### SEO & Metadata
- `GET /sitemap.xml` - Auto-generated sitemap for search engines
- `GET /robots.txt` - Search engine crawling instructions

## 📄 Legal & Compliance Pages

### Public Pages
- `/` - Main application (authentication required)
- `/terms` - Terms of Service and usage conditions
- `/privacy` - Privacy Policy and data protection information
- `/contact` - Contact & Support page with FAQ
- `/auth/callback` - OAuth callback handler

### Contact & Support
- **Email**: nacer.msi1@gmail.com
- **Response Time**: 24-48 hours (priority for premium users)
- **Support Coverage**: Technical issues, feature requests, account questions

## 🗄️ Database Schema

### Collections

#### Users Collection
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

#### TimeCapsules Collection
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

#### Payments Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  stripePaymentIntentId: string,
  amount: number,
  currency: string,
  status: string,
  createdAt: Date
}
```

### Database Indexes
- **Users**: Email uniqueness, Provider + ProviderId uniqueness
- **TimeCapsules**: userId for fast user capsule queries, deliveryDate for time-based queries
- **Payments**: userId for user payment history, stripePaymentIntentId for uniqueness

## 🚀 Deployment

### Vercel (Recommended)
1. **Install Vercel CLI**: `npm i -g vercel`
2. **Deploy**: `vercel --prod`
3. **Set environment variables** in Vercel dashboard or via CLI

### Environment Variables for Production
```bash
# Environment
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/timecapsule?retryWrites=true&w=majority

# JWT (Generate new for production)
JWT_SECRET=your-production-jwt-secret-32-chars-minimum

# GitHub OAuth (Production app)
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_production_github_id
GITHUB_CLIENT_SECRET=your_production_github_secret

# Google OAuth (Production app)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_production_google_id
GOOGLE_CLIENT_SECRET=your_production_google_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback

# Stripe (Live keys)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
PRICE_ID=price_your_live_price_id

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-T3Y3PT7SSZ
```

### Pre-Deployment Checklist
- [ ] Generate production JWT secret
- [ ] Create production OAuth apps with correct redirect URIs
- [ ] Set up MongoDB Atlas with proper security
- [ ] Configure Stripe live keys and products
- [ ] Test all environment variables
- [ ] Verify security headers in production
- [ ] Test OAuth flows with production URLs

## 🧪 Development & Testing

### Available Scripts
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm run generate-jwt # Generate JWT secret
```

### Environment Validation
- Visit `/debug` in development to check environment setup
- All required variables are validated on startup
- Helpful error messages for missing configuration

### Testing Checklist
- [ ] OAuth authentication flows (Google, GitHub)
- [ ] Time capsule creation and retrieval
- [ ] Free tier limits (10 capsules)
- [ ] Premium payment flow
- [ ] Rate limiting enforcement
- [ ] Input validation and sanitization
- [ ] Security headers verification

## 📊 Monitoring & Security

### Security Monitoring
- Rate limit violations and blocking
- Failed authentication attempts
- Suspicious IP address activity
- Database access pattern monitoring
- Input validation failure tracking

### Performance Monitoring
- API endpoint response times
- Database query performance optimization
- Error rates and categorization
- Authentication flow metrics

### Built-in Utilities
- Environment variable validation system
- Comprehensive error logging
- Rate limiting with IP tracking
- Security header enforcement via middleware

## 🛠️ Development Features

### Environment Validation System
- Automatic validation of all required environment variables
- Helpful setup instructions for missing variables
- Development debug page at `/debug`
- Clear error messages with setup URLs

### Security-First Development
- All API endpoints protected with rate limiting
- Comprehensive input validation using Zod
- User ownership validation on all operations
- Secure JWT token management with HttpOnly cookies

### Developer Experience
- TypeScript strict mode for type safety
- ESLint configuration for code quality
- Tailwind CSS v4 for modern styling
- Hot reload with Turbopack in development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

- **Quick Setup**: Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed environment configuration
- **Architecture**: Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical implementation details
- **Production Deployment**: See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for production setup and security
- **Environment Debugging**: Visit `/debug` in development for configuration validation
- **Issues**: Report bugs and feature requests via GitHub Issues

## 📋 Key Technologies

- **Framework**: Next.js 15 with App Router and React 19
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with native driver
- **Authentication**: JWT tokens with OAuth (Google, GitHub)
- **Payments**: Stripe Payment Intents
- **Security**: Comprehensive middleware, rate limiting, input validation
- **Development**: ESLint, Turbopack, environment validation

## 🙏 Acknowledgments

- **Next.js team** for the amazing framework and App Router
- **MongoDB** for the robust database solution
- **Stripe** for secure payment processing
- **OAuth providers** (Google, GitHub) for authentication services
- **Vercel** for seamless deployment and hosting
- **TypeScript team** for excellent type safety
- **Tailwind CSS** for modern utility-first styling

---

**Built with ❤️, security, and modern web standards in mind**

*TimeCapsule - Secure messages for your future self*
