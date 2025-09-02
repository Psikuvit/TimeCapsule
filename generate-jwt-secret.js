#!/usr/bin/env node

/**
 * Generate JWT Secret for TimeCapsule
 * Run this script to generate a secure JWT secret
 */

const crypto = require('crypto');

console.log('🔐 Generating JWT Secret for TimeCapsule...\n');

// Generate a secure random string
const jwtSecret = crypto.randomBytes(32).toString('base64');

console.log('✅ Generated JWT Secret:');
console.log('='.repeat(50));
console.log(jwtSecret);
console.log('='.repeat(50));

console.log('\n📝 Add this to your .env.local file:');
console.log(`JWT_SECRET=${jwtSecret}`);

console.log('\n💡 Remember to:');
console.log('1. Copy the secret above');
console.log('2. Add it to your .env.local file');
console.log('3. Restart your development server');
console.log('4. Never share or commit this secret to version control');
