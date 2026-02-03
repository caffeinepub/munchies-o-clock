import { useState } from 'react';
import { useGetAllOrders, useUpdateOrderStatus, useGetAllItems } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '../../utils/menuPlaceholders';
import { getNextValidStatuses } from '../../utils/orderStatus';
import AuthGate from '../../components/auth/AuthGate';
import type { Order, OrderStatus } from '../../backend';

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    inProgress: 'default',
    completed: 'outline',
    cancelled: 'destructive',
  };

  const labels: Record<string, string> = {
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

function OrderCard({ order, items }: { order: Order; items: any[] }) {
  const updateStatus = useUpdateOrderStatus();
  const nextStatuses = getNextValidStatuses(order.status);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus.mutateAsync({
        orderId: order.id,
        newStatus: newStatus as OrderStatus,
      });
      toast.success('Order status updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const orderDate = new Date(Number(order.timestamp) / 1000000);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {orderDate.toLocaleDateString()} {orderDate.toLocaleTimeString()}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold">Items</h4>
          <div className="space-y-1">
            {order.items.map((orderItem) => {
              const item = items.find((i) => i.id === orderItem.itemId);
              return (
                <div key={orderItem.itemId.toString()} className="flex justify-between text-sm">
                  <span>
                    {item?.name || 'Unknown'} x {orderItem.quantity.toString()}
                  </span>
                  <span className="font-medium">
                    {item ? formatPrice(BigInt(Number(item.price) * Number(orderItem.quantity))) : '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold text-primary">{formatPrice(order.total)}</span>
        </div>

        {nextStatuses.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium">Update Status</label>
            <Select onValueChange={handleStatusChange} disabled={updateStatus.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {nextStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'inProgress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const { data: items = [] } = useGetAllItems();
  const [activeTab, setActiveTab] = useState('all');

  const filterOrders = (status?: OrderStatus) => {
    if (!status) return orders;
    return orders.filter((order) => order.status === status);
  };

  const pendingOrders = filterOrders('pending' as OrderStatus);
  const inProgressOrders = filterOrders('inProgress' as OrderStatus);
  const completedOrders = filterOrders('completed' as OrderStatus);

  return (
    <AuthGate requireAdmin>
      <div className="container max-w-6xl px-4 py-6">
        <h1 className="mb-6 text-3xl font-bold">Order Management</h1>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
              <TabsTrigger value="inProgress">In Progress ({inProgressOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6 space-y-4">
              {orders.length === 0 ? (
                <p className="text-center text-muted-foreground">No orders yet</p>
              ) : (
                orders.map((order) => <OrderCard key={order.id.toString()} order={order} items={items} />)
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-6 space-y-4">
              {pendingOrders.length === 0 ? (
                <p className="text-center text-muted-foreground">No pending orders</p>
              ) : (
                pendingOrders.map((order) => <OrderCard key={order.id.toString()} order={order} items={items} />)
              )}
            </TabsContent>

            <TabsContent value="inProgress" className="mt-6 space-y-4">
              {inProgressOrders.length === 0 ? (
                <p className="text-center text-muted-foreground">No orders in progress</p>
              ) : (
                inProgressOrders.map((order) => <OrderCard key={order.id.toString()} order={order} items={items} />)
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6 space-y-4">
              {completedOrders.length === 0 ? (
                <p className="text-center text-muted-foreground">No completed orders</p>
              ) : (
                completedOrders.map((order) => <OrderCard key={order.id.toString()} order={order} items={items} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AuthGate>
  );
}
