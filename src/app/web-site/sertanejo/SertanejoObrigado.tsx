"use client";

import React from "react";

export default function SertanejoObrigado() {
    return (
        <div id="obrigado-container">
            <section className="hero-checkout" style={{ paddingTop: "120px", paddingBottom: "120px", background: "var(--bg-primary)", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="container hero-checkout-inner" style={{ textAlign: "center" }}>
                    <div className="badge" style={{ marginBottom: "16px", display: "inline-flex", background: "rgba(30, 136, 229, 0.1)", color: "#1E88E5" }}>
                        <span className="material-icons-outlined" style={{ fontSize: "16px", marginRight: "6px" }}>check_circle</span>
                        Sucesso
                    </div>
                    <h2 style={{ fontWeight: 900, fontSize: "42px", textTransform: "uppercase", lineHeight: 1.1, marginBottom: "24px", color: "var(--text-dark)" }}>
                        Reserva <span className="gold">Enviada!</span>
                    </h2>
                    <p style={{ fontSize: "18px", color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px auto" }}>
                        Muito obrigado por preencher o formulário. Entraremos em contato em breve para dar andamento à sua reserva.
                    </p>

                    <div style={{ background: "var(--bg-secondary)", borderRadius: "16px", padding: "32px", maxWidth: "500px", margin: "0 auto", border: "1px solid rgba(197,160,89,0.2)" }}>
                        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-dark)", marginBottom: "16px" }}>
                            Participe do nosso Grupo VIP!
                        </h3>
                        <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                            Fique por dentro das novidades, receba atualizações exclusivas e converse diretamente com outros investidores e com a nossa equipe.
                        </p>
                        <a 
                            href="#" // ATENÇÃO: Substitua aqui pelo link real do grupo do WhatsApp
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-primary" 
                            style={{ 
                                width: '100%', 
                                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                border: 'none',
                                color: 'white',
                                justifyContent: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <span className="material-icons-outlined" style={{ fontSize: "20px" }}>forum</span>
                            ENTRAR NO GRUPO
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
