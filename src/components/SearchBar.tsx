"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import SearchDropdown from "./SearchDropdown";
import { getProductsClient } from "@/services/products";
import { EMBRYOS } from "@/data/embryos";

interface SearchBarProps {
    className?: string;
    placeholder?: string;
    onSearch?: (term: string) => void;
}

export default function SearchBar({ className = "", placeholder = "O que você está procurando?" }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            const dbProducts = await getProductsClient();
            // Combine DB products and static EMBRYOS
            // Ensure no duplicates if ID collision (though unlikely with different sources, good to be safe)
            // For now, just concatenating.
            setAllProducts([...dbProducts, ...EMBRYOS]);
        };

        fetchProducts();
    }, []);

    // Filter products
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const term = searchTerm.toLowerCase();
        const results = allProducts.filter((product) => {
            return (
                product.name.toLowerCase().includes(term) ||
                product.category.toLowerCase().includes(term) ||
                (product.details?.registro && product.details.registro.toLowerCase().includes(term))
            );
        });

        // Limit results to 5
        setSearchResults(results.slice(0, 5));
    }, [searchTerm, allProducts]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const clearSearch = () => {
        setSearchTerm("");
        setSearchResults([]);
    };

    return (
        <div ref={containerRef} className={`relative w-full group ${className}`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-brand-gold/20 p-1.5 rounded-full z-10 pointer-events-none">
                <Search className="w-4 h-4 text-brand-gold" />
            </div>
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                className="w-full pl-14 pr-10 py-3 bg-white/5 border-2 border-brand-gold/30 rounded-full focus:outline-none focus:border-brand-gold focus:bg-white/10 transition-all text-sm text-white placeholder:text-gray-400"
            />

            {searchTerm && (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            {isFocused && (searchTerm.trim().length > 0) && (
                <SearchDropdown results={searchResults} onClose={() => setIsFocused(false)} />
            )}
        </div>
    );
}
