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

  const isPng = config.src.endsWith(".png");

  if (isPng) {
    return (
      <div className={`relative inline-flex justify-center items-center ${className || ""}`}>
        <div className={`relative ${rounded} overflow-hidden`}>{children}</div>
        {config.type === "video" ? (
          <video
            autoPlay loop muted playsInline
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${rounded}`}
            src={config.src}
          />
        ) : (
          <img
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${rounded}`}
            src={config.src}
            alt=""
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex justify-center items-center ${className || ""}`}>
      <div
        className={`absolute ${rounded} overflow-hidden`}
        style={{ top: "-8%", left: "-8%", right: "-8%", bottom: "-8%" }}
      >
        {config.type === "video" ? (
          <video
            autoPlay loop muted playsInline
            className="w-full h-full object-cover"
            src={config.src}
          />
        ) : (
          <img
            className="w-full h-full object-cover"
            src={config.src}
            alt=""
          />
        )}
      </div>
      <div className={`relative z-10 ${rounded} overflow-hidden`}>{children}</div>
    </div>
  );
}
