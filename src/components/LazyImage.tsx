import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  aspectRatio?: "square" | "video" | "wide" | "portrait" | "auto";
  priority?: boolean;
}

export const LazyImage = ({
  src,
  alt,
  fallback = "/placeholder.svg",
  aspectRatio = "auto",
  priority = false,
  className,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    portrait: "aspect-[3/4]",
    auto: "",
  }[aspectRatio];

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", aspectRatioClass, className)}>
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={error ? fallback : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          {...props}
        />
      )}
    </div>
  );
};

// Optimized background image component
export const LazyBackgroundImage = ({
  src,
  fallback = "/placeholder.svg",
  className,
  children,
}: {
  src: string;
  fallback?: string;
  className?: string;
  children?: React.ReactNode;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Preload image
          const img = new Image();
          img.src = src;
          img.onload = () => {
            setCurrentSrc(src);
            setIsLoaded(true);
          };
          img.onerror = () => {
            setCurrentSrc(fallback);
            setIsLoaded(true);
          };
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [src, fallback]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-muted transition-opacity duration-500",
        isLoaded ? "opacity-100" : "opacity-70",
        className
      )}
      style={{
        backgroundImage: currentSrc ? `url(${currentSrc})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {children}
    </div>
  );
};
