import { useTheme } from "@/hooks/useTheme";
import BeamsComponent from "@/components/ui/beams";

export function BeamsBackground() {
  const { theme } = useTheme();

  if (theme !== "dark") return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <BeamsComponent
        beamWidth={2}
        beamHeight={15}
        beamNumber={8}
        lightColor="#ffffff"
        speed={1.5}
        noiseIntensity={1.2}
        scale={0.15}
        rotation={0}
      />
    </div>
  );
}