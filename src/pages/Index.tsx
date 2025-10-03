import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { MainNav } from "@/components/MainNav";
import { 
  Compass,
  Sparkles,
  Map,
  Trophy,
  BookOpen,
  Globe,
  Camera,
  Heart,
  Target,
  Brain,
  Award,
  ArrowRight,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const AnimatedSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Discovery",
      description: "Smart recommendations based on your travel style",
      route: "/discovery"
    },
    {
      icon: Map,
      title: "Smart Itineraries",
      description: "AI creates perfect multi-day trip plans",
      route: "/discovery"
    },
    {
      icon: Trophy,
      title: "Gamified Missions",
      description: "Complete challenges and unlock achievements",
      route: "/missions"
    },
    {
      icon: BookOpen,
      title: "Cultural Lessons",
      description: "Master local customs and traditions",
      route: "/cultural-lessons"
    },
    {
      icon: Globe,
      title: "Cultural Feed",
      description: "Daily insights from around the world",
      route: "/cultural-feed"
    },
    {
      icon: Camera,
      title: "AR Scanning",
      description: "Unlock stories at landmarks",
      route: "/ar-scan"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <MainNav />
      
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-3xl"
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
          style={{ y: backgroundY }}
          className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Navbar - Using MainNav Component */}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-bold leading-none mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Start{" "}
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                exploring
              </span>
              {" "}destinations
              <br />
              people{" "}
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                remember.
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
            >
              <Button 
                size="lg"
                className="bg-white text-black hover:bg-white/90 px-8 text-base"
                onClick={() => navigate("/auth")}
              >
                Become an explorer
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 px-8 text-base"
                onClick={() => navigate("/discovery")}
              >
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-400" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
                  </div>
                  About us
                </div>
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-24 max-w-2xl mx-auto text-white/60 text-lg leading-relaxed"
            >
              Quest Voyage came from constantly exploring hidden gems across India, 
              wondering, "How did I discover that place?" It is basically your 
              personal travel companion, packed with AI recommendations, cultural missions, 
              gamification and authentic experiences—and it will keep growing.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <AnimatedSection>
            <h2 className="text-5xl md:text-7xl font-bold mb-4 text-center">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                explore smarter
              </span>
            </h2>
            <p className="text-white/60 text-center text-lg mb-20 max-w-2xl mx-auto">
              Powerful features designed to transform your travels into unforgettable adventures
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <AnimatedSection key={index}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 cursor-pointer overflow-hidden hover:border-white/20 transition-all"
                  onClick={() => navigate(feature.route)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6 text-orange-400" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-white/60 leading-relaxed">{feature.description}</p>
                    
                    <div className="mt-6 flex items-center text-orange-400 text-sm group-hover:translate-x-2 transition-transform">
                      Learn more
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <AnimatedSection>
            <h2 className="text-5xl md:text-7xl font-bold mb-20 text-center">
              Simple,{" "}
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                powerful,
              </span>
              <br />
              unforgettable
            </h2>
          </AnimatedSection>

          <div className="space-y-32">
            <AnimatedSection>
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="text-6xl font-bold text-white/10 mb-4">01</div>
                  <h3 className="text-4xl font-bold mb-6">Sign up & discover</h3>
                  <p className="text-white/60 text-lg leading-relaxed mb-6">
                    Create your account and immediately start discovering hidden gems across India 
                    with our AI-powered recommendation engine tailored to your travel style.
                  </p>
                  <Button 
                    size="lg"
                    className="bg-white text-black hover:bg-white/90"
                    onClick={() => navigate("/discovery")}
                  >
                    Explore Destinations
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl p-12 h-64 flex items-center justify-center">
                  <Compass className="h-24 w-24 text-orange-400" />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="order-2 md:order-1 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl p-12 h-64 flex items-center justify-center">
                  <Trophy className="h-24 w-24 text-purple-400" />
                </div>
                <div className="order-1 md:order-2">
                  <div className="text-6xl font-bold text-white/10 mb-4">02</div>
                  <h3 className="text-4xl font-bold mb-6">Complete missions</h3>
                  <p className="text-white/60 text-lg leading-relaxed mb-6">
                    Take on cultural challenges, learn local customs, and earn XP points as you explore. 
                    Every destination becomes an interactive adventure.
                  </p>
                  <Button 
                    size="lg"
                    className="bg-white text-black hover:bg-white/90"
                    onClick={() => navigate("/missions")}
                  >
                    View Missions
                  </Button>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="text-6xl font-bold text-white/10 mb-4">03</div>
                  <h3 className="text-4xl font-bold mb-6">Learn culture</h3>
                  <p className="text-white/60 text-lg leading-relaxed mb-6">
                    Master local customs, traditions, and language through interactive cultural lessons
                    from all 29 states of India.
                  </p>
                  <Button 
                    size="lg"
                    className="bg-white text-black hover:bg-white/90"
                    onClick={() => navigate("/cultural-lessons")}
                  >
                    Start Learning
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl p-12 h-64 flex items-center justify-center">
                  <BookOpen className="h-24 w-24 text-cyan-400" />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="order-2 md:order-1 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl p-12 h-64 flex items-center justify-center">
                  <Camera className="h-24 w-24 text-green-400" />
                </div>
                <div className="order-1 md:order-2">
                  <div className="text-6xl font-bold text-white/10 mb-4">04</div>
                  <h3 className="text-4xl font-bold mb-6">Scan landmarks</h3>
                  <p className="text-white/60 text-lg leading-relaxed mb-6">
                    Use AR to discover fascinating stories at India's most iconic monuments and
                    unlock cultural insights at famous landmarks.
                  </p>
                  <Button 
                    size="lg"
                    className="bg-white text-black hover:bg-white/90"
                    onClick={() => navigate("/ar-scan")}
                  >
                    Try AR Scanner
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="explore" className="py-32 px-6 relative">
        <div className="container mx-auto max-w-4xl text-center">
          <AnimatedSection>
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-12 leading-tight">
                Ready to start your
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  epic adventure?
                </span>
              </h2>
            </motion.div>

            <p className="text-white/60 text-xl mb-12 max-w-2xl mx-auto">
              Join thousands of travelers discovering India's hidden treasures through 
              gamified exploration and AI-powered recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-black hover:bg-white/90 px-10 py-6 text-lg"
                onClick={() => navigate("/auth")}
              >
                Get Started Free
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 px-10 py-6 text-lg"
                onClick={() => navigate("/discovery")}
              >
                Explore Places
              </Button>
            </div>

            <div className="mt-8 text-white/40 text-sm">
              ✨ Free to start • 🌍 33+ Places • 🏆 500+ Missions
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Quest Voyage</span>
            </div>

            <div className="flex gap-8 text-sm text-white/40">
              <button onClick={() => navigate("/discovery")} className="hover:text-white transition-colors">Discover</button>
              <button onClick={() => navigate("/missions")} className="hover:text-white transition-colors">Missions</button>
              <button onClick={() => navigate("/cultural-lessons")} className="hover:text-white transition-colors">Learn</button>
              <button onClick={() => navigate("/dashboard")} className="hover:text-white transition-colors">Dashboard</button>
            </div>

            <div className="text-sm text-white/40">
              Made with <Heart className="h-4 w-4 text-red-500 inline" /> for travelers
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;