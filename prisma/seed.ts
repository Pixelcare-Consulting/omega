import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const defaultRoles = [
  {
    id: "admin",
    name: "Admin User",
    description: "Full system access",
    permissions: {
      users: true,
      roles: true,
      database: true,
      settings: true,
    },
    isSystem: true
  },
  {
    id: "accounting",
    name: "Accounting User",
    description: "Access to accounting features",
    permissions: {
      users: false,
      roles: false,
      database: true,
      settings: false,
    },
    isSystem: true
  },
  {
    id: "logistics",
    name: "Logistics User",
    description: "Access to logistics features",
    permissions: {
      users: false,
      roles: false,
      database: true,
      settings: false,
    },
    isSystem: true
  },
  {
    id: "finance",
    name: "Finance User",
    description: "Access to finance features",
    permissions: {
      users: false,
      roles: false,
      database: true,
      settings: false,
    },
    isSystem: true
  },
  {
    id: "supply-chain",
    name: "Supply Chain User",
    description: "Access to supply chain features",
    permissions: {
      users: false,
      roles: false,
      database: true,
      settings: false,
    },
    isSystem: true
  },
  {
    id: "sales",
    name: "Sales User",
    description: "Access to sales features",
    permissions: {
      users: false,
      roles: false,
      database: true,
      settings: false,
    },
    isSystem: true
  }
]

const defaultUsers = [
  {
    name: "Admin User",
    email: "admin@omega.com",
    password: "admin123",
    role: "admin",
    isActive: true
  },
  {
    name: "Accounting User",
    email: "accounting@omega.com",
    password: "accounting123",
    role: "accounting",
    isActive: true
  },
  {
    name: "Logistics User",
    email: "logistics@omega.com",
    password: "logistics123",
    role: "logistics",
    isActive: true
  },
  {
    name: "Finance User",
    email: "finance@omega.com",
    password: "finance123",
    role: "finance",
    isActive: true
  },
  {
    name: "Supply Chain User",
    email: "supply-chain@omega.com",
    password: "supplychain123",
    role: "supply-chain",
    isActive: true
  },
  {
    name: "Sales User",
    email: "sales@omega.com",
    password: "sales123",
    role: "sales",
    isActive: true
  }
]

async function main() {
  console.log('Start seeding...')

  // Create roles
  for (const role of defaultRoles) {
    const exists = await prisma.role.findUnique({
      where: { id: role.id }
    })

    if (!exists) {
      await prisma.role.create({
        data: {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          isSystem: role.isSystem
        }
      })
      console.log(`Created role: ${role.name}`)
    } else {
      console.log(`Role already exists: ${role.name}`)
    }
  }

  // Create users
  for (const user of defaultUsers) {
    const exists = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!exists) {
      const hashedPassword = await hash(user.password, 12)
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
          isActive: user.isActive
        }
      })
      console.log(`Created user: ${user.name}`)
    } else {
      console.log(`User already exists: ${user.email}`)
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 