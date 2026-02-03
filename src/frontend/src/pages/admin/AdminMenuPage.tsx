import { useState } from 'react';
import {
  useGetAllCategories,
  useGetAllItems,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
} from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '../../utils/menuPlaceholders';
import AuthGate from '../../components/auth/AuthGate';
import type { Category, Item } from '../../backend';

function CategoryDialog({
  category,
  onClose,
}: {
  category?: Category;
  onClose: () => void;
}) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (category) {
        await updateCategory.mutateAsync({ categoryId: category.id, name, description });
        toast.success('Category updated');
      } else {
        await createCategory.mutateAsync({ name, description });
        toast.success('Category created');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={createCategory.isPending || updateCategory.isPending}>
        {createCategory.isPending || updateCategory.isPending ? 'Saving...' : 'Save Category'}
      </Button>
    </form>
  );
}

function ItemDialog({
  item,
  categories,
  onClose,
}: {
  item?: Item;
  categories: Category[];
  onClose: () => void;
}) {
  const [name, setName] = useState(item?.name || '');
  const [categoryId, setCategoryId] = useState(item?.categoryId.toString() || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item ? (Number(item.price) / 100).toString() : '');
  const [available, setAvailable] = useState(item?.available ?? true);
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    const priceInCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInCents) || priceInCents < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      if (item) {
        await updateItem.mutateAsync({
          itemId: item.id,
          name,
          categoryId: BigInt(categoryId),
          description,
          price: BigInt(priceInCents),
          available,
        });
        toast.success('Item updated');
      } else {
        await createItem.mutateAsync({
          name,
          categoryId: BigInt(categoryId),
          description,
          price: BigInt(priceInCents),
          available,
        });
        toast.success('Item created');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save item');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price ($)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="available">Available</Label>
        <Switch
          id="available"
          checked={available}
          onCheckedChange={setAvailable}
        />
      </div>
      <Button type="submit" className="w-full" disabled={createItem.isPending || updateItem.isPending}>
        {createItem.isPending || updateItem.isPending ? 'Saving...' : 'Save Item'}
      </Button>
    </form>
  );
}

export default function AdminMenuPage() {
  const { data: categories = [], isLoading: categoriesLoading } = useGetAllCategories();
  const { data: items = [], isLoading: itemsLoading } = useGetAllItems();
  const deleteCategory = useDeleteCategory();
  const deleteItem = useDeleteItem();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [editingItem, setEditingItem] = useState<Item | undefined>();

  const handleDeleteCategory = async (categoryId: bigint) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory.mutateAsync(categoryId);
      toast.success('Category deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const handleDeleteItem = async (itemId: bigint) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem.mutateAsync(itemId);
      toast.success('Item deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete item');
    }
  };

  return (
    <AuthGate requireAdmin>
      <div className="container max-w-6xl px-4 py-6">
        <h1 className="mb-6 text-3xl font-bold">Menu Management</h1>

        <Tabs defaultValue="items">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6 space-y-4">
            <Dialog
              open={itemDialogOpen}
              onOpenChange={(open) => {
                setItemDialogOpen(open);
                if (!open) setEditingItem(undefined);
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
                </DialogHeader>
                <ItemDialog
                  item={editingItem}
                  categories={categories}
                  onClose={() => {
                    setItemDialogOpen(false);
                    setEditingItem(undefined);
                  }}
                />
              </DialogContent>
            </Dialog>

            {itemsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-muted-foreground">No items yet</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Card key={item.id.toString()}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">{formatPrice(item.price)}</span>
                        <span className={`text-sm ${item.available ? 'text-green-600' : 'text-destructive'}`}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => {
                            setEditingItem(item);
                            setItemDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deleteItem.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="mt-6 space-y-4">
            <Dialog
              open={categoryDialogOpen}
              onOpenChange={(open) => {
                setCategoryDialogOpen(open);
                if (!open) setEditingCategory(undefined);
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                </DialogHeader>
                <CategoryDialog
                  category={editingCategory}
                  onClose={() => {
                    setCategoryDialogOpen(false);
                    setEditingCategory(undefined);
                  }}
                />
              </DialogContent>
            </Dialog>

            {categoriesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-center text-muted-foreground">No categories yet</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Card key={category.id.toString()}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => {
                            setEditingCategory(category);
                            setCategoryDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={deleteCategory.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthGate>
  );
}
