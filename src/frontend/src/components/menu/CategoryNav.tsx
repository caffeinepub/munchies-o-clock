import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Category } from '../../backend';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: bigint | null;
  onSelectCategory: (categoryId: bigint | null) => void;
}

export default function CategoryNav({ categories, selectedCategoryId, onSelectCategory }: CategoryNavProps) {
  return (
    <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 py-3">
        <Tabs
          value={selectedCategoryId?.toString() || 'all'}
          onValueChange={(value) => onSelectCategory(value === 'all' ? null : BigInt(value))}
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id.toString()} value={category.id.toString()}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
