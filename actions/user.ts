'use server'

import { prisma } from '@/lib/db'
import { Prisma, User } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({ where: { email }, include: { profile: true } })
  } catch (err) {
    return null
  }
}

export async function getUserById(id: string) {
  try {
    if (!id) {
      console.error("getUserById called with empty id");
      return null;
    }
    
    const user = await prisma.user.findUnique({ 
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        isOnline: true,
        isActive: true,
        lastActiveAt: true
      }
    });
    
    if (!user) {
      console.log(`No user found with id: ${id}`);
    }
    
    return user;
  } catch (err) {
    console.error(`Error fetching user with id: ${id}`, err);
    return null;
  }
}

export async function getAccountByUserId(userId: string) {
  try {
    return await prisma.account.findFirst({ where: { userId } })
  } catch (err) {
    return null
  }
}

// Get all users with pagination
export async function getUsers(page = 1, pageSize = 10, searchTerm = '') {
  try {
    const skip = (page - 1) * pageSize
    
    let where: Prisma.UserWhereInput = { deletedAt: null }
    
    if (searchTerm) {
      where = {
        ...where,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
          { email: { contains: searchTerm, mode: 'insensitive' as Prisma.QueryMode } },
        ]
      }
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { profile: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])
    
    return {
      users,
      pagination: {
        total,
        pageCount: Math.ceil(total / pageSize),
        page,
        pageSize
      }
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }
}

// Create a new user
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    // Hash password if provided
    let dataToCreate = { ...userData };
    
    if (dataToCreate.password) {
      const salt = await bcrypt.genSalt(10);
      dataToCreate.password = await bcrypt.hash(dataToCreate.password, salt);
    }
    
    const user = await prisma.user.create({
      data: {
        ...dataToCreate,
        profile: {
          create: { 
            details: {} 
          }
        }
      },
      include: {
        profile: true
      }
    })
    
    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }
}

// Update an existing user
export async function updateUser(id: string, userData: Partial<User>) {
  try {
    // Remove fields that shouldn't be directly updated
    const { id: userId, createdAt, updatedAt, ...updateData } = userData as any
    
    // Hash password if provided
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        profile: true
      }
    })
    
    return user
  } catch (error) {
    console.error('Error updating user:', error)
    throw new Error('Failed to update user')
  }
}

// Soft delete a user (set deletedAt field)
export async function deleteUser(id: string, deletedBy?: string) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        deletedBy
      }
    })
    
    return user
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error('Failed to delete user')
  }
}

// Hard delete a user (remove from database)
export async function hardDeleteUser(id: string) {
  try {
    const user = await prisma.user.delete({
      where: { id }
    })
    
    return user
  } catch (error) {
    console.error('Error hard deleting user:', error)
    throw new Error('Failed to hard delete user')
  }
}

// Restore a soft-deleted user
export async function restoreUser(id: string) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { 
        deletedAt: null,
        deletedBy: null
      }
    })
    
    return user
  } catch (error) {
    console.error('Error restoring user:', error)
    throw new Error('Failed to restore user')
  }
}
