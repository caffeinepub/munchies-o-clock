import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetAllItems } from '../hooks/useQueries';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatPrice, getItemImageUrl } from '../utils/menuPlaceholders';
import AuthGate from '../components/auth/AuthGate';

export default function ItemDetailPage() {
  const { itemId } = useParams({ from: '/item/$itemId' });
  const navigate = useNavigate();
  const { data: items = [] } = useGetAllItems();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const item = items.find((i) => i.id.toString() === itemId);

  if (!item) {
    return (
      <AuthGate>
        <div className="container flex min-h-[60vh] items-center justify-center py-8 px-4">
          <div className="text-center">
            <p className="text-lg font-medium">Item not found</p>
            <Button onClick={() => navigate({ to: '/' })} className="mt-4">
              Back to Menu
            </Button>
          </div>
        </div>
      </AuthGate>
    );
  }

  const handleAddToCart = () => {
    if (!item.available) return;
    addItem(item, quantity);
    toast.success(`${quantity}x ${item.name} added to cart`);
    navigate({ to: '/cart' });
  };

  return (
    <AuthGate>
      <div className="container max-w-4xl px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/' })}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Menu
        </Button>

        <Card className="overflow-hidden">
          <div className="relative aspect-[16/9] overflow-hidden bg-muted">
            <img
              src={getItemImageUrl()}
              alt={item.name}
              className="h-full w-full object-cover"
            />
            {!item.available && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Badge variant="destructive" className="text-lg">
                  Unavailable
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{item.name}</h1>
                <p className="mt-2 text-2xl font-bold text-primary">{formatPrice(item.price)}</p>
              </div>

              <p className="text-muted-foreground">{item.description}</p>

              {item.available && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleAddToCart} className="w-full gap-2" size="lg">
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart - {formatPrice(BigInt(Number(item.price) * quantity))}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGate>
  );
}
