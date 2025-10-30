import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface XPDiscountBadgeProps {
  xpDiscount?: number;
  xpPrice?: number;
  requiresBadge?: boolean;
}

export const XPDiscountBadge = ({ xpDiscount, xpPrice, requiresBadge }: XPDiscountBadgeProps) => {
  if (!xpDiscount && !xpPrice && !requiresBadge) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {xpDiscount && xpDiscount > 0 && (
        <Badge className="bg-gradient-to-r from-success to-accent text-foreground border-0 font-semibold">
          <Sparkles className="h-3 w-3 mr-1" />
          {xpDiscount}% XP Discount
        </Badge>
      )}
      {xpPrice && xpPrice > 0 && (
        <Badge className="bg-gradient-to-r from-warning to-accent text-foreground border-0 font-semibold">
          <Sparkles className="h-3 w-3 mr-1" />
          {xpPrice} XP Only
        </Badge>
      )}
      {requiresBadge && (
        <Badge variant="outline" className="border-accent bg-accent/10 text-accent-foreground font-semibold">
          🏆 Badge Required
        </Badge>
      )}
    </div>
  );
};