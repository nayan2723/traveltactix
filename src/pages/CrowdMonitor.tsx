import { MainNav } from "@/components/MainNav";
import { CrowdDashboard } from "@/components/CrowdDashboard";
import { CrowdMap } from "@/components/CrowdMap";
import { AlternativeSuggestions } from "@/components/AlternativeSuggestions";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users, TrendingDown } from "lucide-react";

interface Place {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  crowd_status: string;
  crowd_percentage: number;
}

const CrowdMonitor = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");

  useEffect(() => {
    fetchPlaces();
    
    // Auto-refresh crowd data every 2 minutes
    const interval = setInterval(() => {
      fetchPlaces();
    }, 120000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPlaces = async () => {
    const { data } = await supabase
      .from('places')
      .select('*')
      .order('crowd_percentage', { ascending: false });

    if (data) {
      setPlaces(data.map(p => ({
        id: p.id,
        name: p.name,
        city: p.city,
        latitude: Number(p.latitude) || 0,
        longitude: Number(p.longitude) || 0,
        crowd_status: p.crowd_status || 'medium',
        crowd_percentage: p.crowd_percentage || 50
      })));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <MainNav />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-6"
            >
              <Users className="w-20 h-20 text-primary mx-auto" />
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Real-Time{" "}
              <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                Crowd
              </span>
              <br />
              Monitoring
            </motion.h1>

            <motion.p 
              className="text-xl text-white/60 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Live crowd density updates, best visiting times, and smart alternative suggestions
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Low Crowd</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Medium Crowd</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">High Crowd</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10 space-y-12">
        {/* Crowd Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <CrowdDashboard />
        </motion.div>

        {/* Heat Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <CrowdMap 
            places={places}
            onPlaceClick={(place) => setSelectedCity(place.city)}
          />
        </motion.div>

        {/* Alternative Suggestions */}
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <AlternativeSuggestions currentCity={selectedCity} />
          </motion.div>
        )}

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
            <Users className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Live Updates</h3>
            <p className="text-white/60 text-sm">
              Real-time crowd density data powered by Google Places API
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
            <TrendingDown className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Smart Suggestions</h3>
            <p className="text-white/60 text-sm">
              Get alternatives when your destination is overcrowded
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl border border-green-500/20">
            <Users className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Best Times</h3>
            <p className="text-white/60 text-sm">
              Discover optimal visiting hours to avoid crowds
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CrowdMonitor;
