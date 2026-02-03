import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useCart } from '../../context/CartContext';
import { Home, ShoppingCart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BottomNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { data: isAdmin } = useIsCallerAdmin();
  const { getItemCount } = useCart();

  const currentPath = routerState.location.pathname;
  const cartCount = getItemCount();

  const navItems = [
    { path: '/', icon: Home, label: 'Menu' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin/orders', icon: Settings, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="container flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: item.path })}
              className={`relative flex flex-col gap-1 h-auto py-2 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-2 -top-2 h-5 min-w-5 px-1 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
