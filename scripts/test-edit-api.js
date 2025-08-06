const FormData = require('form-data')
const fs = require('fs')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function testEditAPI() {
  try {
    console.log('Testing the edit API with image upload...\n')
    
    // Get a deal to edit
    const dealsResponse = await fetch('http://localhost:3000/api/deals')
    const dealsData = await dealsResponse.json()
    const deal = dealsData.deals.find(d => d.thumbnailImage)
    
    if (!deal) {
      console.log('No deals with images found')
      return
    }
    
    console.log(`Testing with deal: ${deal.title}`)
    console.log(`Current image: ${deal.thumbnailImage}`)
    console.log(`Deal ID: ${deal.id}\n`)
    
    // Create form data with a new image URL (simulating file upload)
    const formData = new FormData()
    formData.append('title', deal.title + ' (Updated)')
    formData.append('description', deal.description)
    formData.append('category', deal.category)
    formData.append('location', deal.location || '')
    formData.append('fundingGoal', deal.fundingGoal.toString())
    formData.append('minInvestment', deal.minInvestment.toString())
    formData.append('expectedReturn', deal.expectedReturn.toString())
    formData.append('duration', deal.duration.toString())
    formData.append('riskLevel', deal.riskLevel || 'MEDIUM')
    formData.append('status', deal.status)
    formData.append('highlights', JSON.stringify(deal.highlights))
    formData.append('tags', JSON.stringify(deal.tags))
    formData.append('featured', deal.featured.toString())
    
    // Create a simple test image file (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==', 'base64')
    formData.append('image', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    })
    
    console.log('Sending PUT request to update deal...')
    
    // Send the update request
    const response = await fetch(`http://localhost:3000/api/deals/${deal.id}`, {
      method: 'PUT',
      body: formData
    })
    
    console.log(`Response status: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Update successful!')
      console.log(`New title: ${result.title}`)
      console.log(`New image: ${result.thumbnailImage}`)
      
      // Verify the change by fetching the deal again
      console.log('\nVerifying update by fetching deal again...')
      const verifyResponse = await fetch(`http://localhost:3000/api/deals/${deal.id}`)
      if (verifyResponse.ok) {
        const verifiedDeal = await verifyResponse.json()
        console.log(`Verified title: ${verifiedDeal.title}`)
        console.log(`Verified image: ${verifiedDeal.thumbnailImage}`)
      }
    } else {
      const error = await response.text()
      console.log('❌ Update failed:', error)
    }
    
  } catch (error) {
    console.error('Error in test:', error)
  }
}

testEditAPI()