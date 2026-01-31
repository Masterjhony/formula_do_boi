import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl
    const hostname = request.headers.get('host')!

    // Check if we are on the admin subdomain
    // Allowed values: "admin.formuladoboi.com", "admin.localhost:3000"
    const isAdminSubdomain = hostname.startsWith('admin.')

    // Rewrite path based on subdomain
    if (isAdminSubdomain) {
        url.pathname = `/web-admin${url.pathname}`
    } else {
        // If on site subdomain but trying to access /admin, redirect to admin subdomain
        if (url.pathname === '/admin') {
            const protocol = request.headers.get('x-forwarded-proto') || 'http'
            const newHost = hostname.startsWith('www.')
                ? hostname.replace('www.', 'admin.')
                : hostname === 'localhost:3000'
                    ? 'admin.localhost:3000'
                    : `admin.${hostname}`

            // Handle specific case where hostname might already be something else
            // If hostname is "app.formuladoboi.com", we want "admin.formuladoboi.com"
            let adminHost = newHost
            if (hostname.startsWith('app.')) {
                adminHost = hostname.replace('app.', 'admin.')
            }

            return NextResponse.redirect(`${protocol}://${adminHost}`)
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
