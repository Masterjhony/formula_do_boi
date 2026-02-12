import { createClient } from "@/utils/supabase/client";

export interface Breeder {
    id: number;
    name: string;
    slug: string;
    is_partner: boolean;
    presentation_text?: string;
    history_text?: string;
    philosophy_text?: string;
    average_indices?: any;
    portfolio_images?: string[];
    profile_image_url?: string;
    cover_image_url?: string;
    website_url?: string;
    instagram_url?: string;
    whatsapp_url?: string;
    created_at?: string;
}

export const BreedersService = {
    async getTopBreeders() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("breeders")
            .select("*")
            .eq("is_partner", true)
            .order("name");

        if (error) {
            console.error("Error fetching top breeders:", error);
            return [];
        }

        return data as Breeder[];
    },

    async getBreederBySlug(slug: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("breeders")
            .select("*")
            .eq("slug", slug)
            .single();

        if (error) {
            console.error("Error fetching breeder by slug:", error);
            return null;
        }

        return data as Breeder;
    }
};
