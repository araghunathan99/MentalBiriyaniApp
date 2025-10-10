import { useEffect, useState } from "react";
import { fetchLocalMedia } from "@/lib/localMedia";
import type { MediaItem } from "@/lib/types";

interface ImageLettersProps {
  text: string;
  className?: string;
}

export default function ImageLetters({ text, className = "" }: ImageLettersProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMedia = async () => {
      const items = await fetchLocalMedia();
      // Only use images, filter out videos
      const images = items.filter((item) => item.isImage);
      setMedia(images);
      setLoading(false);
    };
    loadMedia();
  }, []);

  if (loading || media.length === 0) {
    return (
      <div className={className}>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          {text}
        </h1>
      </div>
    );
  }

  // Split text into lines
  const lines = text.split('\n');

  return (
    <div className={className}>
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="flex flex-wrap justify-center gap-1 md:gap-2 mb-2 md:mb-4">
          {line.split('').map((char, charIndex) => {
            if (char === ' ') {
              return <div key={charIndex} className="w-8 md:w-12" />;
            }

            // Get random images for this character (4x4 grid = 16 images)
            const startIdx = (lineIndex * line.length + charIndex) * 16;
            const charImages = Array.from({ length: 16 }, (_, i) => 
              media[(startIdx + i) % media.length]
            );

            return (
              <div
                key={charIndex}
                className="relative inline-block"
                style={{
                  width: '48px',
                  height: '64px',
                }}
              >
                {/* Character mask */}
                <div
                  className="absolute inset-0 text-6xl font-bold flex items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(to bottom, #ffffff, #FFD700)`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'brightness(1.5) contrast(1.2)',
                  }}
                >
                  {char}
                </div>

                {/* Image grid with mask */}
                <div
                  className="absolute inset-0"
                  style={{
                    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='64'%3E%3Ctext x='24' y='52' font-size='60' font-weight='bold' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif'%3E${char}%3C/text%3E%3C/svg%3E")`,
                    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='64'%3E%3Ctext x='24' y='52' font-size='60' font-weight='bold' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif'%3E${char}%3C/text%3E%3C/svg%3E")`,
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                  }}
                >
                  <div className="grid grid-cols-4 grid-rows-4 w-full h-full">
                    {charImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative overflow-hidden"
                        style={{
                          backgroundImage: `url(${img.webContentLink})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Bright overlay for contrast */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,215,0,0.5), rgba(255,255,255,0.3))',
                      mixBlendMode: 'screen',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
