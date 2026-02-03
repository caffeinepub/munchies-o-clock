import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../context/CartContext';
import { useGetAllItems } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { formatPrice, getItemImageUrl } from '../utils/menuPlaceholders';
import AuthGate from '../components/auth/AuthGate';

export default function CartPage() {
  const navigate = useNavigate();
  const { state, updateQuantity, removeItem, getTotal } = useCart();
  const { data: items = [] } = useGetAllItems();

  const cartItems = state.items.map((cartItem) => {
    const currentItem = items.find((i) => i.id === cartItem.item.id);
    return {
      ...cartItem,
      item: currentItem || cartItem.item,
    };
  });

  if (cartItems.length === 0) {
    return (
      <AuthGate>
        <div className="container flex min-h-[60vh] items-center justify-center py-8 px-4">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Add some delicious items to get started!</p>
            <Button onClick={() => navigate({ to: '/' })} className="mt-6">
              Browse Menu
            </Button>
          </div>
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="container max-w-4xl px-4 py-6">
        <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>

        <div className="space-y-4">
          {cartItems.map((cartItem) => (
            <Card key={cartItem.item.id.toString()}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <img
                      src={getItemImageUrl()}
                      alt={cartItem.item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-semibold">{cartItem.item.name}</h3>
                      <p className="text-sm text-primary">{formatPrice(cartItem.item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(cartItem.item.id, Math.max(0, cartItem.quantity - 1))
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{cartItem.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-8 w-8 text-destructive"
                        onClick={() => removeItem(cartItem.item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right font-semibold">
                    {formatPrice(BigInt(Number(cartItem.item.price) * cartItem.quantity))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-lg">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(BigInt(getTotal()))}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(BigInt(getTotal()))}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate({ to: '/checkout' })} className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AuthGate>
  );
}
