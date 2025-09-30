# Deal Update Approval System

## Overview

Partners must now get admin approval before their deal updates go live. This prevents unauthorized changes to active deals and gives admins full control over deal modifications.

## How It Works

### For Partners

1. **Edit a Deal**
   - Partner goes to their deals page
   - Clicks "Edit" on any deal
   - Makes changes (title, price, image, etc.)
   - Clicks "Save"

2. **Update Request Created**
   - Instead of updating immediately, system creates an "Update Request"
   - Partner sees: "Update request submitted successfully. Waiting for admin approval."
   - Changes are NOT applied yet

3. **Wait for Admin**
   - Partner can see their pending requests
   - Admin reviews and approves/rejects
   - Partner gets notified of decision

### For Admin

1. **Access Approval Page**
   - Go to `/admin/deal-updates`
   - See all pending update requests
   - Filter by: Pending, Approved, Rejected

2. **Review Update Request**
   - See partner name and company
   - See deal being updated
   - **See detailed changes:**
     - Title: "Old Title" → "New Title"  
     - Funding Goal: $10,000 → $15,000
     - Image updated
     - etc.

3. **Approve or Reject**
   - **Approve**: Changes apply to deal immediately
   - **Reject**: Provide reason, changes discarded

## Database Structure

### DealUpdateRequest Model

```typescript
{
  id: string
  projectId: string              // Deal being updated
  requestedBy: string            // Partner who requested
  proposedChanges: JSON          // All the changes
  changesSummary: string         // Human-readable summary
  status: PENDING/APPROVED/REJECTED
  reviewedBy: string?            // Admin who reviewed
  reviewedAt: Date?
  rejectionReason: string?
}
```

## API Endpoints

### Partner Endpoints

**PUT /api/deals/[id]**
- Partners: Creates update request
- Admins: Updates deal directly

### Admin Endpoints

**GET /api/admin/deal-update-requests**
- List all update requests
- Query params: `?status=PENDING`

**GET /api/admin/deal-update-requests/[id]**
- Get single update request details

**POST /api/admin/deal-update-requests/[id]**
- Approve or reject request
- Body: `{ action: 'approve' | 'reject', rejectionReason?: string }`

## User Interface

### Admin UI: `/admin/deal-updates`

**Features:**
- ✅ Filter tabs (Pending, Approved, Rejected)
- ✅ Card view with deal info
- ✅ Partner details
- ✅ Changes summary
- ✅ Approve/Reject buttons
- ✅ Modal for detailed view
- ✅ Rejection reason input

**Workflow:**
1. Admin sees pending requests
2. Clicks "View Details"
3. Reviews all proposed changes
4. Approves → Changes applied
5. OR Rejects → Enters reason → Changes discarded

## Permissions

### Partners
- Can create update requests for their own deals
- Cannot update deals directly
- Cannot see other partners' requests

### Admins & Deal Managers
- Can update deals directly (no approval needed)
- Can view all update requests
- Can approve/reject any request

## Example Scenarios

### Scenario 1: Partner Increases Funding Goal

1. Partner edits deal, changes funding goal from $10,000 to $15,000
2. System creates update request with summary:
   ```
   Funding Goal: $10,000 → $15,000
   ```
3. Admin reviews at `/admin/deal-updates`
4. Admin approves
5. Deal's funding goal updates to $15,000

### Scenario 2: Partner Changes Deal Image

1. Partner uploads new image
2. System uploads to Cloudinary
3. Creates update request with new image URL
4. Admin reviews and sees:
   ```
   Image updated
   [Shows preview of new image]
   ```
5. Admin approves
6. Deal's thumbnail updates

### Scenario 3: Admin Rejects Update

1. Partner tries to increase expected return from 10% to 50%
2. System creates update request
3. Admin reviews and sees suspicious change
4. Admin rejects with reason: "Return rate too high, not realistic"
5. Partner sees rejection and reason
6. Deal remains unchanged

## Benefits

✅ **Security**: Prevents unauthorized deal modifications
✅ **Control**: Admin has final say on all changes
✅ **Transparency**: All changes tracked and logged
✅ **Audit Trail**: See who requested, who approved, when
✅ **Flexibility**: Admins can still edit directly when needed

## Migration Notes

- Existing deals work normally
- No data migration needed
- Partner edits now go through approval
- Admin edits still instant

## Future Enhancements

- Email notifications for pending requests
- Bulk approve/reject
- Partner dashboard to see their request status
- Approval workflow with multiple approvers
- Automatic approval for minor changes

