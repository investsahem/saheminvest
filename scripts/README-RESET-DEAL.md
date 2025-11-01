# Reset Deal 13j4j6zh Script

## Purpose
This script resets deal `13j4j6zh` with clean test data to verify the profit distribution system works correctly.

## What It Does

1. **Clears existing data:**
   - Deletes all profit distributions
   - Deletes all distribution requests
   - Deletes all investments
   - Resets deal to ACTIVE status with $0 funding

2. **Creates 6 investors (if needed):**
   - Houssam EL Hallak: houssam.elhallak@sahaminvest.com
   - اسيا قلموني: asia.qalmoni@sahaminvest.com
   - رامز قلموني: ramez.qalmoni@sahaminvest.com
   - جليلة قلموني: jalila.qalmoni@sahaminvest.com
   - احمد علوان: ahmad.alwan@sahaminvest.com
   - عثمان حداد: othman.haddad@sahaminvest.com

3. **Creates investments (Total: $19,953):**
   - Date: 5/27/2025
   - Houssam: $4,953
   - Others: $3,000 each

4. **Creates Partial Distribution #1 (5/15/2025) - Total: $699.47:**
   - Houssam: $147.5266877
   - Others: $110.4946625 each

5. **Creates Partial Distribution #2 (5/27/2025) - Total: $700.00:**
   - Houssam: $200.00
   - Others: $100.00 each

## How to Run

### Prerequisites
- Node.js installed
- Database connection configured in `.env`
- Prisma client generated

### Execute

```bash
# From project root
node scripts/reset-deal-13j4j6zh.js
```

### Expected Output

```
🚀 Starting deal reset for 13j4j6zh...
============================================================

🗑️  Clearing existing data for deal 13j4j6zh...
   ✅ Deleted X profit distributions
   ✅ Deleted X distribution requests
   ✅ Deleted X investments
   ✅ Reset deal status and funding

👥 Ensuring investors exist...
   ✅ Investor exists: Houssam EL Hallak
   ...

💰 Creating investments...
   ✅ Houssam EL Hallak: $4953
   ✅ اسيا قلموني: $3000
   ...
   📊 Total funding: $19953

💸 Creating Partial Distribution #1 (2025-05-15)...
   ✅ Houssam EL Hallak: $147.53
   ✅ اسيا قلموني: $110.49
   ...
   📊 Total distributed: $699.47

💸 Creating Partial Distribution #2 (2025-05-27)...
   ✅ Houssam EL Hallak: $200.00
   ✅ اسيا قلموني: $100.00
   ...
   📊 Total distributed: $700.00

✅ Verifying deal state...

📊 Deal Summary:
   Deal ID: 13j4j6zh
   Status: ACTIVE
   Total Funding: $19953
   Investments: 6
   Profit Distributions: 12

👥 Per Investor Status:
   Houssam EL Hallak:
      Invested: $4953
      Received in Partials: $347.53 (2 distributions)
      Wallet Balance: $347.53
   اسيا قلموني:
      Invested: $3000
      Received in Partials: $210.49 (2 distributions)
      Wallet Balance: $210.49
   ...

💰 Total Partial Distributions: $1399.47

============================================================
✅ Deal reset completed successfully!
============================================================

📝 Next Steps:
   1. Partner can now submit FINAL distribution request
   2. Admin should see:
      - Historical partials: $1399.47
      - Final payment: Calculated after subtracting partials
      - Grand total: Complete picture
```

## After Running

### Verify in Database

```sql
-- Check investments
SELECT i.amount, u.name 
FROM Investment i
JOIN User u ON i.investorId = u.id
WHERE i.projectId = '13j4j6zh';

-- Check partial distributions
SELECT 
  u.name,
  pd.amount,
  pd.distributionDate,
  pd.profitPeriod
FROM ProfitDistribution pd
JOIN User u ON pd.investorId = u.id
WHERE pd.projectId = '13j4j6zh'
ORDER BY pd.distributionDate, u.name;

-- Check wallet balances
SELECT name, walletBalance, totalReturns
FROM User
WHERE email IN (
  'houssam.elhallak@sahaminvest.com',
  'asia.qalmoni@sahaminvest.com',
  'ramez.qalmoni@sahaminvest.com',
  'jalila.qalmoni@sahaminvest.com',
  'ahmad.alwan@sahaminvest.com',
  'othman.haddad@sahaminvest.com'
);
```

### Test Final Distribution

1. **Partner submits FINAL distribution:**
   - Log in as partner
   - Go to deal 13j4j6zh management
   - Submit FINAL distribution request with total profit/capital

2. **Admin reviews:**
   - Log in as admin
   - Go to Admin → Profit Distributions
   - Open the FINAL request for deal 13j4j6zh
   - Verify the UI shows:
     - ✅ Historical partials: $1,399.47
     - ✅ Final payment calculations (after subtracting partials)
     - ✅ Grand total reconciles correctly
     - ✅ Per-investor breakdown shows correct amounts

3. **Approve and verify:**
   - Approve the distribution
   - Check investor wallets
   - Verify no duplicate payments
   - Confirm totals match expectations

## Safety

⚠️ **IMPORTANT:** This script DELETES data. Only run on:
- Development environment
- Staging environment
- Production (with EXTREME caution and backup)

Always backup your database before running!

## Troubleshooting

### Issue: Investors don't exist
**Solution:** Script will create them automatically with role INVESTOR

### Issue: Deal doesn't exist
**Solution:** Ensure deal 13j4j6zh exists in the database first

### Issue: Foreign key constraints
**Solution:** Script deletes in correct order, but if issues persist, check for orphaned records

### Issue: Database connection error
**Solution:** Check your `.env` file has correct DATABASE_URL

## Expected Final State

After running this script, deal 13j4j6zh will have:

| Investor | Investment | Partial #1 | Partial #2 | Total Partials |
|----------|-----------|------------|------------|----------------|
| Houssam EL Hallak | $4,953 | $147.53 | $200.00 | $347.53 |
| اسيا قلموني | $3,000 | $110.49 | $100.00 | $210.49 |
| رامز قلموني | $3,000 | $110.49 | $100.00 | $210.49 |
| جليلة قلموني | $3,000 | $110.49 | $100.00 | $210.49 |
| احمد علوان | $3,000 | $110.49 | $100.00 | $210.49 |
| عثمان حداد | $3,000 | $110.49 | $100.00 | $210.49 |
| **TOTAL** | **$19,953** | **$699.47** | **$700.00** | **$1,399.47** |

The deal is now ready for FINAL distribution testing with the corrected calculation system!

