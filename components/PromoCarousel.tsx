"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type BannerImage = {
  url: string;
  link: string;
};

type CarouselData = {
  sectionName: string;
  images: BannerImage[];
};

type PromoCarouselProps = {
  variant: "desktop-hero" | "mobile-hero";
};

export default function PromoCarousel({ variant }: PromoCarouselProps) {
  const [data, setData] = useState<CarouselData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Touch Swipe coordinates
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "carousel");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fetchedData = docSnap.data() as CarouselData;
          // Filter out slots that have no URL
          const validImages = (fetchedData.images || []).filter(img => img && img.url);
          setData({
            sectionName: fetchedData.sectionName || "Featured Collections",
            images: validImages,
          });
        } else {
          // Default fallback images from Unsplash
          setData({
            sectionName: "Exclusive Drops",
            images: [
              {
                url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200",
                link: "/shop",
              },
              {
                url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200",
                link: "/shop",
              },
              {
                url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000",
                link: "/shop",
              },
            ],
          });
        }
      } catch (err) {
        console.error("Failed to load promo carousel data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Initialize index when data becomes available
  useEffect(() => {
    if (data) {
      setCurrentIndex(data.images.length > 1 ? 1 : 0);
    }
  }, [data]);

  // Autoplay Logic
  useEffect(() => {
    if (loading || !data || data.images.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, data, isHovered]);

  // Re-enable transition after seamless jump
  useEffect(() => {
    if (!transitionEnabled) {
      const raf = requestAnimationFrame(() => {
        setTransitionEnabled(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [transitionEnabled]);

  if (loading) {
    // Elegant Skeleton State
    return (
      <div
        style={{
          width: "100%",
          height: variant === "mobile-hero" ? "220px" : "100%",
          minHeight: variant === "desktop-hero" ? "450px" : "220px",
          borderRadius: "16px",
          background: "linear-gradient(90deg, #f3f3f3 25%, #e6e6e6 50%, #f3f3f3 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite linear",
        }}
      />
    );
  }

  if (!data || data.images.length === 0) {
    return null;
  }

  const images = data.images;
  const hasMultiple = images.length > 1;
  const slides = hasMultiple ? [images[images.length - 1], ...images, images[0]] : images;

  const handleTransitionEnd = () => {
    if (!hasMultiple) return;
    if (currentIndex === 0) {
      setTransitionEnabled(false);
      setCurrentIndex(images.length);
    } else if (currentIndex === images.length + 1) {
      setTransitionEnabled(false);
      setCurrentIndex(1);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!hasMultiple || !transitionEnabled) return;
    if (currentIndex < 1) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!hasMultiple || !transitionEnabled) return;
    if (currentIndex > images.length) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const threshold = 50; // min swipe distance in px
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left -> next
        handleNext();
      } else {
        // Swiped right -> prev
        handlePrev();
      }
    }
  };

  // Styles based on variant
  const containerStyle: React.CSSProperties =
    variant === "mobile-hero"
      ? {
          height: "220px",
          margin: "0 16px 8px 16px",
          borderRadius: "20px",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#f7f7f7",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
        }
      : {
          width: "100%",
          height: "100%",
          minHeight: "450px",
          borderRadius: "24px",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#f7f7f7",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
        };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", height: "100%" }}>
      {/* Dynamic Section Header for Mobile (or Desktop if needed, but Myntra style is neat) */}
      {variant === "mobile-hero" && (
        <div style={{ padding: "0 16px", marginTop: "4px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", letterSpacing: "0.02em" }}>
            {data.sectionName}
          </h3>
        </div>
      )}

      {/* Main Slider Frame */}
      <div
        style={containerStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Desktop Header Badge */}
        {variant === "desktop-hero" && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(8px)",
              color: "#1a1a1a",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
              zIndex: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            {data.sectionName}
          </div>
        )}

        {/* Slide Tracks */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: transitionEnabled ? "transform 0.55s ease-in-out" : "none",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((banner, index) => {
            const isClickable = !!banner.link;
            const slideContent = (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${banner.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                  cursor: isClickable ? "pointer" : "default",
                }}
              >
                {/* Visual overlay gradient inspired by Nykaa / Myntra banners */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.3) 100%)",
                  }}
                />
              </div>
            );

            return (
              <div key={index} style={{ width: "100%", height: "100%", flexShrink: 0 }}>
                {isClickable ? (
                  <Link href={banner.link} style={{ display: "block", width: "100%", height: "100%" }}>
                    {slideContent}
                  </Link>
                ) : (
                  slideContent
                )}
              </div>
            );
          })}
        </div>

        {/* Arrow Navigation (only shown when hovered on desktop) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(4px)",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                opacity: isHovered || variant === "mobile-hero" ? 1 : 0,
                transition: "opacity 0.25s, background-color 0.2s",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 5,
                color: "#1a1a1a",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.85)")}
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <button
              onClick={handleNext}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(4px)",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                opacity: isHovered || variant === "mobile-hero" ? 1 : 0,
                transition: "opacity 0.25s, background-color 0.2s",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 5,
                color: "#1a1a1a",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.85)")}
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </>
        )}

        {/* Indicators (dots) */}
        {images.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "6px",
              zIndex: 5,
            }}
          >
            {images.map((_, i) => {
              const activeDot = currentIndex === 0 
                ? images.length - 1 
                : (currentIndex === images.length + 1 
                    ? 0 
                    : currentIndex - 1);
              const isActive = activeDot === i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!transitionEnabled) return;
                    setCurrentIndex(i + 1);
                  }}
                  style={{
                    width: isActive ? "16px" : "6px",
                    height: "6px",
                    borderRadius: "999px",
                    backgroundColor: isActive ? "#ffffff" : "rgba(255,255,255,0.5)",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Embedded Shimmer Animation CSS */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
