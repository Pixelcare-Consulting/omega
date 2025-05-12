import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting session cleanup...')
  
  try {
    // Delete all session tokens
    const result = await prisma.$executeRaw`TRUNCATE TABLE "Session";`
    console.log(`Deleted all sessions`)
    
    // Delete all verification tokens
    const verificationResult = await prisma.$executeRaw`TRUNCATE TABLE "VerificationToken";`
    console.log(`Deleted all verification tokens`)
    
  } catch (error) {
    console.error('Error clearing sessions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => console.log('Session cleanup completed'))
  .catch(error => console.error('Script error:', error)) 