"use client";

import { getFrameImageConfig, getFrameClasses } from "@/lib/cosmetics";

interface CosmeticFrameProps {
  frameId: string | null | undefined;
  rounded?: string;
  className?: string;
  children: React.ReactNode;
}

export function CosmeticFrame({ frameId, rounded = "rounded-full", className, children }: CosmeticFrameProps) {
  const config = getFrameImageConfig(frameId);

  if (!config) {
    const cls = getFrameClasses(frameId);
    return <div className={`${cls} ${className || ""}`}>{children}</div>;
  }

  return (
    <div className={`relative inline-flex ${className || ""}`}>
      {config.type === "video" ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover ${rounded}`}
          src={config.src}
        />
      ) : (
        <img
          className={`absolute inset-0 w-full h-full object-cover ${rounded}`}
          src={config.src}
          alt=""
        />
      )}
      <div className={`relative z-10 m-[2px] ${rounded} overflow-hidden`}>{children}</div>
    </div>
  );
}
