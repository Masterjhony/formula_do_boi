'use client';

import { useState } from 'react';
import { CalendarCheck, ArrowRight } from 'lucide-react';
import ReservaModal from './ReservaModal';

interface ReservaButtonProps {
    product: {
        id: number;
        name: string;
        category: string;
        kind: 'semen' | 'embriao';
        central?: string | null;
        unit_price?: number | null;
    };
    variant?: 'primary' | 'secondary';
    fullWidth?: boolean;
    label?: string;
}

export default function ReservaButton({
    product,
    variant = 'primary',
    fullWidth = true,
    label,
}: ReservaButtonProps) {
    const [open, setOpen] = useState(false);

    const isPrimary = variant === 'primary';
    const text = label ?? (product.kind === 'semen' ? 'Reservar doses' : 'Reservar embriões');

    const cls = isPrimary
        ? `${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center gap-2 py-4 px-6 bg-[#A0792E] hover:bg-[#D4A85C] text-[#0A0A0A] font-bold text-base uppercase transition-colors shadow-lg shadow-[#A0792E]/20`
        : `${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center gap-2 py-3 px-5 bg-transparent border border-[#A0792E] hover:bg-[#A0792E]/10 text-[#D4A85C] font-bold text-sm uppercase transition-colors`;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={cls}
                style={{ borderRadius: 3, letterSpacing: '0.16em' }}
            >
                <CalendarCheck className="w-5 h-5" />
                {text}
                <ArrowRight className="w-4 h-4" />
            </button>
            <ReservaModal
                open={open}
                onClose={() => setOpen(false)}
                product={product}
            />
        </>
    );
}
