"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { sertanejoCss } from "../sertanejoCss";
import SertanejoObrigado from "../SertanejoObrigado";

export default function SertanejoObrigadoPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);

        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="sertanejo-wrap">
            <style dangerouslySetInnerHTML={{ __html: sertanejoCss }} />
            <div className="top-bar">
                <div className="container top-bar-inner">
                    <img src="/assets/sertanejo/logo-icon.png" alt="Fórmula do Boi" style={{ height: "22px", width: "auto" }} />
                    <span>FÓRMULA DO BOI</span>
                    <span style={{ fontSize: "10px", letterSpacing: "2px", color: "rgba(197,160,89,0.5)", marginLeft: "4px" }}>ACELERADORA DE TOUROS</span>
                </div>
            </div>

            <header className={`header ${scrolled ? "scrolled" : ""}`} id="header">
                <div className="header-inner">
                    <Link href="/sertanejo" className="header-logo" aria-label="Fórmula do Boi — Página inicial">
                        <img src="/assets/sertanejo/logo_header.svg" alt="Fórmula do Boi" />
                    </Link>
                    <Link href="/sertanejo" className="header-back" aria-label="Voltar para Sertanejo">
                        <span className="material-icons-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
                        Voltar para Sertanejo
                    </Link>
                </div>
            </header>

            <div style={{ paddingTop: "80px" }}>
                <SertanejoObrigado />
            </div>

            <footer className="footer">
                <div className="container footer-inner">
                    <div className="footer-logo">
                        <img src="/assets/sertanejo/logo-icon.png" alt="Fórmula do Boi" style={{ height: "24px", width: "auto", filter: "brightness(1.2)" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ color: "rgba(255,255,255,0.5)" }}>FÓRMULA DO BOI &copy; 2026</span>
                            <span style={{ color: "rgba(197,160,89,0.4)", fontSize: "10px", letterSpacing: "1.5px" }}>ACELERADORA DE TOUROS</span>
                        </div>
                    </div>
                </div>
            </footer>

            <div className="bottom-bar">
                <div className="container bottom-bar-inner">
                    <img src="/assets/sertanejo/logo-icon.png" alt="Fórmula do Boi" style={{ height: "16px", width: "auto" }} />
                    <span>formuladoboi.com</span>
                </div>
            </div>
        </div>
    );
}
