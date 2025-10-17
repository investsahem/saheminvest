# Profit Distribution Testing Guide

## Quick Test Scenarios

### Prerequisites
1. Have at least one funded deal with investments
2. Have partner and admin accounts
3. Have some investor accounts with investments

---

## Test Scenario 1: Partial Profit Distribution (Simple)

### Setup
- Deal: $100,000 funded
- 3 Investors: $40k, $30k, $30k
- Profit: $10,000 (10% gain)

### Partner Submits
1. Go to partner portal → Deals → Select deal
2. Click "توزيع أرباح جديد" (New Distribution)
3. Select "توزيع جزئي" (Partial)
4. Enter:
   - Total Amount: $10,000
   - Profit Percentage: 10%
   - Deal Closing: 0%
5. Description: "First quarterly profit"
6. Submit

### Admin Reviews
1. Go to Admin → Profit Distributions
2. Click "تفاصيل" (Details) on the request
3. See partner's values displayed
4. Don't edit anything (test default values)
5. Verify preview shows:
   - Total Profit: $10,000
   - Sahem (10%): $1,000
   - Reserve (10%): $1,000
   - To Investors: $8,000
6. Click "موافقة وتوزيع الأرباح" (Approve)
7. Confirm

### Expected Results
- ✅ Investor A receives: $3,200 (40% of $8,000)
- ✅ Investor B receives: $2,400 (30% of $8,000)
- ✅ Investor C receives: $2,400 (30% of $8,000)
- ✅ All investors get notification
- ✅ Partner gets approval notification
- ✅ Wallets updated correctly
- ✅ No capital returned yet

---

## Test Scenario 2: Final Profit Distribution (With Editing)

### Setup
- Same deal as above
- Total collected: $120,000
- Profit: $20,000 (20% gain)
- Capital to return: $100,000

### Partner Submits
1. Select deal → "توزيع أرباح جديد"
2. Select "توزيع نهائي" (Final)
3. Enter:
   - Total Amount: $120,000
   - Profit Percentage: 20%
   - Deal Closing: 100%
4. Description: "Final distribution - successful exit"
5. Submit

### Admin Reviews & Edits
1. Go to Admin → Profit Distributions
2. Click "تفاصيل" on the request
3. **Edit values:**
   - Change Total Amount to: $125,000 (partner found extra $5k)
   - Change Profit to: $25,000
   - Change Sahem %: 12% (instead of 10%)
   - Change Reserve %: 8% (instead of 10%)
4. See preview update automatically:
   - Total Profit: $25,000
   - Sahem (12%): $3,000
   - Reserve (8%): $2,000
   - To Investors Profit: $20,000
   - To Investors Capital: $100,000
   - **Total to Investors: $120,000**
5. Click "موافقة وتوزيع الأرباح"
6. Confirm

### Expected Results
- ✅ Investor A receives: $8,000 profit + $40,000 capital = $48,000
- ✅ Investor B receives: $6,000 profit + $30,000 capital = $36,000
- ✅ Investor C receives: $6,000 profit + $30,000 capital = $36,000
- ✅ Total distributed: $120,000
- ✅ Sahem commission: $3,000 (recorded but not sent to investors)
- ✅ Reserve: $2,000 (recorded)
- ✅ Edited values saved in database
- ✅ Deal status can be updated to COMPLETED

---

## Test Scenario 3: Final Loss Distribution (Critical Test)

### Setup
- Deal: $100,000 funded
- 2 Investors: $60k, $40k
- Deal failed, only $70,000 recovered
- Loss: $30,000 (-30%)

### Partner Submits
1. Select deal → "توزيع أرباح جديد"
2. Select "توزيع نهائي" (Final)
3. Enter:
   - Total Amount: $70,000
   - Profit Percentage: -30%
   - Profit Amount: -$30,000
   - Deal Closing: 100%
4. Description: "Final distribution - deal resulted in loss"
5. Submit

### Admin Reviews Loss Scenario
1. Go to Admin → Profit Distributions
2. Click "تفاصيل" on the request
3. **System automatically detects loss** (red indicators)
4. Verify in Commission Settings:
   - Sahem % field is **disabled** (grayed out)
   - Reserve % field is **disabled** (grayed out)
   - Loss checkbox is **checked**
   - Message: "لا عمولة في حالة الخسارة"
5. See Loss Preview (red background):
   - Sahem Commission: $0
   - Reserve: $0
   - Loss: $30,000
   - **To Investors: $70,000** (all remaining)
6. Can edit Total Amount if needed
7. Click "موافقة وتوزيع الأرباح"
8. Confirm

### Expected Results
- ✅ Investor A receives: $42,000 (60% of $70k) - **Lost $18,000**
- ✅ Investor B receives: $28,000 (40% of $70k) - **Lost $12,000**
- ✅ **No commission** charged to Sahem Invest
- ✅ **No reserve** taken
- ✅ Notifications say "لم تحقق الصفقة ربحاً" (deal didn't profit)
- ✅ Profit distribution records show **negative amounts**
- ✅ Loss properly tracked in system
- ✅ All $70,000 goes to investors

---

## Test Scenario 4: Admin Complete Override

### Setup
- Any deal with investments
- Partner submits values

### Partner Submits
1. Submit with specific values:
   - Total: $100,000
   - Profit: $15,000
   - Sahem: 10%
   - Reserve: 10%

### Admin Completely Changes Everything
1. Go to Admin → Profit Distributions
2. Click "تفاصيل"
3. **Change ALL fields:**
   - Total Amount: $110,000
   - Profit %: 18%
   - Profit Amount: $18,000
   - Deal Closing: 95%
   - Capital Return: $92,000
   - Sahem %: 15%
   - Reserve %: 5%
4. Verify preview calculates correctly:
   - Profit: $18,000
   - Sahem (15%): $2,700
   - Reserve (5%): $900
   - To Investors: $14,400 + $92,000 = $106,400
5. Approve

### Expected Results
- ✅ **Admin's edited values** are used (not partner's)
- ✅ Database saves admin's values
- ✅ Distribution uses admin's numbers
- ✅ All calculations correct
- ✅ Partner sees what was actually distributed

