import Link from "next/link";

interface AdBannerProps {
    position: "leaderboard" | "square" | "thin";
    className?: string;
    imageSrc?: string;
    link?: string;
}

export default function AdBanner({ position, className = "", imageSrc, link = "#" }: AdBannerProps) {
    // Determine sizing based on position prop
    const sizeClasses = {
        leaderboard: "h-32 md:h-40 w-full",
        square: "h-[300px] w-full",
        thin: "h-20 w-full"
    };

    return (
        <div className={`w-full container mx-auto px-4 my-12 ${className}`}>
            <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-200 shadow-sm ${sizeClasses[position]}`}>
                {imageSrc ? (
                    <Link href={link} className="block w-full h-full relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageSrc}
                            alt="Publicidade"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/20 text-[10px] text-white px-1 rounded">
                            Publicidade
                        </div>
                    </Link>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group cursor-pointer hover:bg-gray-100 transition-colors">
                        <span className="text-sm font-semibold uppercase tracking-widest border border-dashed border-gray-300 px-4 py-2 rounded mb-1">
                            Espaço Publicitário
                        </span>
                        <span className="text-xs">
                            Anuncie aqui: (62) 9999-9999
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
