'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";

export function HeroBackgroundVideo() {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#070707]">
      <div
        className={cn(
          "absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,176,161,0.14),transparent_28%),linear-gradient(180deg,rgba(5,5,5,0.32),rgba(5,5,5,0.12),rgba(5,5,5,0.5))] transition-opacity duration-500",
          isVideoReady && !hasVideoError ? "opacity-0" : "opacity-100",
        )}
      />
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onCanPlay={() => setIsVideoReady(true)}
        onLoadedData={() => setIsVideoReady(true)}
        onPlaying={() => setIsVideoReady(true)}
        onError={() => setHasVideoError(true)}
        className={cn(
          "animate-slow-zoom absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000",
          hasVideoError ? "opacity-0" : "opacity-100",
        )}
        poster="/18895193.jpg"
      >
        <source
          src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27ee348587d0254d31f0ad470f579d5ec6d3b28&profile_id=164&oauth2_token_id=57447761"
          type="video/mp4"
        />
        <source
          src="https://storage.googleapis.com/coverr-main/mp4/Night-Traffic.mp4"
          type="video/mp4"
        />
      </video>
    </div>
  );
}
