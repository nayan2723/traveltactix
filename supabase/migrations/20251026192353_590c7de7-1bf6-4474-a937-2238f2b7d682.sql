-- Create shop_items table for rewards catalog
CREATE TABLE public.shop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  xp_cost INTEGER NOT NULL CHECK (xp_cost > 0),
  category TEXT NOT NULL DEFAULT 'reward',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_redemptions table to track purchases
CREATE TABLE public.user_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shop_item_id UUID NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  xp_spent INTEGER NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shop_items (public read, no client writes)
CREATE POLICY "Shop items are viewable by everyone"
ON public.shop_items
FOR SELECT
USING (is_active = true);

CREATE POLICY "No direct client writes on shop items"
ON public.shop_items
FOR INSERT
TO authenticated
WITH CHECK (false);

-- RLS Policies for user_redemptions
CREATE POLICY "Users can view their own redemptions"
ON public.user_redemptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redemptions"
ON public.user_redemptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at timestamp on shop_items
CREATE TRIGGER update_shop_items_updated_at
BEFORE UPDATE ON public.shop_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample shop items
INSERT INTO public.shop_items (title, description, xp_cost, category, image_url) VALUES
('Travel Discount Coupon', 'Get 20% off your next booking on partner travel sites', 500, 'discount', '/placeholder.svg'),
('Custom Avatar Frame', 'Unlock a unique golden frame for your profile avatar', 300, 'cosmetic', '/placeholder.svg'),
('Hidden Destination Map', 'Access exclusive hidden gems in 50+ cities worldwide', 800, 'feature', '/placeholder.svg'),
('Local Souvenir Voucher', 'Redeem for authentic local souvenirs at partner shops', 1000, 'discount', '/placeholder.svg'),
('Premium Badge', 'Display a premium traveler badge on your profile', 450, 'cosmetic', '/placeholder.svg'),
('Cultural Lesson Pack', 'Unlock 10 exclusive cultural lessons in any city', 600, 'feature', '/placeholder.svg');