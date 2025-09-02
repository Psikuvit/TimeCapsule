# 🕰️ TimeCapsule

A secure, production-ready Next.js application that allows users to create time capsules with messages that are delivered at future dates. Built with enterprise-grade security features, OAuth authentication, and Stripe payments.

## ✨ Features

- **🔐 Secure Authentication**: OAuth with Google and GitHub
- **🛡️ Enterprise Security**: Rate limiting, input validation, security headers
- **💾 MongoDB Storage**: Scalable database with proper indexing
- **💳 Premium Features**: Stripe integration for premium subscriptions
- **📱 Modern UI**: Responsive design with Tailwind CSS
- **🚀 Production Ready**: Security headers, validation, monitoring

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with rate limiting and validation
- **Database**: MongoDB with native driver
- **Authentication**: JWT tokens with HttpOnly cookies
- **Security**: Rate limiting, input validation, security headers
- **Payments**: Stripe Payment Intents

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- OAuth apps (Google, GitHub)
- Stripe account

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

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```bash
   # MongoDB
   MONGODB_URI=mongodb://127.0.0.1:27017/timecapsule
   
   # JWT (REQUIRED - Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
   JWT_SECRET=your-generated-jwt-secret
   
   # OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Start MongoDB** (if using local instance)
   ```bash
   # Start MongoDB service
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Security Features

### Rate Limiting
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **API endpoints**: 100 requests per 15 minutes per IP

### Input Validation
- Zod schemas for all user inputs
- HTML sanitization to prevent XSS
- Date validation (24+ hours in future)
- ObjectId format validation

### Security Headers
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options (clickjacking protection)
- X-XSS-Protection
- Referrer-Policy

### Authentication
- JWT tokens with short expiration (15 minutes)
- HttpOnly, Secure cookies
- OAuth state parameter validation
- User ownership verification

## 📁 Project Structure

```
timecapsule/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API endpoints
│   │   ├── auth/           # OAuth callback
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── lib/                # Utility libraries
│   ├── types/              # TypeScript types
│   └── utils/              # Helper functions
├── prisma/                 # Database schema (legacy)
├── public/                 # Static assets
├── .env.example           # Environment template
├── ARCHITECTURE.md        # Technical architecture
├── PRODUCTION_DEPLOYMENT.md # Deployment guide
└── README.md              # This file
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/complete` - Complete OAuth flow
- `GET /api/session` - Get current user session
- `POST /api/auth/logout` - Clear authentication

### Users
- `GET /api/users?id={userId}` - Get user profile
- `PATCH /api/users` - Update user profile

### Capsules
- `GET /api/capsules` - Get user's time capsules
- `POST /api/capsules` - Create new time capsule
- `DELETE /api/capsules?id={capsuleId}` - Delete capsule

### Payments
- `POST /api/create-payment-intent` - Create Stripe payment

## 🗄️ Database Schema

### Collections
- **users**: OAuth profiles, premium status
- **timeCapsules**: Messages, delivery dates, ownership
- **payments**: Stripe payment records
- **userSettings**: User preferences

### Indexes
- Email uniqueness
- Provider + ProviderId uniqueness
- User capsules by delivery date
- Payment intents uniqueness

## 🚀 Deployment

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Set environment variables in Vercel dashboard

### Environment Variables for Production
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-jwt-secret
GITHUB_CLIENT_ID=your_production_github_id
GITHUB_CLIENT_SECRET=your_production_github_secret
GOOGLE_CLIENT_ID=your_production_google_id
GOOGLE_CLIENT_SECRET=your_production_google_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 🧪 Testing

### Security Testing
- Test rate limiting
- Verify input validation
- Check authentication flows
- Test authorization boundaries

### Load Testing
- Test API endpoints under load
- Verify rate limiting effectiveness
- Monitor database performance

## 📊 Monitoring

### Security Monitoring
- Failed login attempts
- Rate limit violations
- Suspicious IP addresses
- Database access logs

### Performance Monitoring
- API response times
- Database query performance
- Error rates and types

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- **Deployment**: See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for production setup
- **Issues**: Report bugs and feature requests via GitHub Issues

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database
- Stripe for payment processing
- OAuth providers (Google, GitHub) for authentication

---

**Built with ❤️ and security in mind**
