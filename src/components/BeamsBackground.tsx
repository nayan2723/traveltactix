import { useTheme } from "@/hooks/useTheme";

/**
 * Animated beams background using pure CSS.
 * Replaces the R3F version to avoid WebGL crashes.
 */
export function BeamsBackground() {
  const { theme } = useTheme();

  if (theme !== "dark") return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
      
      {/* Animated beams */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="beam"
            style={{
              '--beam-index': i,
              '--beam-delay': `${i * 0.5}s`,
              '--beam-duration': `${8 + i * 0.5}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Ambient glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />

      {/* Inline styles for beam animation */}
      <style>{`
        .beam {
          position: absolute;
          width: 2px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            hsl(var(--primary) / 0.15) 20%,
            hsl(var(--primary) / 0.3) 50%,
            hsl(var(--primary) / 0.15) 80%,
            transparent 100%
          );
          left: calc(10% + var(--beam-index) * 10%);
          transform: translateY(-100%);
          animation: beam-fall var(--beam-duration) ease-in-out infinite;
          animation-delay: var(--beam-delay);
          opacity: 0.6;
          filter: blur(1px);
        }

        .beam::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: inherit;
          filter: blur(8px);
          opacity: 0.5;
        }

        @keyframes beam-fall {
          0% {
            transform: translateY(-100%) scaleY(0.5);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% {
            transform: translateY(50%) scaleY(1);
            opacity: 0.4;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(200%) scaleY(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
