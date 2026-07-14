"use client";

import { publicPath } from "@/lib/paths";

type VideoSource = {
    readonly src: string;
    readonly type: "webm" | "mp4";
};

type CoastalVideoProps = {
    readonly sources: readonly VideoSource[];
    readonly poster?: string;
    readonly className?: string;
    readonly autoplay?: boolean;
    readonly loop?: boolean;
    readonly muted?: boolean;
    readonly controls?: boolean;
    readonly playsInline?: boolean;
    readonly preload?: "none" | "metadata" | "auto";
};

export function CoastalVideo({
    sources,
    poster,
    className = "",
    autoplay = false,
    loop = false,
    muted = false,
    controls = false,
    playsInline = false,
    preload = "metadata",
}: CoastalVideoProps) {
    const webpPoster = poster ? poster.replace(/\.(mp4|webm|jpg|jpeg)$/i, ".webp") : undefined;

    return (
        <video
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            controls={controls}
            playsInline={playsInline}
            preload={preload}
            poster={webpPoster ? publicPath(webpPoster) : undefined}
            className={className}
        >
            {sources.map((source, index) => (
                <source
                    key={index}
                    src={publicPath(source.src)}
                    type={`video/${source.type}`}
                />
            ))}
        </video>
    );
}
