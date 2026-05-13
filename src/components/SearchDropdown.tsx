"use client";

import Link from "next/link";
import { ArrowRight, Gavel } from "lucide-react";

export type SearchItem =
    | {
          kind: "product";
          id: string;
          name: string;
          category: string;
          image: string;
          location: string;
          href: string;
          haystack: string;
      }
    | {
          kind: "leilao";
          id: string;
          name: string;
          subtitle: string;
          image: string | null;
          href: string;
      };

interface SearchDropdownProps {
    results: SearchItem[];
    onClose: () => void;
}

export default function SearchDropdown({ results, onClose }: SearchDropdownProps) {
    if (results.length === 0) {
        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-6 text-center text-gray-500 text-sm">
                    Nenhum resultado em sêmen, embriões ou leilões.
                </div>
            </div>
        );
    }

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto z-50">
            <div className="p-2 grid gap-2">
                {results.map((item) =>
                    item.kind === "product" ? (
                        <Link
                            key={item.id}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                            <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 relative bg-white/5">
                                {item.image?.endsWith(".mp4") ? (
                                    <video
                                        src={item.image}
                                        className="w-full h-full object-cover"
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate group-hover:text-brand-gold transition-colors">
                                    {item.name}
                                </h3>
                                <p className="text-gray-400 text-xs uppercase tracking-wide">
                                    {item.category}
                                    {item.location ? ` • ${item.location.split("-")[0].trim()}` : ""}
                                </p>
                            </div>

                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-brand-gold -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </Link>
                    ) : (
                        <Link
                            key={item.id}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                            <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 relative bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Gavel className="w-6 h-6 text-brand-gold" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate group-hover:text-brand-gold transition-colors">
                                    {item.name}
                                </h3>
                                <p className="text-gray-400 text-xs uppercase tracking-wide truncate">
                                    Leilão{item.subtitle ? ` • ${item.subtitle}` : ""}
                                </p>
                            </div>

                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-brand-gold -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </Link>
                    )
                )}
            </div>

            <div className="p-3 bg-white/5 border-t border-white/10 text-center">
                <p className="text-xs text-gray-500">
                    Mostrando top {results.length} resultados
                </p>
            </div>
        </div>
    );
}
