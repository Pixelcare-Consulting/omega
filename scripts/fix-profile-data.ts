import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting profile data fix...')
  
  try {
    // Get all profiles
    const profiles = await prisma.profile.findMany()
    console.log(`Found ${profiles.length} profiles`)
    
    let modified = 0
    
    // Process each profile
    for (const profile of profiles) {
      if (profile.details) {
        const details = profile.details as Record<string, any>
        
        // Check if profile has a base64 image
        if (details.avatarUrl && typeof details.avatarUrl === 'string' && details.avatarUrl.startsWith('data:')) {
          console.log(`Fixing profile ${profile.id}`)
          
          // Create a new details object without the base64 image
          const newDetails = {
            ...details,
            avatarUrl: '/placeholder-avatar.png' // Replace with placeholder
          }
          
          // Update the profile
          await prisma.profile.update({
            where: { id: profile.id },
            data: { details: newDetails }
          })
          
          modified++
        }
      }
    }
    
    console.log(`Fixed ${modified} profiles`)
  } catch (error) {
    console.error('Error fixing profile data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => console.log('Profile data fix completed'))
  .catch(error => console.error('Script error:', error)) 