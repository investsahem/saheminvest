const { v2: cloudinary } = require('cloudinary');

// Load environment variables
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🔧 Cloudinary Config:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set ✅' : 'Not set ❌');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set ✅' : 'Not set ❌');
console.log('');

// Sample images for each deal category (using high-quality stock photos)
const dealImages = [
  {
    category: 'renewable-energy',
    title: 'Green Energy Solar Farm',
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80', // Solar panels
      'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=1200&q=80'  // Solar farm
    ]
  },
  {
    category: 'technology',
    title: 'Tech Startup Incubator',
    images: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80', // Modern office
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80'  // Team working
    ]
  },
  {
    category: 'real-estate',
    title: 'Luxury Real Estate Development',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80', // Luxury building
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80'  // Modern architecture
    ]
  },
  {
    category: 'healthcare',
    title: 'Healthcare Innovation Fund',
    images: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80', // Medical technology
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&q=80'  // Healthcare innovation
    ]
  },
  {
    category: 'agriculture',
    title: 'Sustainable Agriculture Project',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80', // Greenhouse
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80'  // Hydroponic farming
    ]
  },
  {
    category: 'logistics',
    title: 'E-commerce Logistics Hub',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80', // Warehouse
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1200&q=80'  // Logistics center
    ]
  }
];

async function uploadImageToCloudinary(imageUrl, folder, publicId) {
  try {
    console.log(`📤 Uploading ${publicId}...`);
    
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: `sahaminvest/deals/${folder}`,
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'fill', quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    
    console.log(`✅ Uploaded: ${result.secure_url}`);
    return result.secure_url;
    
  } catch (error) {
    console.error(`❌ Error uploading ${publicId}:`, error.message);
    return null;
  }
}

async function uploadAllDealImages() {
  console.log('🚀 Starting Cloudinary image upload for deals...\n');
  
  const uploadedImages = {};
  
  for (const deal of dealImages) {
    console.log(`📁 Processing ${deal.title} (${deal.category})`);
    
    const dealUrls = [];
    
    for (let i = 0; i < deal.images.length; i++) {
      const imageUrl = deal.images[i];
      const publicId = `${deal.category}-${i + 1}`;
      
      const uploadedUrl = await uploadImageToCloudinary(
        imageUrl,
        deal.category,
        publicId
      );
      
      if (uploadedUrl) {
        dealUrls.push(uploadedUrl);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    uploadedImages[deal.category] = dealUrls;
    console.log(`✅ Completed ${deal.title}: ${dealUrls.length} images\n`);
  }
  
  // Print the results for updating the seed file
  console.log('🎯 Upload Results Summary:');
  console.log('========================\n');
  
  Object.entries(uploadedImages).forEach(([category, urls]) => {
    console.log(`${category.toUpperCase()}:`);
    urls.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
    console.log('');
  });
  
  // Generate the updated seed data structure
  console.log('📝 Updated seed data structure:');
  console.log('===============================\n');
  
  const dealMappings = {
    'renewable-energy': 'Green Energy Solar Farm',
    'technology': 'Tech Startup Incubator', 
    'real-estate': 'Luxury Real Estate Development',
    'healthcare': 'Healthcare Innovation Fund',
    'agriculture': 'Sustainable Agriculture Project',
    'logistics': 'E-commerce Logistics Hub'
  };
  
  Object.entries(uploadedImages).forEach(([category, urls]) => {
    const dealTitle = dealMappings[category];
    console.log(`// ${dealTitle}`);
    console.log(`images: [`);
    urls.forEach(url => {
      console.log(`  '${url}',`);
    });
    console.log(`],\n`);
  });
  
  console.log('✅ All images uploaded successfully to Cloudinary!');
}

// Run the upload process
uploadAllDealImages().catch(console.error);