import { useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface LocationSelectorProps {
  onLocationSelect: (city: string, country: string) => void;
  selectedLocation?: { city: string; country: string } | null;
}

export function LocationSelector({ onLocationSelect, selectedLocation }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const destinations = [
    // Andhra Pradesh
    { city: 'Visakhapatnam', country: 'India', description: 'Port City & Beaches', state: 'Andhra Pradesh' },
    { city: 'Tirupati', country: 'India', description: 'Sacred Temple Town', state: 'Andhra Pradesh' },
    // Arunachal Pradesh
    { city: 'Tawang', country: 'India', description: 'Monastery & Mountain Beauty', state: 'Arunachal Pradesh' },
    // Assam
    { city: 'Guwahati', country: 'India', description: 'Gateway to Northeast', state: 'Assam' },
    { city: 'Kaziranga', country: 'India', description: 'One-horned Rhino Sanctuary', state: 'Assam' },
    // Bihar
    { city: 'Bodh Gaya', country: 'India', description: 'Land of Enlightenment', state: 'Bihar' },
    { city: 'Patna', country: 'India', description: 'Ancient Pataliputra', state: 'Bihar' },
    // Chhattisgarh
    { city: 'Raipur', country: 'India', description: 'Rice Bowl of India', state: 'Chhattisgarh' },
    // Goa
    { city: 'Panaji', country: 'India', description: 'Beaches & Portuguese Heritage', state: 'Goa' },
    { city: 'Palolem', country: 'India', description: 'Paradise Beach', state: 'Goa' },
    // Gujarat
    { city: 'Ahmedabad', country: 'India', description: 'Heritage City of Gujarat', state: 'Gujarat' },
    { city: 'Dwarka', country: 'India', description: 'Krishna\'s Kingdom', state: 'Gujarat' },
    { city: 'Rann of Kutch', country: 'India', description: 'White Desert', state: 'Gujarat' },
    // Haryana
    { city: 'Kurukshetra', country: 'India', description: 'Land of Bhagavad Gita', state: 'Haryana' },
    // Himachal Pradesh
    { city: 'Shimla', country: 'India', description: 'Queen of Hill Stations', state: 'Himachal Pradesh' },
    { city: 'Manali', country: 'India', description: 'Adventure Sports Paradise', state: 'Himachal Pradesh' },
    { city: 'Dharamshala', country: 'India', description: 'Home of Dalai Lama', state: 'Himachal Pradesh' },
    { city: 'Spiti Valley', country: 'India', description: 'Cold Desert Mountain', state: 'Himachal Pradesh' },
    // Jharkhand
    { city: 'Ranchi', country: 'India', description: 'City of Waterfalls', state: 'Jharkhand' },
    // Karnataka
    { city: 'Bangalore', country: 'India', description: 'Garden City & IT Hub', state: 'Karnataka' },
    { city: 'Mysore', country: 'India', description: 'Palace City', state: 'Karnataka' },
    { city: 'Hampi', country: 'India', description: 'Ancient Ruins & Boulders', state: 'Karnataka' },
    { city: 'Coorg', country: 'India', description: 'Scotland of India', state: 'Karnataka' },
    { city: 'Gokarna', country: 'India', description: 'Spiritual Beach Town', state: 'Karnataka' },
    // Kerala
    { city: 'Kochi', country: 'India', description: 'Queen of Arabian Sea', state: 'Kerala' },
    { city: 'Alleppey', country: 'India', description: 'Venice of the East', state: 'Kerala' },
    { city: 'Munnar', country: 'India', description: 'Tea Gardens Paradise', state: 'Kerala' },
    { city: 'Thekkady', country: 'India', description: 'Spice Plantations', state: 'Kerala' },
    { city: 'Wayanad', country: 'India', description: 'Green Paradise', state: 'Kerala' },
    // Madhya Pradesh
    { city: 'Khajuraho', country: 'India', description: 'Temple Architecture Marvel', state: 'Madhya Pradesh' },
    { city: 'Bhopal', country: 'India', description: 'City of Lakes', state: 'Madhya Pradesh' },
    { city: 'Ujjain', country: 'India', description: 'Ancient Spiritual City', state: 'Madhya Pradesh' },
    // Maharashtra
    { city: 'Mumbai', country: 'India', description: 'City of Dreams & Bollywood', state: 'Maharashtra' },
    { city: 'Pune', country: 'India', description: 'Oxford of the East', state: 'Maharashtra' },
    { city: 'Aurangabad', country: 'India', description: 'Gateway to Ajanta-Ellora', state: 'Maharashtra' },
    { city: 'Lonavala', country: 'India', description: 'Hill Station Retreat', state: 'Maharashtra' },
    // Meghalaya
    { city: 'Shillong', country: 'India', description: 'Scotland of the East', state: 'Meghalaya' },
    { city: 'Cherrapunji', country: 'India', description: 'Wettest Place on Earth', state: 'Meghalaya' },
    // Odisha
    { city: 'Puri', country: 'India', description: 'Jagannath Temple & Beach', state: 'Odisha' },
    { city: 'Konark', country: 'India', description: 'Sun Temple Wonder', state: 'Odisha' },
    { city: 'Bhubaneswar', country: 'India', description: 'Temple City', state: 'Odisha' },
    // Punjab
    { city: 'Amritsar', country: 'India', description: 'Golden Temple City', state: 'Punjab' },
    // Rajasthan
    { city: 'Jaipur', country: 'India', description: 'Pink City of Palaces', state: 'Rajasthan' },
    { city: 'Udaipur', country: 'India', description: 'City of Lakes & Palaces', state: 'Rajasthan' },
    { city: 'Jodhpur', country: 'India', description: 'Blue City of Rajasthan', state: 'Rajasthan' },
    { city: 'Jaisalmer', country: 'India', description: 'Golden City & Desert', state: 'Rajasthan' },
    { city: 'Pushkar', country: 'India', description: 'Sacred Lake & Camel Fair', state: 'Rajasthan' },
    { city: 'Mount Abu', country: 'India', description: 'Hill Station of Rajasthan', state: 'Rajasthan' },
    // Sikkim
    { city: 'Gangtok', country: 'India', description: 'Mountain Paradise', state: 'Sikkim' },
    { city: 'Pelling', country: 'India', description: 'Kanchenjunga Views', state: 'Sikkim' },
    // Tamil Nadu
    { city: 'Chennai', country: 'India', description: 'Gateway to South India', state: 'Tamil Nadu' },
    { city: 'Madurai', country: 'India', description: 'Temple City', state: 'Tamil Nadu' },
    { city: 'Rameshwaram', country: 'India', description: 'Sacred Island', state: 'Tamil Nadu' },
    { city: 'Kanyakumari', country: 'India', description: 'Land\'s End', state: 'Tamil Nadu' },
    { city: 'Ooty', country: 'India', description: 'Queen of Hill Stations', state: 'Tamil Nadu' },
    { city: 'Mahabalipuram', country: 'India', description: 'Shore Temple Town', state: 'Tamil Nadu' },
    // Telangana
    { city: 'Hyderabad', country: 'India', description: 'City of Pearls & Biryani', state: 'Telangana' },
    { city: 'Warangal', country: 'India', description: 'Historic Fort City', state: 'Telangana' },
    // Uttar Pradesh
    { city: 'Agra', country: 'India', description: 'Home of the Taj Mahal', state: 'Uttar Pradesh' },
    { city: 'Varanasi', country: 'India', description: 'Oldest Living City', state: 'Uttar Pradesh' },
    { city: 'Lucknow', country: 'India', description: 'City of Nawabs', state: 'Uttar Pradesh' },
    { city: 'Mathura', country: 'India', description: 'Birthplace of Krishna', state: 'Uttar Pradesh' },
    { city: 'Ayodhya', country: 'India', description: 'Ram Janmabhoomi', state: 'Uttar Pradesh' },
    // Uttarakhand
    { city: 'Rishikesh', country: 'India', description: 'Yoga Capital of the World', state: 'Uttarakhand' },
    { city: 'Haridwar', country: 'India', description: 'Gateway to Gods', state: 'Uttarakhand' },
    { city: 'Nainital', country: 'India', description: 'Lake District of India', state: 'Uttarakhand' },
    { city: 'Mussoorie', country: 'India', description: 'Queen of the Hills', state: 'Uttarakhand' },
    { city: 'Auli', country: 'India', description: 'Skiing Paradise', state: 'Uttarakhand' },
    // West Bengal
    { city: 'Kolkata', country: 'India', description: 'Cultural Capital of India', state: 'West Bengal' },
    { city: 'Darjeeling', country: 'India', description: 'Tea Capital & Toy Train', state: 'West Bengal' },
    { city: 'Sundarbans', country: 'India', description: 'Royal Bengal Tiger Reserve', state: 'West Bengal' },
    // Union Territories
    { city: 'Delhi', country: 'India', description: 'Capital of Culture & Heritage', state: 'Delhi' },
    { city: 'Srinagar', country: 'India', description: 'Paradise on Earth', state: 'Jammu & Kashmir' },
    { city: 'Leh', country: 'India', description: 'Land of High Passes', state: 'Ladakh' },
    { city: 'Puducherry', country: 'India', description: 'French Colony Heritage', state: 'Puducherry' },
    { city: 'Port Blair', country: 'India', description: 'Gateway to Andaman', state: 'Andaman & Nicobar' },
    { city: 'Chandigarh', country: 'India', description: 'The City Beautiful', state: 'Chandigarh' },
  ];

  const filteredDestinations = destinations.filter(dest => 
    dest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (city: string, country: string) => {
    onLocationSelect(city, country);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 min-w-[200px] justify-between rounded-2xl"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>
            {selectedLocation 
              ? `${selectedLocation.city}, ${selectedLocation.country}`
              : 'Search Destination'
            }
          </span>
        </div>
        <Search className="h-4 w-4" />
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 w-96 z-50 shadow-elegant border-primary/20">
          <CardContent className="p-0">
            <div className="p-4 border-b bg-gradient-subtle">
              <h3 className="font-semibold text-sm mb-3">Search Indian Destinations</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by city, state, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 rounded-2xl"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredDestinations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No destinations found. Try a different search term.
                </div>
              ) : (
                filteredDestinations.map((destination) => (
                  <button
                    key={`${destination.city}-${destination.state}`}
                    onClick={() => handleLocationSelect(destination.city, destination.country)}
                    className="w-full p-3 text-left hover:bg-muted/50 transition-all border-b last:border-b-0 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {destination.city}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {destination.description} • {destination.state}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}