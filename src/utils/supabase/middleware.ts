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

    // Defensive: se as envs Supabase não estão configuradas (ex.: dev local
    // sem .env.local, deploy preview com env só em Production), pula o auth
    // refresh e segue. Páginas públicas continuam funcionando; páginas
    // protegidas falham na hora de fazer query (comportamento esperado).
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return supabaseResponse
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
                const host = request.headers.get('host') || ''
                const protocol = request.headers.get('x-forwarded-proto') || 'http'
                let mainDomain = host.replace('admin.', '')
                if (mainDomain === host) {
                    if (host.startsWith('admin.')) mainDomain = host.replace('admin.', '')
                }

                const url = new URL('/', `${protocol}://${mainDomain}`)
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }
        }
    }

    // 1.3 Bula Protection
    const isBulaRoute = rewrittenPath?.startsWith('/web-bula')
    if (isBulaRoute) {
        const isPublicBulaPath =
            rewrittenPath === '/web-bula' ||
            rewrittenPath === '/web-bula/' ||
            rewrittenPath?.startsWith('/web-bula/cadastro')
        if (!isPublicBulaPath) {
            if (!user) {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }
    }

    // 1.5 ERP Protection
    const isErpRoute = rewrittenPath?.startsWith('/web-erp')
    if (isErpRoute) {
        if (!rewrittenPath?.includes('/login')) {
            if (!user) {
                const url = request.nextUrl.clone()
                url.pathname = '/login'
                url.searchParams.set('next', request.nextUrl.pathname)
                return NextResponse.redirect(url)
            }
            // For now, any authenticated user can access ERP. 
            // In the future, we could check profile roles here.
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
