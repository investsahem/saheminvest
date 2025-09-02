#!/usr/bin/env node

/**
 * Database Synchronization Script
 * Syncs schema and data between local PostgreSQL and Neon production database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Database URLs from .env
const NEON_URL = "postgres://neondb_owner:npg_a1UtIzmvcO7g@ep-bitter-haze-a2gakcp4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const LOCAL_URL = "postgresql://postgres:password@localhost:5432/sahaminvest";

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n📋 ${description}`, 'blue');
  try {
    const result = execSync(command, { stdio: 'inherit', encoding: 'utf8' });
    log(`✅ ${description} completed`, 'green');
    return result;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    throw error;
  }
}

async function syncDatabases(direction = 'to-local') {
  log('🔄 Starting Database Synchronization...', 'yellow');
  
  if (direction === 'to-local') {
    log('\n📥 Syncing FROM Neon (production) TO Local database', 'blue');
    
    // 1. Update local database schema
    log('\n1️⃣ Updating local database schema...', 'yellow');
    process.env.DATABASE_URL = LOCAL_URL;
    runCommand('npx prisma db push', 'Push schema to local database');
    
    // 2. Generate migration from current state
    log('\n2️⃣ Creating migration from current state...', 'yellow');
    runCommand('npx prisma migrate dev --name sync-from-production --create-only', 'Create migration');
    
    // 3. Apply to production to ensure sync
    log('\n3️⃣ Ensuring production database is up to date...', 'yellow');
    process.env.DATABASE_URL = NEON_URL;
    runCommand('npx prisma db push', 'Update production database');
    
  } else if (direction === 'to-production') {
    log('\n📤 Syncing FROM Local TO Neon (production) database', 'blue');
    
    // 1. Update production database schema
    log('\n1️⃣ Updating production database schema...', 'yellow');
    process.env.DATABASE_URL = NEON_URL;
    runCommand('npx prisma db push', 'Push schema to production database');
    
    // 2. Update local database to match
    log('\n2️⃣ Ensuring local database matches...', 'yellow');
    process.env.DATABASE_URL = LOCAL_URL;
    runCommand('npx prisma db push', 'Update local database');
  }
  
  // 4. Generate fresh Prisma client
  log('\n4️⃣ Generating Prisma client...', 'yellow');
  runCommand('npx prisma generate', 'Generate Prisma client');
  
  log('\n✅ Database synchronization completed successfully!', 'green');
}

async function seedBothDatabases() {
  log('\n🌱 Seeding both databases with initial data...', 'yellow');
  
  // Seed local database
  log('\n📥 Seeding local database...', 'blue');
  process.env.DATABASE_URL = LOCAL_URL;
  runCommand('npx tsx prisma/seed.ts', 'Seed local database');
  
  // Seed production database
  log('\n📤 Seeding production database...', 'blue');
  process.env.DATABASE_URL = NEON_URL;
  runCommand('npx tsx prisma/seed.ts', 'Seed production database');
  
  log('\n✅ Both databases seeded successfully!', 'green');
}

async function checkDatabaseStatus() {
  log('\n🔍 Checking database status...', 'yellow');
  
  try {
    log('\n📊 Local Database Status:', 'blue');
    process.env.DATABASE_URL = LOCAL_URL;
    runCommand('npx prisma db pull --print', 'Check local database schema');
    
    log('\n📊 Production Database Status:', 'blue');  
    process.env.DATABASE_URL = NEON_URL;
    runCommand('npx prisma db pull --print', 'Check production database schema');
    
  } catch (error) {
    log('⚠️ One or both databases may not be accessible', 'yellow');
  }
}

// Main execution
const command = process.argv[2];
const direction = process.argv[3] || 'to-local';

switch (command) {
  case 'sync':
    syncDatabases(direction);
    break;
  case 'seed':
    seedBothDatabases();
    break;
  case 'status':
    checkDatabaseStatus();
    break;
  case 'setup':
    log('🚀 Setting up both databases...', 'yellow');
    syncDatabases('to-local')
      .then(() => seedBothDatabases())
      .then(() => log('\n🎉 Setup completed! Both databases are ready.', 'green'));
    break;
  default:
    log('\n📖 Database Sync Usage:', 'blue');
    log('  node scripts/sync-databases.js sync [to-local|to-production]  - Sync schema');
    log('  node scripts/sync-databases.js seed                           - Seed both databases');
    log('  node scripts/sync-databases.js status                        - Check database status');
    log('  node scripts/sync-databases.js setup                         - Complete setup');
    log('\n📝 Examples:', 'yellow');
    log('  node scripts/sync-databases.js setup                         - First time setup');
    log('  node scripts/sync-databases.js sync to-local                 - Sync from production to local');
    log('  node scripts/sync-databases.js sync to-production            - Sync from local to production');
    break;
}


