import { useState } from 'react';
import { MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LocationSelectorProps {
  onLocationSelect: (city: string, country: string) => void;
  selectedLocation?: { city: string; country: string } | null;
}

export function LocationSelector({ onLocationSelect, selectedLocation }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const destinations = [
    { city: 'Mumbai', country: 'India', description: 'City of Dreams & Street Food' },
    { city: 'Jaipur', country: 'India', description: 'Pink City of Palaces' },
    { city: 'Paris', country: 'France', description: 'City of Light & Art' },
    { city: 'Tokyo', country: 'Japan', description: 'Modern Meets Traditional' },
    { city: 'Delhi', country: 'India', description: 'Capital of Culture' },
  ];

  const handleLocationSelect = (city: string, country: string) => {
    onLocationSelect(city, country);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>
            {selectedLocation 
              ? `${selectedLocation.city}, ${selectedLocation.country}`
              : 'Select Destination'
            }
          </span>
        </div>
        <Globe className="h-4 w-4" />
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 w-80 z-50 shadow-lg">
          <CardContent className="p-0">
            <div className="p-3 border-b bg-muted/50">
              <h3 className="font-semibold text-sm">Choose Your Adventure</h3>
              <p className="text-xs text-muted-foreground">Select a destination to discover missions</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {destinations.map((destination) => (
                <button
                  key={`${destination.city}-${destination.country}`}
                  onClick={() => handleLocationSelect(destination.city, destination.country)}
                  className="w-full p-3 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {destination.city}, {destination.country}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {destination.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}