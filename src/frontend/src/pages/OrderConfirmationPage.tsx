import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetCustomerOrders, useGetAllItems } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../utils/menuPlaceholders';
import AuthGate from '../components/auth/AuthGate';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/order/$orderId' });
  const navigate = useNavigate();
  const { data: orders = [] } = useGetCustomerOrders();
  const { data: items = [] } = useGetAllItems();

  const order = orders.find((o) => o.id.toString() === orderId);

  if (!order) {
    return (
      <AuthGate>
        <div className="container flex min-h-[60vh] items-center justify-center py-8 px-4">
          <div className="text-center">
            <p className="text-lg font-medium">Order not found</p>
            <Button onClick={() => navigate({ to: '/' })} className="mt-4">
              Back to Menu
            </Button>
          </div>
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="container max-w-2xl px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <p className="text-muted-foreground">Order #{order.id.toString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-3 font-semibold">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((orderItem) => {
                  const item = items.find((i) => i.id === orderItem.itemId);
                  return (
                    <div key={orderItem.itemId.toString()} className="flex justify-between text-sm">
                      <span>
                        {item?.name || 'Unknown Item'} x {orderItem.quantity.toString()}
                      </span>
                      <span className="font-medium">
                        {item ? formatPrice(BigInt(Number(item.price) * Number(orderItem.quantity))) : '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Button onClick={() => navigate({ to: '/' })} className="w-full" variant="outline">
                Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGate>
  );
}
