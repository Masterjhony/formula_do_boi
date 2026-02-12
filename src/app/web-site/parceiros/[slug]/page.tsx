"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BreedersService, Breeder } from "@/services/breedersService";
import { Loader2, Globe, Instagram, Phone, MapPin, Award, History, BookOpen, ChevronRight, Share2, Star } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/utils/supabase/client";

export default function BreederProfilePage() {
    const params = useParams();
    const [breeder, setBreeder] = useState<Breeder | null>(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (params.slug) {
                try {
                    const breederData = await BreedersService.getBreederBySlug(params.slug as string);
                    setBreeder(breederData);

                    if (breederData) {
                        // Fetch products for this breeder using the owner_id relationship if available
                        // Since we don't have a direct link yet in the schema provided in the prompt, 
                        // I will assume we might filter by breeder name or id if products have it.
                        // For now, let's just fetch some featured products as a placeholder or 
                        // attempt to filter if we had the relationship.
                        // *Self-correction*: The prompt didn't strictly link products to breeders via FK in the request.
                        // I will try to fetch products where `owner_id` is the breeder's ID if that column exists, 
                        // or just show a "portfolio" section with images from the JSONB column.

                        // Actually, looking at previous conversations, `products` table might have `owner_id`.
                        // Let's assume for now we use the `portfolio_images` from the breeder record.
                    }
                } catch (error) {
                    console.error("Error fetching breeder details:", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchData();
    }, [params.slug]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#050505]">
                <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
            </div>
        );
    }

    if (!breeder) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-[#050505] text-white">
                <h1 className="text-3xl font-bold mb-4">Criador não encontrado</h1>
                <Link href="/top-criadores" className="text-brand-gold hover:underline">
                    Voltar para Top Criadores
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-gray-200">
            {/* Header / Cover */}
            <div className="relative h-[50vh] min-h-[400px]">
                <div className="absolute inset-0">
                    <img
                        src={breeder.cover_image_url || "/placeholder-ranch.jpg"}
                        alt="Capa"
                        className="w-full h-full object-cover mask-image-gradient-b"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
                </div>

                <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-end pb-12">
                    <div className="flex flex-col md:flex-row items-end gap-8">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-brand-gold shadow-2xl overflow-hidden bg-black shrink-0">
                            <img
                                src={breeder.profile_image_url || "/placeholder-user.jpg"}
                                alt={breeder.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 mb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-brand-gold" />
                                    Top Criador
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 font-display">{breeder.name}</h1>
                            <p className="text-xl text-gray-300 max-w-2xl">{breeder.presentation_text}</p>
                        </div>
                        <div className="flex gap-3 mb-6 md:mb-4">
                            {breeder.website_url && (
                                <a href={breeder.website_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors border border-white/10 hover:border-brand-gold/50">
                                    <Globe className="w-5 h-5" />
                                </a>
                            )}
                            {breeder.instagram_url && (
                                <a href={breeder.instagram_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors border border-white/10 hover:border-brand-gold/50">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {breeder.whatsapp_url && (
                                <a href={`https://wa.me/${breeder.whatsapp_url}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-brand-gold text-brand-black rounded-full hover:bg-yellow-400 transition-colors font-bold shadow-lg shadow-brand-gold/20">
                                    <Phone className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* History */}
                        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-center gap-3 mb-6">
                                <History className="w-6 h-6 text-brand-gold" />
                                <h2 className="text-2xl font-bold text-white">Nossa História</h2>
                            </div>
                            <div className="prose prose-invert prose-lg max-w-none text-gray-400 leading-relaxed">
                                <p>{breeder.history_text || "História não disponível."}</p>
                            </div>
                        </section>

                        {/* Philosophy */}
                        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            <div className="flex items-center gap-3 mb-6">
                                <BookOpen className="w-6 h-6 text-brand-gold" />
                                <h2 className="text-2xl font-bold text-white">Filosofia de Seleção</h2>
                            </div>
                            <div className="p-8 bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Award className="w-32 h-32" />
                                </div>
                                <p className="relative z-10 text-lg text-gray-300 italic">
                                    "{breeder.philosophy_text || "Filosofia não disponível."}"
                                </p>
                            </div>
                        </section>

                        {/* Portfolio Images */}
                        {breeder.portfolio_images && Array.isArray(breeder.portfolio_images) && breeder.portfolio_images.length > 0 && (
                            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <Award className="w-6 h-6 text-brand-gold" />
                                    <h2 className="text-2xl font-bold text-white">Galeria</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {breeder.portfolio_images.map((img, idx) => (
                                        <div key={idx} className="aspect-video rounded-xl overflow-hidden cursor-pointer group">
                                            <img
                                                src={img}
                                                alt={`Galeria ${idx + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Stats */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
                            {/* Indices Card */}
                            <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-white/10 shadow-xl">
                                <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Indicadores Médios</h3>

                                <div className="space-y-6">
                                    {breeder.average_indices && Object.entries(breeder.average_indices).map(([key, value]) => (
                                        <div key={key}>
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <span className="text-2xl font-bold text-brand-gold">{String(value)}</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-gold w-full origin-left animate-pulse" style={{ width: '85%' }} />
                                            </div>
                                        </div>
                                    ))}

                                    {!breeder.average_indices && (
                                        <p className="text-gray-500 text-sm">Nenhum indicador disponível.</p>
                                    )}
                                </div>
                            </div>

                            {/* Contact Card */}
                            <div className="bg-brand-gold rounded-2xl p-8 text-brand-black shadow-xl shadow-brand-gold/10">
                                <h3 className="text-2xl font-bold mb-4">Interessado na Genética?</h3>
                                <p className="mb-6 font-medium opacity-80">
                                    Entre em contato direto com a {breeder.name} para saber mais sobre animais disponíveis.
                                </p>
                                <a
                                    href={`https://wa.me/${breeder.whatsapp_url || ''}`}
                                    target="_blank"
                                    className="block w-full py-4 bg-black text-white text-center font-bold rounded-xl hover:bg-gray-900 transition-colors"
                                >
                                    Falar no WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
