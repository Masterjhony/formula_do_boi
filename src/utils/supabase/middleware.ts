import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, rewrittenPath?: string) {
    let supabaseResponse = rewrittenPath
        ? NextResponse.rewrite(new URL(rewrittenPath, request.url), {
            request,
        })
        : NextResponse.next({
            request,
        })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = rewrittenPath
                        ? NextResponse.rewrite(new URL(rewrittenPath, request.url), {
                            request,
                        })
                        : NextResponse.next({
                            request,
                        })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Analyze paths based on the internal rewritten path (which tells us if we are in (admin) or (site))
    const isAdminRoute = rewrittenPath?.startsWith('/web-admin')
    const isSiteRoute = rewrittenPath?.startsWith('/web-site')

    // 1. Admin Protection
    if (isAdminRoute) {
        // Exclude login page from protection to avoid loops
        // The path in rewrittenPath is like /(admin)/login...
        if (!rewrittenPath?.includes('/login')) {
            if (!user) {
                const url = request.nextUrl.clone()
                url.pathname = '/login'
                url.searchParams.set('next', request.nextUrl.pathname)
                return NextResponse.redirect(url)
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'admin') {
                // Not an admin, redirect to main site
                // We need to know the main site domain. 
                // For now, let's redirect to a "not authorized" page or just root of main site if possible.
                // Or just sign them out?
                // Let's redirect to the site dashboard on the app domain
                // Assuming app.formuladoboi.com or localhost:3000

                // Hard to know exact "site" domain dynamically if not env var, 
                // but we can try to construct it or just error.
                // Let's just redirect to '/dashboard' but on the current domain it would fail loop?
                // No, if we are on admin.domain.com, /dashboard is admin dashboard.
                // We should redirect to the main domain.

                // Construct main domain URL
                const host = request.headers.get('host') || ''
                const protocol = request.headers.get('x-forwarded-proto') || 'http'
                let mainDomain = host.replace('admin.', '')
                if (mainDomain === host) {
                    // specific for localhost if logic differs, but usually admin.localhost -> localhost:3000
                    // If we are mostly testing on localhost, admin.localhost -> localhost
                    if (host.startsWith('admin.')) mainDomain = host.replace('admin.', '')
                }

                const url = new URL('/', `${protocol}://${mainDomain}`)
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }
        }
    }

    // 2. Site Protection
    if (isSiteRoute) {
        // Example: Dashboard protection
        // The original logic checked /dashboard. On site, dashboard is at /(site)/dashboard
        if (rewrittenPath?.includes('/dashboard')) {
            if (!user) {
                const url = request.nextUrl.clone()
                url.pathname = '/login'
                url.searchParams.set('next', request.nextUrl.pathname)
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
