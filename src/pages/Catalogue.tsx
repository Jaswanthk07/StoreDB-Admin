import { Header } from "@/components/layout/Header";
import { CategoryCard } from "@/components/products/CategoryCard";
import { CategoryCardSkeleton } from "@/components/ui/product-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useCategories } from "@/hooks/useProducts";
import { useCategoryImages } from "@/hooks/useCategoryImages";
import { LayoutGrid } from "lucide-react";

const Catalogue = () => {
  const { data: categories, isLoading, error, refetch } = useCategories();
  const { imageMap, isLoading: imagesLoading } = useCategoryImages(categories);

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />

      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Product Categories
            </h1>
          </div>
          <p className="text-muted-foreground">
            Explore our inventory organized by category. Click on any category
            to view its products.
          </p>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load categories"
            message="We couldn't fetch the category data. Please try again."
            onRetry={() => refetch()}
          />
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.slug}
                category={category}
                imageUrl={imageMap[category.slug]}
                isImageLoading={imagesLoading}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <LayoutGrid className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Categories Found
            </h3>
            <p className="text-muted-foreground">
              Categories will appear here once they are available.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Catalogue;
