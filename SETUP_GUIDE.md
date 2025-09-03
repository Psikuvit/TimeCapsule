# TimeCapsule Environment Setup Guide

This comprehensive guide will help you configure all required environment variables for your TimeCapsule project. The application includes a built-in validation system to ensure proper configuration.

## Quick Start

1. Create a `.env.local` file in your project root
2. Generate a JWT secret using the provided script
3. Set up OAuth applications (Google, GitHub)
4. Configure Stripe for premium features
5. Copy the configuration template and fill in your values
6. Verify setup using the debug endpoint

## Required Environment Variables

### 1. JWT Secret (REQUIRED)
Generate a secure JWT secret using the included utility:

```bash
npm run generate-jwt
```

Or generate manually:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env.local`:
```bash
JWT_SECRET=your-generated-secret-here
```

**Security Note**: Use a different secret for each environment (development, production).

### 2. GitHub OAuth (REQUIRED)

#### Step 1: Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: TimeCapsule (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Application description**: Time capsule application for future messages
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

#### Step 2: Add to .env.local
```bash
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**Note**: The client ID is public (NEXT_PUBLIC_), but the client secret must remain private.

### 3. Google OAuth (REQUIRED)

#### Step 1: Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the Google OAuth2 API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google OAuth2 API" and enable it
4. Create OAuth 2.0 Client ID:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (for development)
     - `https://yourdomain.com/auth/callback` (for production)
5. Copy the **Client ID** and **Client Secret**

#### Step 2: Add to .env.local
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

**Note**: The redirect URI should match exactly what you configured in Google Cloud Console.

### 4. Stripe Configuration (REQUIRED)

#### Step 1: Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a free account
3. Complete account verification
4. Go to "Developers" → "API keys"
5. Copy your **Publishable key** and **Secret key** (use test keys for development)

#### Step 2: Create a Product and Price
1. Go to "Products" in Stripe Dashboard
2. Click "Add product"
3. Fill in product details:
   - **Name**: TimeCapsule Premium
   - **Description**: Unlimited time capsules
4. Add a pricing model:
   - **Pricing model**: One-time or Recurring
   - **Price**: Set your desired amount (e.g., $9.99)
5. Save the product and copy the **Price ID** (starts with `price_`)

#### Step 3: Add to .env.local
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
PRICE_ID=price_your_price_id_here
```

**Important**: Use test keys (`sk_test_` and `pk_test_`) for development!

### 5. Database Configuration (OPTIONAL)
For local development, MongoDB will use the default connection. For production or custom setups:

```bash
# Local MongoDB (default)
MONGODB_URI=mongodb://127.0.0.1:27017/timecapsule

# MongoDB Atlas (production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/timecapsule?retryWrites=true&w=majority
```

**Development Note**: The application will automatically use the default local MongoDB connection if no URI is provided.

### 6. Additional Environment Variables (OPTIONAL)
```bash
# Development environment (automatically detected)
NODE_ENV=development
```

## Complete .env.local Template

```bash
# JWT Secret (REQUIRED - Generate with: npm run generate-jwt)
JWT_SECRET=your-generated-jwt-secret-here

# GitHub OAuth (REQUIRED)
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth (REQUIRED)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Stripe (REQUIRED)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PRICE_ID=price_your_stripe_price_id

# Database (OPTIONAL - defaults to local MongoDB)
MONGODB_URI=mongodb://127.0.0.1:27017/timecapsule

# Environment (OPTIONAL - auto-detected)
NODE_ENV=development
```

## Verification & Testing

After setting up your `.env.local` file:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Check the debug page**:
   Visit `http://localhost:3000/debug` to see:
   - ✅ All environment variables properly configured
   - ❌ Missing or incorrectly configured variables
   - ⚠️ Variables using default values

3. **Test authentication**:
   - Try logging in with Google
   - Try logging in with GitHub
   - Verify JWT tokens are set properly

4. **Test time capsule creation**:
   - Create a test time capsule
   - Verify it appears in your capsule list
   - Test the 10-capsule free tier limit

5. **Test payment flow** (optional):
   - Try to create more than 10 capsules
   - Payment modal should appear
   - Use Stripe test card numbers for testing

## Troubleshooting

### Common Issues

1. **"Missing required environment variable: JWT_SECRET"**
   - Run `npm run generate-jwt` to generate a secret
   - Copy the generated secret to your `.env.local` file
   - Restart your development server

2. **OAuth authentication errors**
   - Verify callback URLs match exactly (case-sensitive)
   - Check that client IDs and secrets are correct
   - Ensure OAuth apps are properly configured and not restricted
   - Make sure you're using the correct environment (development vs production)

3. **Stripe integration errors**
   - Verify you're using test API keys (starting with `sk_test_` and `pk_test_`)
   - Check that the price ID exists and is active in your Stripe dashboard
   - Ensure the price ID starts with `price_`

4. **Database connection issues**
   - Ensure MongoDB is running locally (if using local setup)
   - Check MongoDB Atlas connection string (if using cloud)
   - Verify network access and authentication credentials

5. **"Invalid or expired token" errors**
   - Clear browser cookies and try logging in again
   - Verify JWT_SECRET is consistent between restarts
   - Check that system time is correct (JWT tokens are time-sensitive)

### Getting Help

- **Debug page**: Visit `/debug` for detailed environment validation
- **Console errors**: Check browser developer console for specific error messages
- **Server logs**: Check terminal output for server-side errors
- **Documentation**: Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- **Issues**: Report problems via GitHub Issues with error details

## Security Best Practices

### Development Environment
- **Never commit `.env.local`** to version control (it's in .gitignore)
- Use **test API keys** for all services during development
- Generate a **unique JWT secret** for each environment
- Use **localhost URLs** for OAuth callback URLs in development

### Production Environment
- Generate a **new, secure JWT secret** for production
- Create **separate OAuth applications** for production with production URLs
- Use **live Stripe keys** only in production
- Set up **proper database security** with restricted network access
- **Rotate secrets** regularly and monitor for any security issues

### Environment Variable Security
- **JWT_SECRET**: Must be cryptographically secure (use the generator)
- **OAuth secrets**: Keep private, never expose in client-side code
- **Stripe keys**: Use appropriate environment (test vs live)
- **Database URI**: Include authentication and use SSL for remote connections

## Advanced Configuration

### Custom MongoDB Setup
If you're using a custom MongoDB setup:

```bash
# Local MongoDB with authentication
MONGODB_URI=mongodb://username:password@localhost:27017/timecapsule

# MongoDB Atlas with specific options
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/timecapsule?retryWrites=true&w=majority&ssl=true
```

### Multiple Environment Management
For managing multiple environments (development, staging, production):

1. Use different `.env.local`, `.env.staging`, `.env.production` files
2. Create separate OAuth applications for each environment
3. Use different Stripe accounts or separate test/live modes
4. Generate unique JWT secrets for each environment
5. Use environment-specific database instances

### Development vs Production URLs
Remember to update URLs when moving to production:

- **OAuth Callback URLs**: `http://localhost:3000/auth/callback` → `https://yourdomain.com/auth/callback`
- **Stripe Webhook URLs**: Add production webhook endpoints if using Stripe webhooks
- **Database URLs**: Switch from local MongoDB to production MongoDB Atlas

---

## Next Steps

After completing the setup:

1. **Start development**: `npm run dev`
2. **Test functionality**: Create time capsules, test authentication
3. **Review architecture**: Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
4. **Deploy to production**: Follow [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) when ready
