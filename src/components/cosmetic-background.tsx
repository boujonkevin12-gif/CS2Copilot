"use client";

import { ReactNode } from "react";

const BG_CONFIG: Record<string, {
  gradient?: string;
  className?: string;
  image?: string;
  video?: string;
}> = {
  bg_1: { video: "/bg/0c2bca10660d7ea26dc7c12c4dc039659acd0717.webm" },
  bg_2: { video: "/bg/4d4d1f9cb4b8b79be9a5ad87885b07859483827e.webm" },
  bg_3: { video: "/bg/9d8750d23ea4c08a0a4068c2992900fb5d9e2741.webm" },
  bg_4: { video: "/bg/1607d8d3bbe42cfe5f4c6cb79b4afb19_720w.mp4" },
  bg_5: { video: "/bg/20b7e2e07f4768e99d6ed6b7b069f324.mp4" },
  bg_6: { video: "/bg/270fd07fb27fcce0c54635d361b2db5b_720w.mp4" },
  bg_7: { video: "/bg/34efe178841a2d638f0b26458bbba69e.mp4" },
  bg_8: { video: "/bg/54ba1171f383cc8dc5b5d53f2506c6a4_720w.mp4" },
  bg_9: { video: "/bg/b2239b51b78ae82372fcd48b2df0ff71.mp4" },
  bg_10: { image: "/bg/1bb9e70d3203bd44af15a43337078983.jpg" },
  bg_11: { image: "/bg/8d19f7cea4bb799e34a3f1c0173ef6bf.jpg" },
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
            className="absolute inset-0 w-full h-full object-cover"
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
            className="absolute inset-0 rounded-2xl bg-cover bg-center"
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
