# TimeCapsule Environment Setup Guide

This guide will help you configure all the required environment variables for your TimeCapsule project.

## Quick Start

1. Create a `.env.local` file in your project root
2. Copy the variables below and fill in your values
3. Restart your development server

## Required Environment Variables

### 1. JWT Secret (Required)
Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env.local`:
```bash
JWT_SECRET=your-generated-secret-here
```

### 2. GitHub OAuth (Required)

#### Step 1: Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: TimeCapsule
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

#### Step 2: Add to .env.local
```bash
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Google OAuth (Required)

#### Step 1: Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
7. Copy the **Client ID** and **Client Secret**

#### Step 2: Add to .env.local
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 4. Stripe Configuration (Required)

#### Step 1: Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a free account
3. Go to "Developers" → "API keys"
4. Copy your **Publishable key** and **Secret key**

#### Step 2: Create a Product and Price
1. Go to "Products" in Stripe Dashboard
2. Click "Add product"
3. Fill in product details
4. Add a price (e.g., $9.99/month)
5. Copy the **Price ID** (starts with `price_`)

#### Step 3: Add to .env.local
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
PRICE_ID=price_your_price_id_here
```

### 5. Database (Optional)
For local development, MongoDB will use the default connection:
```bash
MONGODB_URI=mongodb://127.0.0.1:27017/timecapsule
```

## Complete .env.local Example

```bash
# JWT Secret
JWT_SECRET=your-generated-jwt-secret-here

# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PRICE_ID=price_your_stripe_price_id

# Database (optional)
MONGODB_URI=mongodb://127.0.0.1:27017/timecapsule

# Environment
NODE_ENV=development
```

## Verification

After setting up your `.env.local` file:

1. Restart your development server: `npm run dev`
2. Visit `http://localhost:3000/debug`
3. All variables should show ✅ in the Environment Variables Check

## Troubleshooting

### Common Issues

1. **"Missing required environment variable"**
   - Make sure your `.env.local` file is in the project root
   - Check that variable names match exactly (case-sensitive)
   - Restart your development server after changes

2. **OAuth errors**
   - Verify callback URLs match exactly
   - Check that client IDs and secrets are correct
   - Ensure OAuth apps are properly configured

3. **Stripe errors**
   - Verify API keys are from the correct environment (test/live)
   - Check that price ID exists and is active
   - Ensure webhook endpoints are configured (if needed)

### Getting Help

- Check the debug page at `/debug` for detailed validation
- Review the error messages in the browser console
- Verify all required variables are set correctly

## Security Notes

- Never commit `.env.local` to version control
- Use different OAuth apps for development and production
- Use test Stripe keys for development
- Generate a unique JWT secret for each environment
