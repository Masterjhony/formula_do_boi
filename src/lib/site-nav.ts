"use client";

import { useEffect, useState } from "react";
import { SettingsService } from "@/services/settingsService";

export type NavItem = { href: string; label: string };

const BASE: Record<string, NavItem> = {
    semen: { href: "/semen", label: "Sêmen" },
    touros: { href: "/touros", label: "Touros" },
    embrioes: { href: "/embrioes", label: "Embriões" },
    grupoVip: { href: "/grupo-vip", label: "Grupo VIP" },
};

type FlagInput = {
    semenEnabled?: unknown;
    tourosEnabled?: unknown;
};

export function buildNavItems({ semenEnabled, tourosEnabled }: FlagInput): NavItem[] {
    const items: NavItem[] = [];
    if (semenEnabled === true) items.push(BASE.semen);
    if (tourosEnabled !== false) items.push(BASE.touros);
    items.push(BASE.embrioes, BASE.grupoVip);
    return items;
}

// Fallback antes do fetch (mesma forma que a UI tinha antes — sem Sêmen, com Touros).
export const NAV_ITEMS_FALLBACK: NavItem[] = buildNavItems({});

const CACHE_KEY = "site_nav_settings_cache";

export function useSiteNavItems(): NavItem[] {
    const [items, setItems] = useState<NavItem[]>(NAV_ITEMS_FALLBACK);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    setItems(buildNavItems(JSON.parse(cached)));
                } catch {
                    // ignore corrupt cache
                }
            }
        }

        let cancelled = false;
        (async () => {
            const semenEnabled = await SettingsService.getSetting("semen_page_enabled");
            const tourosEnabled = await SettingsService.getSetting("touros_page_enabled");
            if (cancelled) return;
            try {
                localStorage.setItem(
                    CACHE_KEY,
                    JSON.stringify({ semenEnabled, tourosEnabled })
                );
            } catch {
                // ignore quota / disabled storage
            }
            setItems(buildNavItems({ semenEnabled, tourosEnabled }));
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return items;
}
