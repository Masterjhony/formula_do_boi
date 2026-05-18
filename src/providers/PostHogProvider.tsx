'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';

function PageviewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const ph = usePostHog();

    useEffect(() => {
        if (!ph || !pathname) return;
        const search = searchParams?.toString();
        const url = search ? `${pathname}?${search}` : pathname;
        ph.capture('$pageview', { $current_url: window.location.origin + url });
    }, [pathname, searchParams, ph]);

    return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
        if (!key || typeof window === 'undefined') return;
        if ((posthog as unknown as { __loaded?: boolean }).__loaded) return;

        posthog.init(key, {
            api_host: host,
            defaults: '2026-01-30',
            person_profiles: 'identified_only',
            capture_pageview: false,
            capture_pageleave: true,
            autocapture: true,
            session_recording: {
                maskAllInputs: true,
                maskTextSelector: '[data-ph-mask]',
            },
            loaded: (ph) => {
                if (process.env.NODE_ENV === 'development') {
                    ph.debug(false);
                }
            },
        });
    }, []);

    return (
        <PHProvider client={posthog}>
            <Suspense fallback={null}>
                <PageviewTracker />
            </Suspense>
            {children}
        </PHProvider>
    );
}
