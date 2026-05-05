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

    // Rewrite path based on subdomain
    if (isLpSubdomain) {
        // lp.* foi consolidado em formuladoboi.com/grupo-vip — redireciona pra preservar SEO/links antigos
        const protocol = request.headers.get('x-forwarded-proto') || 'http'
        const newHost = hostname === 'lp.localhost:3000'
            ? 'localhost:3000'
            : hostname.replace(/^lp\./, '')
        const trailing = url.pathname === '/' ? '' : url.pathname
        const target = `${protocol}://${newHost}/grupo-vip${trailing}${url.search}`
        return NextResponse.redirect(target, 301)
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

        // /grupo-vip (e subpaths) servem a Landing Page de captura
        if (url.pathname === '/grupo-vip' || url.pathname.startsWith('/grupo-vip/')) {
            const subPath = url.pathname.slice('/grupo-vip'.length)
            url.pathname = `/web-lp${subPath}`
        } else {
            url.pathname = `/web-site${url.pathname}`
        }
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
        '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|mp4|webm|mp3|ogg|ico|woff|woff2|ttf|otf)$).*)',
    ],
}
