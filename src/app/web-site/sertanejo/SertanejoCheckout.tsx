"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function getUtmParams() {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source') || 'site',
        utm_medium: params.get('utm_medium') || 'organic',
        utm_campaign: params.get('utm_campaign') || 'sertanejo/checkout',
        utm_content: params.get('utm_content') || 'formulario_principal',
    };
}

export default function SertanejoCheckout() {
    const router = useRouter();
    const [estados, setEstados] = useState<{ sigla: string; nome: string }[]>([]);
    const [cidades, setCidades] = useState<{ id: number; nome: string }[]>([]);
    const [selectedUf, setSelectedUf] = useState("");
    const [selectedCidade, setSelectedCidade] = useState("");

    useEffect(() => {
        fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
            .then(res => res.json())
            .then(data => setEstados(data))
            .catch(() => {});
    }, []);

    const handleUfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const uf = e.target.value;
        setSelectedUf(uf);
        setSelectedCidade("");
        setCidades([]);
        if (uf) {
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
                .then(res => res.json())
                .then(data => setCidades(data))
                .catch(() => {});
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const btn = form.querySelector('.btn-checkout') as HTMLButtonElement;

        const baseData = Object.fromEntries(new FormData(form).entries());
        
        let rawCpf = String(baseData.cpf || '').replace(/\D/g, '');
        let cpfFormatado = baseData.cpf;
        if (rawCpf.length === 11) {
            cpfFormatado = rawCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }

        const data = {
            ...baseData,
            cpf: cpfFormatado,
            cidade: `${selectedCidade}/${selectedUf}`,
            ...getUtmParams(),
        };

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px">hourglass_top</span> ENVIANDO...';
        }

        try {
            const res = await fetch('/api/checkout-semen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Erro no servidor');

            if (btn) {
                btn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px">check_circle</span> RESERVA ENVIADA!';
                btn.style.background = '#1B5E20';
            }
            form.reset();

            setTimeout(() => {
                router.push('/sertanejo/obrigado');
            }, 800);
        } catch {
            if (btn) {
                btn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px">error</span> ERRO — TENTE NOVAMENTE';
                btn.style.background = '#B71C1C';
                btn.disabled = false;
            }
            setTimeout(() => {
                if (btn) {
                    btn.innerHTML = '<span class="material-icons-outlined" style="font-size:18px">send</span> ENVIAR RESERVA';
                    btn.style.background = '';
                }
            }, 4000);
        }
    };

    const handleCpfInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 9) {
            v = v.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{1,2})/, '$1.$2.$3-$4');
        } else if (v.length > 6) {
            v = v.replace(/(\\d{3})(\\d{3})(\\d{1,3})/, '$1.$2.$3');
        } else if (v.length > 3) {
            v = v.replace(/(\\d{3})(\\d{1,3})/, '$1.$2');
        }
        e.target.value = v;
    };

    return (
        <div id="checkout-container">
            {/* HERO / COUNTER SECTION */}
            <section className="hero-checkout" id="reserva-doses" style={{ paddingTop: "80px", paddingBottom: "60px", background: "var(--bg-primary)" }}>
                <div className="container hero-checkout-inner">
                    <div className="badge" style={{ marginBottom: "16px" }}>Aceleradora de Touros Fórmula do Boi</div>
                    <h2 style={{ fontWeight: 900, fontSize: "42px", textTransform: "uppercase", lineHeight: 1.1, marginBottom: "32px", color: "var(--text-dark)" }}>
                        Reserve Suas <span className="gold">Doses</span>
                    </h2>

                    <div className="counter-block">
                        <div className="counter-label">Doses Reservadas</div>
                        <div className="counter-numbers" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                            <span style={{ fontWeight: 900, fontSize: '56px', color: 'var(--gold)', lineHeight: 1 }}>2.500</span>
                            <span style={{ fontWeight: 600, fontSize: '24px', color: 'var(--text-secondary)' }}>de</span>
                            <span style={{ fontWeight: 700, fontSize: '24px', color: 'var(--text-secondary)', lineHeight: 1 }}>5.000</span>
                            <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-secondary)' }}>doses</span>
                        </div>
                        <div style={{ width: '100%', height: '20px', background: 'rgba(197,160,89,0.15)', borderRadius: '999px', overflow: 'hidden', position: 'relative', marginBottom: '20px' }}>
                            <div style={{ height: '100%', width: '50%', background: 'linear-gradient(135deg, #C5A059, #A8853A)', borderRadius: '999px', position: 'relative' }}></div>
                            <span style={{ position: 'absolute', right: '50%', transform: 'translateX(20px)', top: '1px', fontWeight: 700, fontSize: '11px', color: '#fff' }}>50%</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                            <span className="badge" style={{ background: 'rgba(211,47,47,0.1)', color: '#D32F2F', padding: '6px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D32F2F', display: 'inline-block', marginRight: '6px' }}></span>
                                Doses Limitadas
                            </span>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span className="material-icons-outlined" style={{ fontSize: '18px', color: 'var(--gold)' }}>info</span>
                            Touro ainda está em quarentena — previsão de entrega a partir de Maio/2026
                        </div>
                    </div>
                </div>
            </section>

            {/* PRICING SECTION */}
            <section className="precos section-padding" id="precos" style={{ background: "var(--bg-secondary)" }}>
                <div className="container">
                    <div className="section-header">
                        <div className="badge" style={{ marginBottom: "16px" }}>Tabela de Preços</div>
                        <h2>Invista em <span className="gold">Genética de Elite</span></h2>
                        <p>Quanto maior o volume, maior o desconto. Escolha a faixa ideal para o seu rebanho.</p>
                    </div>
                    <div className="pricing-grid">
                        <div className="pricing-card">
                            <div className="pricing-qty">1 – 99 doses</div>
                            <div className="pricing-price">R$35<small>,00 /dose</small></div>
                            <div className="pricing-detail">Preço unitário padrão</div>
                            <a href="#reserva" className="btn-primary" style={{ marginTop: 'auto' }}>
                                <span className="material-icons-outlined" style={{ fontSize: "16px" }}>shopping_cart</span>
                                Reservar
                            </a>
                        </div>
                        <div className="pricing-card featured">
                            <div className="pricing-badge">Mais Vendido</div>
                            <div className="pricing-qty">100 – 399 doses</div>
                            <div className="pricing-price">R$31<small>,50 /dose</small></div>
                            <div className="pricing-detail">10% de desconto</div>
                            <a href="#reserva" className="btn-primary" style={{ marginTop: 'auto' }}>
                                <span className="material-icons-outlined" style={{ fontSize: "16px" }}>shopping_cart</span>
                                Reservar
                            </a>
                        </div>
                        <div className="pricing-card">
                            <div className="pricing-qty">400 – 999 doses</div>
                            <div className="pricing-price">R$28<small>,00 /dose</small></div>
                            <div className="pricing-detail">20% de desconto</div>
                            <a href="#reserva" className="btn-primary" style={{ marginTop: 'auto' }}>
                                <span className="material-icons-outlined" style={{ fontSize: "16px" }}>shopping_cart</span>
                                Reservar
                            </a>
                        </div>
                        <div className="pricing-card">
                            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #2E7D32, #1B5E20)', color: '#fff', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 18px', borderRadius: '999px', whiteSpace: 'nowrap' }}>Atacado</div>
                            <div className="pricing-qty">1.000+ doses</div>
                            <div className="pricing-price">R$24<small>,50 /dose</small></div>
                            <div className="pricing-detail">30% de desconto</div>
                            <a href="#reserva" className="btn-primary" style={{ marginTop: 'auto' }}>
                                <span className="material-icons-outlined" style={{ fontSize: "16px" }}>shopping_cart</span>
                                Reservar
                            </a>
                        </div>
                    </div>
                    <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "var(--text-secondary)" }}>
                        <span className="material-icons-outlined" style={{ fontSize: "16px", verticalAlign: "middle", marginRight: "4px" }}>local_shipping</span>
                        Frete e logística facilitada pelo Fórmula do Boi. <strong style={{ color: "var(--text-dark)" }}>Entrega em todo o Brasil.</strong>
                    </p>
                    <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "var(--gold)", fontWeight: 600 }}>
                        <span className="material-icons-outlined" style={{ fontSize: "16px", verticalAlign: "middle", marginRight: "4px" }}>credit_card</span>
                        Condições: À vista, 8x no boleto ou 12x no cartão
                    </p>
                </div>
            </section>

            {/* RESERVATION FORM */}
            <section className="form-section" id="reserva">
                <div className="container">
                    <div className="section-header">
                        <div className="badge" style={{ marginBottom: "16px", background: "rgba(255,255,255,0.1)", color: "#fff" }}>Reserva</div>
                        <h2>Reserve suas doses direto com um <span className="gold">Consultor Fórmula do Boi</span></h2>
                        <p>Preencha o formulário abaixo e um especialista entrará em contato.</p>
                    </div>
                    <div className="form-container">
                        <form id="reservaForm" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label htmlFor="nome">Nome Completo</label>
                                    <input type="text" id="nome" name="nome" placeholder="Seu nome completo" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fazenda">Nome da Fazenda</label>
                                    <input type="text" id="fazenda" name="fazenda" placeholder="Fazenda Exemplo" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cpf">CPF</label>
                                    <input type="text" id="cpf" name="cpf" placeholder="000.000.000-00" maxLength={14} onChange={handleCpfInput} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="animais">Número de Animais</label>
                                    <input type="number" id="animais" name="animais" placeholder="Ex: 500" min="1" required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px' }}>
                                    <div className="form-group">
                                        <label htmlFor="uf">UF</label>
                                        <select id="uf" name="uf" value={selectedUf} onChange={handleUfChange} required>
                                            <option value="" disabled>UF</option>
                                            {estados.map(est => (
                                                <option key={est.sigla} value={est.sigla}>{est.sigla}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cidade_nome">Cidade</label>
                                        <select id="cidade_nome" name="cidade_nome" value={selectedCidade} onChange={(e) => setSelectedCidade(e.target.value)} required disabled={!selectedUf}>
                                            <option value="" disabled>Selecione</option>
                                            {cidades.map(cid => (
                                                <option key={cid.id} value={cid.nome}>{cid.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="doses">Número de Doses para Reserva</label>
                                    <input type="number" id="doses" name="doses" placeholder="Ex: 200" min="1" required />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="parcelamento">Condição de Parcelamento</label>
                                    <select id="parcelamento" name="parcelamento" defaultValue="" required>
                                        <option value="" disabled>Selecione...</option>
                                        <option value="avista">À Vista</option>
                                        <option value="8x-boleto">8x no Boleto</option>
                                        <option value="12x-cartao">12x no Cartão</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn-checkout" style={{ width: '100%', background: 'linear-gradient(135deg, #2E7D32, #1B5E20)' }}>
                                <span className="material-icons-outlined" style={{ fontSize: "18px" }}>send</span>
                                ENVIAR RESERVA
                            </button>
                        </form>
                        <div className="form-note">
                            <span className="material-icons-outlined">support_agent</span>
                            Um consultor Fórmula do Boi entrará em contato para confirmar sua reserva.
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
