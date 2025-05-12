import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const eventType = searchParams.get('eventType');
    const severity = searchParams.get('severity');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build where clause based on filters
    const where: Prisma.ActivityLogWhereInput = {};

    if (search) {
      where.OR = [
        { user: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (eventType && eventType !== 'all') {
      where.eventType = eventType;
    }

    if (severity && severity !== 'all') {
      where.severity = severity;
    }

    if (fromDate || toDate) {
      where.timestamp = {};
      if (fromDate) {
        where.timestamp.gte = new Date(fromDate);
      }
      if (toDate) {
        where.timestamp.lte = new Date(toDate);
      }
    }

    // Get total count for pagination
    const total = await prisma.activityLog.count({ where });

    // Get paginated results
    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

// POST endpoint for creating activity logs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const log = await prisma.activityLog.create({
      data: {
        user: body.user,
        action: body.action,
        eventType: body.eventType,
        severity: body.severity,
        details: body.details,
        ipAddress: body.ipAddress,
        userAgent: body.userAgent,
        metadata: body.metadata ? (body.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error('Failed to create activity log:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
} 