"use client";

import { ReactNode } from "react";

const BG_CONFIG: Record<string, {
  gradient?: string;
  className?: string;
  image?: string;
  video?: string;
}> = {
  bg_calm_night: {
    video: "/bg-calm-night.mp4",
  },
  bg_anime_img_1: {
    image: "/bg-anime-img-1.jpg",
  },
  bg_anime_img_2: {
    image: "/bg-anime-img-2.jpg",
  },
  bg_anime_vid_1: {
    video: "/bg-anime-vid-1.mp4",
  },
  bg_anime_vid_2: {
    video: "/bg-anime-vid-2.mp4",
  },
  bg_anime_vid_4: {
    video: "/bg-anime-vid-4.mp4",
  },
  bg_anime_vid_5: {
    video: "/bg-anime-vid-5.mp4",
  },
};

export function getBackgroundConfig(bgId: string | null | undefined) {
  if (!bgId) return null;
  return BG_CONFIG[bgId] || null;
}

export function CosmeticBackground({ bgId, children }: { bgId: string | null | undefined; children: ReactNode }) {
  const config = bgId ? BG_CONFIG[bgId] : null;
  if (!config) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {config.video && (
        <>
          <video
            className="absolute inset-0 w-full h-full object-contain"
            src={config.video}
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-black/30" />
        </>
      )}
      {config.image && (
        <>
          <div
            className="absolute inset-0 rounded-2xl bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${config.image})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </>
      )}
      {config.gradient && (
        <div className="absolute inset-0 rounded-2xl" style={{ background: config.gradient }} />
      )}
      {config.className && (
        <>
          <div className="bg-layer-1" />
          <div className="bg-layer-2" />
          <div className="bg-layer-3" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
