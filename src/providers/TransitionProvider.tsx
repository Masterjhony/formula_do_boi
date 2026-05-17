"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import PageTransition from "@/components/PageTransition";

interface TransitionContextType {
    isTransitioning: boolean;
    navigate: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextType>({
    isTransitioning: false,
    navigate: () => {},
});

export function useTransition() {
    return useContext(TransitionContext);
}

// Duração total da transição (ms)
const SHOW_DURATION = 320;   // tempo para overlay aparecer antes de navegar
const TOTAL_DURATION = 900;  // tempo total até overlay sumir

function isNavigableLink(anchor: HTMLAnchorElement): string | null {
    const href = anchor.getAttribute("href");
    if (!href) return null;

    // Ignorar links especiais
    if (anchor.target === "_blank") return null;
    if (anchor.hasAttribute("download")) return null;
    if (href.startsWith("#")) return null;
    if (/^(mailto|tel|sms|javascript):/.test(href)) return null;
    if (/^https?:\/\//.test(href)) return null;

    return href;
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTransitioningRef = useRef(false);

    const navigate = useCallback(
        (href: string) => {
            // Não re-disparar se já está na mesma rota
            const cleanHref = href.split("?")[0].split("#")[0];
            const cleanCurrent = pathname.split("?")[0].split("#")[0];
            if (cleanHref === cleanCurrent) return;

            // Evitar transições sobrepostas
            if (isTransitioningRef.current) return;

            isTransitioningRef.current = true;
            setIsTransitioning(true);

            // Navegar após overlay aparecer
            setTimeout(() => {
                router.push(href);
            }, SHOW_DURATION);

            // Esconder overlay após navegação concluída
            if (hideTimer.current) clearTimeout(hideTimer.current);
            hideTimer.current = setTimeout(() => {
                setIsTransitioning(false);
                isTransitioningRef.current = false;
            }, TOTAL_DURATION);
        },
        [router, pathname]
    );

    // Interceptor global de cliques em links internos
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            // Ignorar cliques modificados (ctrl, cmd, shift, middle-click)
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (e.button !== 0) return;

            const anchor = (e.target as Element).closest("a");
            if (!anchor) return;

            const href = isNavigableLink(anchor as HTMLAnchorElement);
            if (!href) return;

            e.preventDefault();
            navigate(href);
        }

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [navigate]);

    // Esconder overlay se o usuário usar o botão voltar/avançar
    useEffect(() => {
        if (isTransitioningRef.current) return;
        setIsTransitioning(false);
    }, [pathname]);

    // Cleanup ao desmontar
    useEffect(() => {
        return () => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, []);

    return (
        <TransitionContext.Provider value={{ isTransitioning, navigate }}>
            {children}
            <PageTransition isVisible={isTransitioning} />
        </TransitionContext.Provider>
    );
}
