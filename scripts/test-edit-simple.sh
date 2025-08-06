#!/bin/bash

echo "Testing deal edit API..."

# Get the first deal ID
DEAL_ID=$(curl -s "http://localhost:3000/api/deals" | jq -r '.deals[0].id')
echo "Testing with deal ID: $DEAL_ID"

# Get current deal data
echo "Current deal data:"
curl -s "http://localhost:3000/api/deals/$DEAL_ID" | jq '{title, thumbnailImage}'

echo -e "\nSending update request..."

# Create a simple test image file
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==" | base64 -d > /tmp/test-image.png

# Send update request with curl
curl -X PUT "http://localhost:3000/api/deals/$DEAL_ID" \
  -F "title=Updated Deal Title" \
  -F "description=Updated description" \
  -F "category=Technology" \
  -F "fundingGoal=100000" \
  -F "minInvestment=1000" \
  -F "expectedReturn=15" \
  -F "duration=365" \
  -F "riskLevel=MEDIUM" \
  -F "status=PUBLISHED" \
  -F "highlights=[\"Updated highlight\"]" \
  -F "tags=[\"test\"]" \
  -F "featured=false" \
  -F "image=@/tmp/test-image.png;type=image/png" \
  -v

echo -e "\n\nAfter update:"
curl -s "http://localhost:3000/api/deals/$DEAL_ID" | jq '{title, thumbnailImage}'

# Cleanup
rm -f /tmp/test-image.png