---

## Test Scenario 5: Validation Tests

### Test Invalid Percentages
1. Open distribution details
2. Try to set:
   - Sahem: 60%
   - Reserve: 50%
3. **Expected:** Red warning: "مجموع النسب (110%) يتجاوز 100%"
4. **Expected:** Approve button **disabled**
5. Fix percentages to valid values
6. Approve button becomes enabled

### Test Loss Toggle (Final Only)
1. Open a **PARTIAL** distribution
2. Try to check "Loss" checkbox
3. **Expected:** Checkbox is **disabled**
4. **Expected:** Message: "متاح فقط في التوزيع النهائي"

### Test Negative Profit Detection
1. Open FINAL distribution
2. Set Profit Amount to: -$10,000
3. **Expected:** System automatically checks "isLoss"
4. **Expected:** Commissions become 0 and disabled
5. **Expected:** Preview shows loss scenario

---

## Verification Checklist

After each test, verify:

### In Database
- [ ] `ProfitDistributionRequest` status = 'APPROVED'
- [ ] All edited fields saved correctly
- [ ] `reviewedBy` and `reviewedAt` set
- [ ] Transactions created for each investor
- [ ] `ProfitDistribution` records created
- [ ] Wallet balances updated correctly
- [ ] `totalReturns` updated (except in loss)

### In UI (Investor Portal)
- [ ] Notification appears
- [ ] Wallet balance increased
- [ ] Transaction history shows entries
- [ ] Portfolio shows updated values
- [ ] Correct amounts displayed

### In UI (Partner Portal)
- [ ] Approval notification received
- [ ] Request status shows APPROVED
- [ ] Can see distributed amounts
- [ ] Stats updated if final distribution

### In UI (Admin Portal)
- [ ] Request shows as APPROVED
- [ ] Can't approve again
- [ ] Summary shows correct numbers
- [ ] All edits visible in history

---

## Edge Cases to Test

### Multiple Investments by Same Investor
**Setup:** Investor has 3 separate investments in same deal
- Investment 1: $10,000
- Investment 2: $5,000
- Investment 3: $15,000
- Total: $30,000

**Expected:** All 3 investments grouped, investor receives ONE distribution based on total $30k

### Very Small Amounts
**Setup:** Distribution of $10 profit among 3 investors
- Investor A: $4.00
- Investor B: $3.00
- Investor C: $3.00

**Expected:** Precision handled correctly, no rounding errors

### Zero Profit Distribution
**Setup:** Final distribution with 0% profit (break even)
- Capital returned: $100,000
- Profit: $0

**Expected:** Capital returned, no profit distribution, commissions on $0

---

## Performance Test

### Large Distribution
**Setup:**
- Deal with 100+ investors
- Various investment amounts
- Final distribution

**Expected:**
- Transaction completes within 30 seconds
- All 100+ investors processed
- Database transaction succeeds atomically
- No timeout errors

---

## Monitoring

During tests, check logs for:
```
Processing LOSS scenario: Total remaining X goes to investors for capital recovery
Processing PROFIT scenario: Profit X, Sahem Y, Reserve Z
Processing N unique investors from M investments
```

Watch for any errors or warnings.

---

## Rollback Test

### Test Transaction Failure
1. Start distribution approval
2. Simulate failure (disconnect database mid-transaction)
3. **Expected:** 
   - No partial updates
   - Request still PENDING
   - No wallets updated
   - No transactions created
   - System can retry

---

## Success Criteria

All tests pass when:
- ✅ Calculations are mathematically correct
- ✅ Loss scenarios have NO commissions
- ✅ Profit scenarios have correct commissions
- ✅ All edited values are used
- ✅ All default values work correctly
- ✅ Notifications are accurate
- ✅ Database updates are atomic
- ✅ UI updates reflect changes
- ✅ No money lost or created
- ✅ Investment ratios respected

---

## Common Issues & Solutions

### Issue: Percentages don't add up
**Solution:** Check that commission percentages together don't exceed 100%

### Issue: Loss scenario still charging commission
**Solution:** Verify `isLoss` flag is set to true in request body

### Issue: Wrong amounts distributed
**Solution:** Check investment ratio calculations and totals

### Issue: Transaction timeout
**Solution:** Increase transaction timeout or optimize queries

### Issue: Duplicate distributions
**Solution:** Check request status before processing (must be PENDING)

---

## Final Checklist Before Production

- [ ] All 5 test scenarios pass
- [ ] Edge cases handled
- [ ] Validation prevents errors
- [ ] Loss scenario works correctly
- [ ] Commission calculations correct
- [ ] Database updates atomic
- [ ] Notifications sent properly
- [ ] UI displays correctly
- [ ] Logs are informative
- [ ] No money lost in system
- [ ] Performance acceptable
- [ ] Documentation complete

---

Ready to test! 🚀

