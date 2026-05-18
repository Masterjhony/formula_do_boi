'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/posthog-client';

interface Props {
    productId: number;
    name: string;
    kind: 'semen' | 'embriao' | 'touro' | 'matriz' | string;
    category?: string;
    central?: string | null;
    unitPrice?: number | null;
}

export default function LoteViewTracker(props: Props) {
    useEffect(() => {
        trackEvent('lote_view', {
            product_id: props.productId,
            product_name: props.name,
            kind: props.kind,
            category: props.category,
            central: props.central,
            unit_price: props.unitPrice,
        });
    }, [props.productId, props.name, props.kind, props.category, props.central, props.unitPrice]);

    return null;
}
