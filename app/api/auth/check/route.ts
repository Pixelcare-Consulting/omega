import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get session
    const session = await auth();
    
    // Get cookie info for debugging
    const cookieStore = await cookies();
    const sessionCookies = cookieStore.getAll()
      .filter((cookie: { name: string }) => cookie.name.includes('auth') || cookie.name.includes('session'))
      .map((cookie: { name: string; value: string }) => ({ name: cookie.name, value: cookie.value ? '**PRESENT**' : '**MISSING**' }));
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'No authenticated session found',
        debug: {
          cookies: sessionCookies,
          sessionPresent: !!session,
          userPresent: !!session?.user
        }
      }, { status: 401 });
    }
    
    // Return basic user information without sensitive data
    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
      debug: {
        cookies: sessionCookies
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Authentication check error:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Failed to verify authentication',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 