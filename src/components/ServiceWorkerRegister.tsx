"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => registration.update())
                .catch((err) => console.error("Service Worker registration failed", err));
        }
    }, []);

    return null;
}
