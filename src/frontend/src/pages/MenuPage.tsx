import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllCategories, useGetAllItems } from '../hooks/useQueries';
import CategoryNav from '../components/menu/CategoryNav';
import ItemCard from '../components/menu/ItemCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UtensilsCrossed } from 'lucide-react';

export default function MenuPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: categories = [], isLoading: categoriesLoading } = useGetAllCategories();
  const { data: items = [], isLoading: itemsLoading } = useGetAllItems();
  const [selectedCategoryId, setSelectedCategoryId] = useState<bigint | null>(null);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Munchies O'Clock</CardTitle>
            <CardDescription>Sign in to browse our delicious menu and place orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={login}
              disabled={loginStatus === 'logging-in'}
              className="w-full"
              size="lg"
            >
              {loginStatus === 'logging-in' ? 'Signing in...' : 'Sign In to Order'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (categoriesLoading || itemsLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  const filteredItems = selectedCategoryId
    ? items.filter((item) => item.categoryId === selectedCategoryId)
    : items;

  const availableItems = filteredItems.filter((item) => item.available);

  return (
    <div>
      <CategoryNav
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <div className="container px-4 py-6">
        {availableItems.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <UtensilsCrossed className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No items available</p>
              <p className="text-sm text-muted-foreground">Check back soon for delicious options!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableItems.map((item) => (
              <ItemCard key={item.id.toString()} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
