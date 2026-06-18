const CLOUDINARY_VIDEO_MARKER = "/video/upload/";
const IMAGE_EXT_RE = /\.(avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;
const VIDEO_EXT_RE = /\.(m3u8|m4v|mov|mp4|webm)(?:[?#].*)?$/i;

export type HtmlVideoSource = {
    src: string;
    type: string;
};

type HtmlVideoSourceOptions = {
    includeHls?: boolean;
};

function splitCloudinaryVideoUrl(url: string) {
    const markerIndex = url.indexOf(CLOUDINARY_VIDEO_MARKER);
    if (markerIndex === -1) return null;

    const base = url.slice(0, markerIndex + CLOUDINARY_VIDEO_MARKER.length);
    const restWithSuffix = url.slice(markerIndex + CLOUDINARY_VIDEO_MARKER.length);
    const rest = restWithSuffix.split(/[?#]/)[0];

    const versionMatch = rest.match(/(?:^|\/)(v\d+\/.+)$/);
    const assetPath = versionMatch?.[1] ?? rest;
    if (!assetPath) return null;

    const assetPathWithoutExt = assetPath.replace(/\.[a-z0-9]+$/i, "");
    return { base, assetPathWithoutExt };
}

export function isVideoUrl(url?: string | null) {
    const clean = (url ?? "").trim();
    if (!clean) return false;
    if (IMAGE_EXT_RE.test(clean)) return false;
    return VIDEO_EXT_RE.test(clean) || clean.includes(CLOUDINARY_VIDEO_MARKER);
}

export function getCloudinaryHlsUrl(url?: string | null) {
    const clean = (url ?? "").trim();
    if (!clean) return null;
    const parts = splitCloudinaryVideoUrl(clean);
    if (!parts) return null;
    return `${parts.base}sp_auto/${parts.assetPathWithoutExt}.m3u8`;
}

export function getCloudinaryVideoPosterUrl(url?: string | null) {
    const clean = (url ?? "").trim();
    if (!clean) return null;
    const parts = splitCloudinaryVideoUrl(clean);
    if (!parts) return null;
    return `${parts.base}so_auto,w_1280,h_720,c_fill,g_auto,q_auto/${parts.assetPathWithoutExt}.jpg`;
}

export function getVideoPosterUrl(url?: string | null, preferredPoster?: string | null) {
    if (preferredPoster) return preferredPoster;

    const clean = (url ?? "").trim();
    if (!clean) return undefined;

    const cloudinaryPoster = getCloudinaryVideoPosterUrl(clean);
    if (cloudinaryPoster) return cloudinaryPoster;

    if (/\.(mp4|m4v|mov)(?:[?#].*)?$/i.test(clean)) {
        return clean.replace(/\.(mp4|m4v|mov)([?#].*)?$/i, ".jpg");
    }

    return undefined;
}

export function getHtmlVideoSources(url?: string | null, options: HtmlVideoSourceOptions = {}): HtmlVideoSource[] {
    const clean = (url ?? "").trim();
    if (!clean) return [];

    const hlsUrl = getCloudinaryHlsUrl(clean);
    const sources: HtmlVideoSource[] = [];

    if (hlsUrl && options.includeHls) {
        sources.push({ src: hlsUrl, type: "application/vnd.apple.mpegurl" });
        sources.push({ src: hlsUrl, type: "application/x-mpegURL" });
    }

    if (/\.webm(?:[?#].*)?$/i.test(clean)) {
        sources.push({ src: clean, type: "video/webm" });
    } else {
        sources.push({ src: clean, type: "video/mp4" });
    }

    return sources;
}
