import { Suspense, lazy } from "react";
import { MapFallback } from "@/components/SuspenseFallback";

// Lazy load Leaflet components
const LeafletMap = lazy(() => import("./CrowdMapLeaflet"));

interface Place {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  crowd_status: string;
  crowd_percentage: number;
}

interface CrowdMapProps {
  places: Place[];
  onPlaceClick?: (place: Place) => void;
}

export const CrowdMap = ({ places, onPlaceClick }: CrowdMapProps) => {
  return (
    <Suspense fallback={<MapFallback />}>
      <LeafletMap places={places} onPlaceClick={onPlaceClick} />
    </Suspense>
  );
};
