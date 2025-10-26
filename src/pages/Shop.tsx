import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Sparkles, Award, Package, Lock, CheckCircle } from "lucide-react";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShopItem {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  xp_cost: number;
  category: string;
}

interface Redemption {
  id: string;
  shop_item_id: string;
  redeemed_at: string;
}

const categoryIcons: Record<string, any> = {
  discount: Package,
  cosmetic: Sparkles,
  feature: Award,
  reward: ShoppingBag,
};

const categoryColors: Record<string, string> = {
  discount: "bg-green-500/10 text-green-700 dark:text-green-400",
  cosmetic: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  feature: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  reward: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

export default function Shop() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);

  useEffect(() => {
    if (profile) {
      setCurrentXP(profile.total_xp || 0);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchShopData();
  }, [user, navigate]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      
      // Fetch shop items
      const { data: items, error: itemsError } = await supabase
        .from("shop_items")
        .select("*")
        .eq("is_active", true)
        .order("xp_cost", { ascending: true });

      if (itemsError) throw itemsError;
      setShopItems(items || []);

      // Fetch user redemptions
      const { data: userRedemptions, error: redemptionsError } = await supabase
        .from("user_redemptions")
        .select("*")
        .eq("user_id", user?.id);

      if (redemptionsError) throw redemptionsError;
      setRedemptions(userRedemptions || []);
    } catch (error) {
      console.error("Error fetching shop data:", error);
      toast({
        title: "Error loading shop",
        description: "Could not load shop items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isItemRedeemed = (itemId: string) => {
    return redemptions.some((r) => r.shop_item_id === itemId);
  };

  const handleRedeem = async (item: ShopItem) => {
    if (!user || !profile) return;

    const userXP = currentXP;
    
    if (userXP < item.xp_cost) {
      toast({
        title: "Not enough XP! 💔",
        description: `You need ${item.xp_cost - userXP} more XP to redeem this item.`,
        variant: "destructive",
      });
      return;
    }

    if (isItemRedeemed(item.id)) {
      toast({
        title: "Already redeemed",
        description: "You've already redeemed this item!",
        variant: "destructive",
      });
      return;
    }

    try {
      setRedeeming(item.id);

      // Insert redemption record
      const { error: redemptionError } = await supabase
        .from("user_redemptions")
        .insert({
          user_id: user.id,
          shop_item_id: item.id,
          xp_spent: item.xp_cost,
        });

      if (redemptionError) throw redemptionError;

      // Update user XP
      const newXP = userXP - item.xp_cost;
      const { error: xpError } = await supabase
        .from("profiles")
        .update({ total_xp: newXP })
        .eq("user_id", user.id);

      if (xpError) throw xpError;

      // Update local state
      setCurrentXP(newXP);
      
      // Refresh redemptions
      await fetchShopData();
      
      setSelectedItem(item);
      setShowSuccessModal(true);

      toast({
        title: "Redemption successful! 🎉",
        description: `You've redeemed ${item.title}!`,
      });
    } catch (error) {
      console.error("Error redeeming item:", error);
      toast({
        title: "Redemption failed",
        description: "Could not complete redemption. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  const userXP = currentXP;

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Rewards Shop</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Redeem Your XP
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Exchange your hard-earned experience points for exclusive rewards and benefits
          </p>

          {/* XP Balance Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-block"
          >
            <Card className="px-8 py-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Your Balance</p>
                  <p className="text-3xl font-bold text-foreground">{userXP.toLocaleString()} XP</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Shop Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="w-full h-48 bg-muted rounded-lg mb-4" />
                <div className="h-6 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {shopItems.map((item) => {
              const CategoryIcon = categoryIcons[item.category] || ShoppingBag;
              const isRedeemed = isItemRedeemed(item.id);
              const canAfford = userXP >= item.xp_cost;
              const isProcessing = redeeming === item.id;

              return (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Card
                    className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                      isRedeemed ? "opacity-75" : "hover:scale-[1.02]"
                    }`}
                  >
                    {/* Category Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className={categoryColors[item.category]}>
                        <CategoryIcon className="w-3 h-3 mr-1" />
                        {item.category}
                      </Badge>
                    </div>

                    {/* Redeemed Badge */}
                    {isRedeemed && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-green-500/90 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Redeemed
                        </Badge>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative w-full h-48 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center overflow-hidden">
                      <CategoryIcon className="w-20 h-20 text-primary/20" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      {/* XP Cost & Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <span className="text-2xl font-bold text-foreground">
                            {item.xp_cost.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground">XP</span>
                        </div>

                        <Button
                          onClick={() => handleRedeem(item)}
                          disabled={!canAfford || isRedeemed || isProcessing}
                          size="sm"
                          className="min-w-[100px]"
                        >
                          {isProcessing ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Redeeming...
                            </span>
                          ) : isRedeemed ? (
                            "Redeemed"
                          ) : !canAfford ? (
                            <span className="flex items-center gap-1">
                              <Lock className="w-4 h-4" />
                              Locked
                            </span>
                          ) : (
                            "Redeem"
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && shopItems.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No items available</h3>
            <p className="text-muted-foreground">Check back later for new rewards!</p>
          </div>
        )}
      </main>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl">Redemption Successful! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              {selectedItem && (
                <>
                  <p className="text-lg font-semibold text-foreground mt-2">
                    {selectedItem.title}
                  </p>
                  <p className="mt-2">
                    You've successfully redeemed this reward for{" "}
                    <span className="font-bold">{selectedItem.xp_cost} XP</span>
                  </p>
                  <p className="mt-4 text-sm">
                    New balance:{" "}
                    <span className="font-bold text-primary">{userXP.toLocaleString()} XP</span>
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="flex-1"
              variant="outline"
            >
              Keep Shopping
            </Button>
            <Button onClick={() => navigate("/profile")} className="flex-1">
              View Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
