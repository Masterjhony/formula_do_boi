"use client";

import { useState, useSyncExternalStore, type CSSProperties, type VideoHTMLAttributes } from "react";
import { getHtmlVideoSources, getVideoPosterUrl } from "@/lib/video-delivery";

type CompatibleVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "poster" | "src"> & {
    src: string;
    poster?: string | null;
    alt: string;
    className?: string;
    style?: CSSProperties;
};

function hasNativeHlsSupport() {
    if (typeof document === "undefined") return false;
    const video = document.createElement("video");
    return Boolean(
        video.canPlayType("application/vnd.apple.mpegurl") ||
            video.canPlayType("application/x-mpegURL") ||
            video.canPlayType("application/x-mpegurl"),
    );
}

function subscribeToStaticBrowserCapability() {
    return () => {};
}

function getServerHlsSnapshot() {
    return false;
}

export default function CompatibleVideo({
    src,
    poster,
    alt,
    className,
    style,
    onError,
    onLoadedData,
    children,
    ...props
}: CompatibleVideoProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const includeHls = useSyncExternalStore(subscribeToStaticBrowserCapability, hasNativeHlsSupport, getServerHlsSnapshot);
    const failed = failedSrc === src;
    const resolvedPoster = getVideoPosterUrl(src, poster);
    const sources = getHtmlVideoSources(src, { includeHls });
    const sourceKey = sources.map((source) => source.src).join("|");

    if (!sources.length) return null;

    return (
        <>
            {resolvedPoster && (
                // eslint-disable-next-line @next/next/no-img-element -- Poster fallback must keep the same sizing and source as the video.
                <img
                    src={resolvedPoster}
                    alt={alt}
                    className={className}
                    style={style}
                    aria-hidden={failed ? undefined : true}
                />
            )}
            <video
                key={sourceKey}
                {...props}
                className={`${className ?? ""} ${failed ? "hidden" : ""}`.trim()}
                style={style}
                poster={resolvedPoster}
                onError={(event) => {
                    setFailedSrc(src);
                    onError?.(event);
                }}
                onLoadedData={(event) => {
                    setFailedSrc((currentSrc) => (currentSrc === src ? null : currentSrc));
                    onLoadedData?.(event);
                }}
            >
                {sources.map((source) => (
                    <source key={source.src} src={source.src} type={source.type} />
                ))}
                {children ?? "Seu navegador nao suporta video HTML5."}
            </video>
            {failed && (
                <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur"
                >
                    Abrir video
                </a>
            )}
        </>
    );
}
