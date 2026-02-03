import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../context/CartContext';
import { usePlaceOrder } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { formatPrice } from '../utils/menuPlaceholders';
import { toast } from 'sonner';
import AuthGate from '../components/auth/AuthGate';
import type { OrderItem } from '../backend';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { state, getTotal, clearCart } = useCart();
  const placeOrder = usePlaceOrder();

  const handlePlaceOrder = async () => {
    if (state.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const orderItems: OrderItem[] = state.items.map((cartItem) => ({
      itemId: cartItem.item.id,
      quantity: BigInt(cartItem.quantity),
    }));

    try {
      const orderId = await placeOrder.mutateAsync(orderItems);
      clearCart();
      toast.success('Order placed successfully!');
      navigate({ to: '/order/$orderId', params: { orderId: orderId.toString() } });
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order. Please try again.');
      console.error('Order placement error:', error);
    }
  };

  if (state.items.length === 0) {
    return (
      <AuthGate>
        <div className="container flex min-h-[60vh] items-center justify-center py-8 px-4">
          <div className="text-center">
            <p className="text-lg font-medium">Your cart is empty</p>
            <Button onClick={() => navigate({ to: '/' })} className="mt-4">
              Browse Menu
            </Button>
          </div>
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="container max-w-2xl px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/cart' })}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Button>

        <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.items.map((cartItem) => (
              <div key={cartItem.item.id.toString()} className="flex justify-between">
                <div>
                  <p className="font-medium">{cartItem.item.name}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {cartItem.quantity}</p>
                </div>
                <p className="font-semibold">
                  {formatPrice(BigInt(Number(cartItem.item.price) * cartItem.quantity))}
                </p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(BigInt(getTotal()))}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handlePlaceOrder}
              disabled={placeOrder.isPending}
              className="w-full gap-2"
              size="lg"
            >
              {placeOrder.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AuthGate>
  );
}
