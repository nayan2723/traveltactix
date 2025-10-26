import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Loader2, Check } from "lucide-react";
import { MainNav } from "@/components/MainNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);

  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (handle) {
      loadProduct();
    }
  }, [handle]);

  const loadProduct = async () => {
    if (!handle) return;
    
    try {
      setLoading(true);
      const data = await fetchProductByHandle(handle);
      setProduct(data);

      // Initialize selected options with defaults
      if (data?.options) {
        const defaults: Record<string, string> = {};
        data.options.forEach(option => {
          if (option.values.length > 0) {
            defaults[option.name] = option.values[0];
          }
        });
        setSelectedOptions(defaults);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedVariant = () => {
    if (!product?.variants) return null;

    return product.variants.edges.find(({ node: variant }) => {
      return variant.selectedOptions.every(
        option => selectedOptions[option.name] === option.value
      );
    })?.node;
  };

  const handleAddToCart = () => {
    if (!product) return;

    const selectedVariant = getSelectedVariant();
    
    if (!selectedVariant) {
      toast.error("Please select all options");
      return;
    }

    const productWrapper: ShopifyProduct = {
      node: product,
    };

    addItem({
      product: productWrapper,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions,
    });

    toast.success("Added to cart!", {
      description: `${product.title} has been added to your cart.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Product not found</h2>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/shop")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const selectedVariant = getSelectedVariant();
  const images = product.images?.edges || [];
  const currentImage = images[selectedImage]?.node;

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <Button
          variant="ghost"
          onClick={() => navigate("/shop")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/5">
                {currentImage ? (
                  <img
                    src={currentImage.url}
                    alt={currentImage.altText || product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-32 h-32 text-muted-foreground/20" />
                  </div>
                )}
              </div>
            </Card>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <Card
                    key={idx}
                    className={`cursor-pointer overflow-hidden transition-all ${
                      idx === selectedImage ? "ring-2 ring-primary" : "opacity-50 hover:opacity-100"
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <div className="aspect-square">
                      <img
                        src={img.node.url}
                        alt={img.node.altText || `${product.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
              
              {selectedVariant && (
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-4xl font-bold text-foreground">
                    ${parseFloat(selectedVariant.price.amount).toFixed(2)}
                  </span>
                  <span className="text-xl text-muted-foreground">
                    {selectedVariant.price.currencyCode}
                  </span>
                </div>
              )}

              {selectedVariant && !selectedVariant.availableForSale && (
                <Badge variant="destructive" className="mb-4">Out of Stock</Badge>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Options */}
            {product.options?.map((option) => (
              <div key={option.name} className="space-y-3">
                <Label className="text-base font-semibold">{option.name}</Label>
                <RadioGroup
                  value={selectedOptions[option.name]}
                  onValueChange={(value) =>
                    setSelectedOptions({ ...selectedOptions, [option.name]: value })
                  }
                >
                  <div className="grid grid-cols-3 gap-2">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.name] === value;
                      return (
                        <Label
                          key={value}
                          htmlFor={`${option.name}-${value}`}
                          className={`flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 p-3 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem
                            id={`${option.name}-${value}`}
                            value={value}
                            className="sr-only"
                          />
                          {isSelected && <Check className="w-4 h-4 text-primary" />}
                          <span className={isSelected ? "font-medium" : ""}>{value}</span>
                        </Label>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>
            ))}

            {/* Add to Cart */}
            <div className="pt-6 border-t">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant?.availableForSale}
                size="lg"
                className="w-full"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {selectedVariant?.availableForSale ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
