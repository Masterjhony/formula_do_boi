'use client';

import posthog from 'posthog-js';

export type EventName =
    | 'lp_form_submit'
    | 'lp_whatsapp_redirect'
    | 'whatsapp_cta_click'
    | 'lote_view'
    | 'lote_reserva_click'
    | 'checkout_semen_submit'
    | 'checkout_embriao_submit'
    | 'login_attempt'
    | 'login_success'
    | 'signup_attempt'
    | 'signup_success';

export function trackEvent(name: EventName, properties?: Record<string, unknown>) {
    try {
        if (typeof window === 'undefined') return;
        if (!(posthog as unknown as { __loaded?: boolean }).__loaded) return;
        posthog.capture(name, properties);
    } catch {
        /* noop — analytics never break the UX */
    }
}

export function identifyLead(distinctId: string, traits?: Record<string, unknown>) {
    try {
        if (typeof window === 'undefined') return;
        if (!(posthog as unknown as { __loaded?: boolean }).__loaded) return;
        posthog.identify(distinctId, traits);
    } catch {
        /* noop */
    }
}

export function resetPosthog() {
    try {
        if (typeof window === 'undefined') return;
        if (!(posthog as unknown as { __loaded?: boolean }).__loaded) return;
        posthog.reset();
    } catch {
        /* noop */
    }
}
