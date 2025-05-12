import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET /api/roles - Get all roles
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    return NextResponse.json({ error: 'Could not retrieve roles' }, { status: 500 });
  }
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, permissions } = data;

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions,
        createdBy: session.user.id,
        updatedBy: session.user.id
      }
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error('Failed to create role:', error);
    return NextResponse.json({ error: 'Could not create role' }, { status: 500 });
  }
}

// PUT /api/roles/:id - Update a role
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, name, description, permissions } = data;

    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions,
        updatedBy: session.user.id,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error('Failed to update role:', error);
    return NextResponse.json({ error: 'Could not update role' }, { status: 500 });
  }
}

// DELETE /api/roles/:id - Soft delete a role
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    // Check if role is a system role
    const role = await prisma.role.findUnique({ where: { id } });
    if (role?.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system roles' }, { status: 400 });
    }

    await prisma.role.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete role:', error);
    return NextResponse.json({ error: 'Could not delete role' }, { status: 500 });
  }
} 