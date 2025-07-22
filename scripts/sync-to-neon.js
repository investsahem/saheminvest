#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Starting database sync to Neon...\n');

// Read environment variables
require('dotenv').config();

const localDbUrl = process.env.DATABASE_URL;
const neonDbUrl = process.env.NEON_DATABASE_URL;

if (!localDbUrl || !neonDbUrl) {
  console.error('❌ Missing DATABASE_URL or NEON_DATABASE_URL in .env file');
  process.exit(1);
}

try {
  // Step 1: Generate migrations if there are schema changes
  console.log('📝 Checking for schema changes...');
  execSync('npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script > temp_diff.sql', { stdio: 'inherit' });
  
  const diffContent = fs.readFileSync('temp_diff.sql', 'utf8');
  if (diffContent.trim()) {
    console.log('📋 Schema changes detected, creating migration...');
    execSync('npx prisma migrate dev --name auto_sync', { stdio: 'inherit' });
  } else {
    console.log('✅ No schema changes detected');
  }
  
  // Step 2: Deploy migrations to Neon
  console.log('🚀 Deploying migrations to Neon...');
  execSync(`DATABASE_URL="${neonDbUrl}" npx prisma migrate deploy`, { stdio: 'inherit' });
  
  // Step 3: Optional - sync data (be careful with this in production)
  const syncData = process.argv.includes('--with-data');
  if (syncData) {
    console.log('📦 Syncing data to Neon (use with caution)...');
    // You can add data sync logic here if needed
    console.log('⚠️  Data sync not implemented - add your logic here');
  }
  
  console.log('\n✅ Database sync to Neon completed successfully!');
  
  // Cleanup
  if (fs.existsSync('temp_diff.sql')) {
    fs.unlinkSync('temp_diff.sql');
  }
  
} catch (error) {
  console.error('❌ Error during sync:', error.message);
  process.exit(1);
} 