const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const sampleDeals = [
  {
    title: 'Smart Electronics Manufacturing',
    description: 'Investment opportunity in cutting-edge electronics manufacturing facility. This project focuses on producing next-generation smart devices including IoT sensors, smart home devices, and wearable technology. The facility will employ advanced automation and sustainable manufacturing practices.',
    category: 'Technology',
    location: 'Dubai, UAE',
    fundingGoal: 500000,
    minInvestment: 1000,
    expectedReturn: 15.5,
    duration: 365,
    riskLevel: 'MEDIUM',
    status: 'PUBLISHED',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-12-31'),
    publishedAt: new Date(),
    thumbnailImage: '/images/electronics-deal.jpg',
    images: ['/images/electronics-deal.jpg'],
    highlights: [
      'State-of-the-art manufacturing facility',
      'Experienced management team with 20+ years',
      'Pre-orders worth $2M already secured',
      'Sustainable and eco-friendly production',
      'Strategic partnerships with major retailers'
    ],
    tags: ['Electronics', 'Manufacturing', 'IoT', 'Smart Devices'],
    featured: true,
    slug: 'smart-electronics-manufacturing'
  },
  {
    title: 'Luxury Real Estate Development',
    description: 'Premium residential complex development in prime location. This project includes 200 luxury apartments, commercial spaces, and world-class amenities. Located in the heart of the business district with excellent connectivity and infrastructure.',
    category: 'Real Estate',
    location: 'Riyadh, Saudi Arabia',
    fundingGoal: 2000000,
    minInvestment: 5000,
    expectedReturn: 18.0,
    duration: 730,
    riskLevel: 'LOW',
    status: 'PUBLISHED',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2025-12-31'),
    publishedAt: new Date(),
    thumbnailImage: '/images/construction-deal.jpg',
    images: ['/images/construction-deal.jpg'],
    highlights: [
      'Prime location in business district',
      '200 luxury apartments with premium finishes',
      'World-class amenities including gym, pool, and spa',
      'Pre-sales covering 40% of units',
      'Expected 25% price appreciation upon completion'
    ],
    tags: ['Real Estate', 'Luxury', 'Residential', 'Commercial'],
    featured: true,
    slug: 'luxury-real-estate-development'
  },
  {
    title: 'Mobile Technology Innovation',
    description: 'Revolutionary mobile technology startup developing next-generation smartphone accessories and mobile apps. Focus on AI-powered mobile solutions, wireless charging technology, and mobile security applications.',
    category: 'Technology',
    location: 'Abu Dhabi, UAE',
    fundingGoal: 300000,
    minInvestment: 500,
    expectedReturn: 22.0,
    duration: 540,
    riskLevel: 'HIGH',
    status: 'PUBLISHED',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-06-30'),
    publishedAt: new Date(),
    thumbnailImage: '/images/phone-deal.jpg',
    images: ['/images/phone-deal.jpg'],
    highlights: [
      'AI-powered mobile applications',
      'Patent-pending wireless charging technology',
      'Experienced tech team from major companies',
      'Strategic partnerships with mobile carriers',
      'Beta testing showing 95% user satisfaction'
    ],
    tags: ['Mobile', 'Technology', 'AI', 'Innovation'],
    featured: false,
    slug: 'mobile-technology-innovation'
  },
  {
    title: 'Sustainable Energy Project',
    description: 'Large-scale solar energy installation project providing clean, renewable energy to commercial and residential customers. This project includes solar panel installation, energy storage systems, and smart grid integration.',
    category: 'Energy',
    location: 'Jeddah, Saudi Arabia',
    fundingGoal: 1500000,
    minInvestment: 2500,
    expectedReturn: 12.5,
    duration: 1095,
    riskLevel: 'LOW',
    status: 'PUBLISHED',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2026-12-31'),
    publishedAt: new Date(),
    thumbnailImage: '/images/construction-deal.jpg',
    images: ['/images/construction-deal.jpg'],
    highlights: [
      '50MW solar installation capacity',
      'Government contracts for 20 years',
      'Advanced energy storage systems',
      'Smart grid integration technology',
      'Expected 15% annual energy cost savings'
    ],
    tags: ['Energy', 'Solar', 'Sustainable', 'Green'],
    featured: false,
    slug: 'sustainable-energy-project'
  },
  {
    title: 'Healthcare Technology Platform',
    description: 'Digital healthcare platform connecting patients with healthcare providers through telemedicine, AI diagnostics, and health monitoring solutions. Includes mobile app, web platform, and IoT health devices.',
    category: 'Healthcare',
    location: 'Kuwait City, Kuwait',
    fundingGoal: 750000,
    minInvestment: 1500,
    expectedReturn: 20.0,
    duration: 600,
    riskLevel: 'MEDIUM',
    status: 'PUBLISHED',
    startDate: new Date('2024-02-15'),
    endDate: new Date('2025-10-31'),
    publishedAt: new Date(),
    thumbnailImage: '/images/electronics-deal.jpg',
    images: ['/images/electronics-deal.jpg'],
    highlights: [
      'AI-powered diagnostic assistance',
      'Telemedicine platform with video consultations',
      'IoT health monitoring devices',
      'Partnership with major hospitals',
      'HIPAA compliant and secure platform'
    ],
    tags: ['Healthcare', 'Technology', 'Telemedicine', 'AI'],
    featured: false,
    slug: 'healthcare-technology-platform'
  }
]

async function seedDeals() {
  try {
    console.log('Starting to seed deals...')

    // First, find an admin user to be the owner
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.')
      return
    }

    console.log(`Using admin user: ${adminUser.email} as deal owner`)

    // Create deals
    for (const dealData of sampleDeals) {
      const existingDeal = await prisma.project.findUnique({
        where: { slug: dealData.slug }
      })

      if (existingDeal) {
        console.log(`Deal "${dealData.title}" already exists, skipping...`)
        continue
      }

      const deal = await prisma.project.create({
        data: {
          ...dealData,
          ownerId: adminUser.id
        }
      })

      console.log(`Created deal: ${deal.title} (ID: ${deal.id})`)
    }

    console.log('✅ Successfully seeded deals!')

  } catch (error) {
    console.error('Error seeding deals:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDeals()