import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  // Skip auth for PayU POST callbacks to /dashboard and /api/payu-callback
  if ((pathname === '/dashboard' || pathname === '/api/payu-callback') && method === 'POST') {
    return NextResponse.next(); // Allow through without check
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const protectedRoutes = ['/dashboard', '/admin', '/superadmin'];

  if (protectedRoutes.some(route => pathname.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Middleware profile error:', error);
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    const role = profile?.role;

    // Super admin access control
    if (pathname.startsWith('/superadmin') && role !== 'superadmin') {
      return NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/dashboard', request.url));
    }

    // Admin access control
    if (pathname.startsWith('/admin') && !pathname.startsWith('/superadmin')) {
      if (role !== 'admin' && role !== 'superadmin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Redirect admins and superadmins away from user dashboard
    if (pathname.startsWith('/dashboard') && role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    if (pathname.startsWith('/dashboard') && role === 'superadmin') {
      return NextResponse.redirect(new URL('/superadmin', request.url));
    }
  }

  return supabaseResponse;
}