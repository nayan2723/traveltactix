import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Sparkles, Loader2, Tag } from "lucide-react";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { formatINR, applyDiscount } from "@/lib/utils";
import { XPDiscountBadge } from "@/components/XPDiscountBadge";
import travelCollage from "@/assets/travel-collage.jpg";
export default function Shop() {
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  const DISCOUNT = 20; // percent
  
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts(20);
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products", {
        description: "Could not load shop items. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: ShopifyProduct) => {
    const defaultVariant = product.node.variants.edges[0]?.node;
    
    if (!defaultVariant) {
      toast.error("Product unavailable", {
        description: "This product has no variants available.",
      });
      return;
    }

    addItem({
      product,
      variantId: defaultVariant.id,
      variantTitle: defaultVariant.title,
      price: defaultVariant.price,
      quantity: 1,
      selectedOptions: defaultVariant.selectedOptions,
    });

    toast.success("Added to cart!", {
      description: `${product.node.title} has been added to your cart.`,
    });
  };

  const handleProductClick = (handle: string) => {
    navigate(`/product/${handle}`);
  };

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
            <span className="text-sm font-medium text-primary">Travel Shop</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Shop Travel Gear
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover curated travel essentials, gear, and accessories for your next adventure
          </p>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="w-full h-64 bg-muted rounded-lg mb-4" />
                <div className="h-6 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                <div className="h-10 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                We're currently setting up the shop. Check back soon!
              </p>
              <p className="text-sm text-muted-foreground">
                Want to add products? Just tell me what you'd like to sell and I'll create them for you.
              </p>
            </div>
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
            {products.map((product) => {
              const defaultVariant = product.node.variants.edges[0]?.node;
              const imageUrl = product.node.images.edges[0]?.node.url;
              const price = defaultVariant?.price;
              const priceINR = price ? parseFloat(price.amount) : 0;
              const discountedInr = applyDiscount(priceINR, DISCOUNT);

              return (
                <motion.div
                  key={product.node.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-full flex flex-col">
                    {/* Image */}
                    <div 
                      className="relative w-full h-64 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden cursor-pointer"
                      onClick={() => handleProductClick(product.node.handle)}
                    >
                      <img
                        src={imageUrl || travelCollage}
                        alt={product.node.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <Badge variant="secondary">{DISCOUNT}% OFF</Badge>
                        {/* Mock XP discount - In production, fetch from database */}
                        {Math.random() > 0.5 && (
                          <XPDiscountBadge xpDiscount={10} />
                        )}
                      </div>
                      {defaultVariant && !defaultVariant.availableForSale && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 
                        className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors cursor-pointer line-clamp-2"
                        onClick={() => handleProductClick(product.node.handle)}
                      >
                        {product.node.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
                        {product.node.description || "No description available"}
                      </p>

                      {/* Price & Button */}
                      <div className="flex items-center justify-between mt-auto">
                        {price && (
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-foreground">
                              {formatINR(discountedInr)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatINR(priceINR)}
                            </span>
                          </div>
                        )}

                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={!defaultVariant?.availableForSale}
                          size="sm"
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Use code <span className="font-semibold">INDIA20</span> at checkout
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
