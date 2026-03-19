"use client";

import { useRouter } from "next/navigation";

interface PaywallLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    isAuthenticated: boolean;
    redirectPath: string;
    href: string;
    children: React.ReactNode;
}

export default function PaywallLink({ isAuthenticated, redirectPath, href, children, ...props }: PaywallLinkProps) {
    const router = useRouter();

    if (isAuthenticated) {
        return <a href={href} {...props}>{children}</a>;
    }

    return (
        <a
            {...props}
            href="#"
            onClick={(e) => {
                e.preventDefault();
                router.push(`/auth/signup?redirect=${encodeURIComponent(redirectPath)}`);
            }}
        >
            {children}
        </a>
    );
}
