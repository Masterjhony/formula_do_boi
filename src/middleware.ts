import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl
    const hostname = request.headers.get('host')!

    // API routes should not be rewritten — let them pass through directly
    if (url.pathname.startsWith('/api/')) {
        return NextResponse.next()
    }

    // Check if we are on the admin subdomain
    // Allowed values: "admin.formuladoboi.com", "admin.localhost:3000"
    const isAdminSubdomain = hostname.startsWith('admin.')
    const isErpSubdomain = hostname.startsWith('erp.')
    const isBulaSubdomain = hostname.startsWith('adminbula.')
    const isLpSubdomain = hostname.startsWith('lp.')
    const isRootDomain = hostname === 'formuladoboi.com' || hostname === 'www.formuladoboi.com'

    // Rewrite path based on subdomain
    if (isLpSubdomain || isRootDomain) {
        url.pathname = `/web-lp${url.pathname}`
    } else if (isBulaSubdomain) {
        url.pathname = `/web-bula${url.pathname}`
    } else if (isAdminSubdomain) {
        url.pathname = `/web-admin${url.pathname}`
    } else if (isErpSubdomain) {
        url.pathname = `/web-erp${url.pathname}`
    } else {
        // If on site subdomain but trying to access /admin, redirect to admin subdomain
        if (url.pathname.startsWith('/admin')) {
            const protocol = request.headers.get('x-forwarded-proto') || 'http'
            const newHost = hostname.startsWith('www.')
                ? hostname.replace('www.', 'admin.')
                : hostname.startsWith('app.')
                    ? hostname.replace('app.', 'admin.')
                    : hostname === 'localhost:3000'
                        ? 'admin.localhost:3000'
                        : `admin.${hostname}`

            return NextResponse.redirect(`${protocol}://${newHost}${url.pathname.replace('/admin', '')}`)
        }
        
        // If on site subdomain but trying to access /erp, redirect to erp subdomain
        if (url.pathname.startsWith('/erp')) {
            const protocol = request.headers.get('x-forwarded-proto') || 'http'
            const newHost = hostname.startsWith('www.')
                ? hostname.replace('www.', 'erp.')
                : hostname.startsWith('app.')
                    ? hostname.replace('app.', 'erp.')
                    : hostname === 'localhost:3000'
                        ? 'erp.localhost:3000'
                        : `erp.${hostname}`

            return NextResponse.redirect(`${protocol}://${newHost}${url.pathname.replace('/erp', '')}`)
        }

        url.pathname = `/web-site${url.pathname}`
    }

    // Handle auth and session updates
    return await updateSession(request, url.pathname)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files
         */
        '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)',
    ],
}
