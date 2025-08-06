const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding partners...')

  try {
    // Check if partner user already exists
    const existingPartner = await prisma.user.findUnique({
      where: { email: 'partner@sahaminvest.com' }
    })

    let partnerUser = existingPartner
    if (!existingPartner) {
      // Create partner user
      partnerUser = await prisma.user.create({
        data: {
          email: 'partner@sahaminvest.com',
          name: 'Mohammed Al-Zahra',
          role: 'PARTNER',
          isActive: true,
          walletBalance: 5000
        }
      })
    }

    // Check if partner profile already exists
    const existingPartnerProfile = await prisma.partner.findUnique({
      where: { userId: partnerUser.id }
    })

    if (!existingPartnerProfile) {
      // Create partner profile
      await prisma.partner.create({
        data: {
          companyName: 'Tech Solutions Ltd',
          contactName: 'Mohammed Al-Zahra',
          phone: '+971-50-123-4567',
          address: 'Dubai International Financial Centre, Dubai, UAE',
          website: 'https://techsolutions.ae',
          industry: 'Technology',
          status: 'ACTIVE',
          tier: 'GOLD',
          totalDeals: 12,
          completedDeals: 11,
          totalCommission: 45000,
          successRate: 91.7,
          businessLicense: true,
          taxCertificate: true,
          bankDetails: true,
          partnershipAgreement: true,
          lastActive: new Date(),
          userId: partnerUser.id
        }
      })
    }

    // Create additional partners
    const additionalPartners = [
      {
        email: 'fatima@emiratesrealestate.ae',
        name: 'Fatima Hassan',
        partner: {
          companyName: 'Emirates Real Estate Group',
          contactName: 'Fatima Hassan',
          phone: '+971-4-567-8901',
          address: 'Business Bay, Dubai, UAE',
          website: 'https://emiratesrealestate.ae',
          industry: 'Real Estate',
          status: 'ACTIVE',
          tier: 'PLATINUM',
          totalDeals: 28,
          completedDeals: 27,
          totalCommission: 125000,
          successRate: 96.4,
          businessLicense: true,
          taxCertificate: true,
          bankDetails: true,
          partnershipAgreement: true,
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }
      },
      {
        email: 'ahmed@greenenergy.ae',
        name: 'Ahmed Khalil',
        partner: {
          companyName: 'Green Energy Consultants',
          contactName: 'Ahmed Khalil',
          phone: '+971-2-345-6789',
          address: 'Abu Dhabi Global Market, Abu Dhabi, UAE',
          website: 'https://greenenergy.ae',
          industry: 'Energy',
          status: 'ACTIVE',
          tier: 'SILVER',
          totalDeals: 8,
          completedDeals: 7,
          totalCommission: 22000,
          successRate: 87.5,
          businessLicense: true,
          taxCertificate: false,
          bankDetails: true,
          partnershipAgreement: true,
          lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      },
      {
        email: 'sarah@healthinnovations.ae',
        name: 'Dr. Sarah Abdullah',
        partner: {
          companyName: 'Healthcare Innovations LLC',
          contactName: 'Dr. Sarah Abdullah',
          phone: '+971-6-789-0123',
          address: 'Sharjah Research Technology and Innovation Park, UAE',
          industry: 'Healthcare',
          status: 'PENDING',
          tier: 'BRONZE',
          totalDeals: 0,
          completedDeals: 0,
          totalCommission: 0,
          successRate: 0,
          businessLicense: true,
          taxCertificate: false,
          bankDetails: false,
          partnershipAgreement: false,
          lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
        }
      },
      {
        email: 'omar@agriventures.ae',
        name: 'Omar Al-Mansouri',
        partner: {
          companyName: 'Agricultural Ventures Co',
          contactName: 'Omar Al-Mansouri',
          phone: '+971-7-456-7890',
          address: 'Ras Al Khaimah Economic Zone, UAE',
          industry: 'Agriculture',
          status: 'SUSPENDED',
          tier: 'BRONZE',
          totalDeals: 3,
          completedDeals: 2,
          totalCommission: 5500,
          successRate: 66.7,
          businessLicense: true,
          taxCertificate: true,
          bankDetails: true,
          partnershipAgreement: true,
          lastActive: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 1 month ago
        }
      }
    ]

    for (const partnerData of additionalPartners) {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: partnerData.email }
      })

      let user = existingUser
      if (!existingUser) {
        user = await prisma.user.create({
          data: {
            email: partnerData.email,
            name: partnerData.name,
            role: 'PARTNER',
            isActive: partnerData.partner.status !== 'SUSPENDED',
            walletBalance: Math.random() * 10000
          }
        })
      }

      // Check if partner profile exists
      const existingProfile = await prisma.partner.findUnique({
        where: { userId: user.id }
      })

      if (!existingProfile) {
        await prisma.partner.create({
          data: {
            ...partnerData.partner,
            userId: user.id,
            joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date within last year
          }
        })
      }
    }

    console.log('✅ Partners seeded successfully!')
    
    // Show summary
    const partnerCount = await prisma.partner.count()
    console.log(`🏢 Total partners: ${partnerCount}`)

    const partnersByStatus = await prisma.partner.groupBy({
      by: ['status'],
      _count: true
    })
    
    console.log('📊 Partners by status:')
    partnersByStatus.forEach(({ status, _count }) => {
      console.log(`  ${status}: ${_count}`)
    })

  } catch (error) {
    console.error('❌ Error seeding partners:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()