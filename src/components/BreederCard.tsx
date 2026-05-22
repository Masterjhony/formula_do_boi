import Link from "next/link";
import { ArrowRight, Trophy, Star, Medal } from "lucide-react";
import { Breeder } from "@/services/breedersService";

interface BreederCardProps {
    breeder: Breeder;
    rank?: number;
}

export default function BreederCard({ breeder, rank }: BreederCardProps) {
    // Extract stats safely from average_indices
    const stats = {
        mgte: breeder.average_indices?.mgte || breeder.average_indices?.MGTe || "-",
        iabcz: breeder.average_indices?.iabcz || breeder.average_indices?.iABCZ || "-"
    };

    return (
        <Link
            href={`/parceiros/${breeder.slug}`}
            className="group relative block w-full overflow-hidden rounded-xl bg-[#1b1b1b] border border-[#363636] hover:border-brand-gold/60 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-gold/10"
        >
            {/* Background Image with Overlay */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b1b] via-transparent to-transparent z-10" />
                <img
                    src={breeder.cover_image_url || "/placeholder-ranch.jpg"}
                    alt={breeder.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />

                {/* Rank Badge */}
                {rank && (
                    <div className="absolute top-4 left-4 z-20">
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-gold blur-md opacity-40"></div>
                            <div className="relative bg-[#161616]/90 backdrop-blur-md border border-brand-gold/50 px-3 py-1.5 rounded-lg flex flex-col items-center justify-center min-w-[60px]">
                                <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest">TOP</span>
                                <span className="text-xl font-bold text-white leading-none">{rank}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-20 px-6 pb-6 -mt-12">
                {/* Profile Image / Logo */}
                <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 rounded-full border-4 border-[#1b1b1b] p-1 bg-[#1a1a1a] shadow-xl transform group-hover:translate-y-[-5px] transition-transform duration-500 relative">
                        <img
                            src={breeder.profile_image_url || "/placeholder-user.jpg"}
                            alt={breeder.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                        {/* Gold ring effect on hover */}
                        <div className="absolute inset-0 rounded-full border border-brand-gold/0 group-hover:border-brand-gold/50 transition-all duration-500 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 pointer-events-none"></div>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center">
                    {/* Tagline / Subtitle (Manual for now or extracted) */}
                    <div className="flex justify-center items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 text-brand-gold text-xs font-bold tracking-widest uppercase">
                        <Medal className="w-3 h-3" />
                        <span>Top Criador</span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 font-display group-hover:text-brand-gold transition-colors duration-300">
                        {breeder.name}
                    </h3>

                    <p className="text-gray-400 text-sm line-clamp-2 mb-6 h-10 leading-relaxed px-2">
                        {breeder.presentation_text}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-px bg-[#363636] border border-[#363636] rounded-lg overflow-hidden mb-6">
                        <div className="bg-[#1f1f1f] p-3 flex flex-col items-center group/stat hover:bg-[#1a1a1a] transition-colors">
                            <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">MGTe</span>
                            <span className="text-lg font-bold text-white group-hover/stat:text-brand-gold transition-colors">{stats.mgte}</span>
                        </div>
                        <div className="bg-[#1f1f1f] p-3 flex flex-col items-center group/stat hover:bg-[#1a1a1a] transition-colors">
                            <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">iABCZ</span>
                            <span className="text-lg font-bold text-white group-hover/stat:text-brand-gold transition-colors">{stats.iabcz}</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-[#161616] border border-brand-gold/20 hover:border-brand-gold py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                        Ver Portfólio
                        <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
