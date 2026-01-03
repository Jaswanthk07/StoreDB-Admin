import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { CategoryCard } from "@/components/products/CategoryCard";
import { ProductTable } from "@/components/products/ProductTable";
import { Pagination } from "@/components/products/Pagination";
import {
  CategoryCardSkeleton,
  ProductTableSkeleton,
} from "@/components/ui/product-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useCategories, useProductsByCategory } from "@/hooks/useProducts";
import { useCategoryImages } from "@/hooks/useCategoryImages";
import { useDebounce } from "@/hooks/useDebounce";
import { LayoutGrid, ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 20;

const Catalogue = () => {
  const { category } = useParams<{ category?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();
  const { imageMap, isLoading: imagesLoading } = useCategoryImages(categories);

  const {
    data: categoryProducts,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useProductsByCategory(category || "", {
    limit: 100,
    sortBy,
    order: sortOrder,
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const { paginatedProducts, totalPages, totalItems } = useMemo(() => {
    let filtered = categoryProducts?.products || [];

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
      );
    }

    const total = filtered.length;
    const pages = Math.ceil(total / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

    return {
      paginatedProducts: paginated,
      totalPages: pages,
      totalItems: total,
    };
  }, [categoryProducts, debouncedSearch, currentPage]);

  // Category Overview (no category selected)
  if (!category) {
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
          {isLoadingCategories ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          ) : categoriesError ? (
            <ErrorState
              title="Failed to load categories"
              message="We couldn't fetch the category data. Please try again."
              onRetry={() => refetchCategories()}
            />
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.slug}
                  category={cat}
                  imageUrl={imageMap[cat.slug]}
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
  }

  // Category Drill-Down View
  const currentCategory = categories?.find((c) => c.slug === category);

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />

      <div className="container py-8">
        {/* Back Link */}
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Link>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 capitalize">
            {currentCategory?.name || category.replace("-", " ")}
          </h1>
          <p className="text-muted-foreground">
            {totalItems} products in this category
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search in this category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full max-w-md"
            />
          </div>
        </div>

        {/* Error State */}
        {productsError && (
          <ErrorState
            title="Failed to load products"
            message="We couldn't fetch the products for this category. Please try again."
            onRetry={refetchProducts}
          />
        )}

        {/* Loading State */}
        {isLoadingProducts && <ProductTableSkeleton rows={10} />}

        {/* Products Table */}
        {!isLoadingProducts &&
          !productsError &&
          paginatedProducts.length > 0 && (
            <>
              <ProductTable
                products={paginatedProducts}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}

        {/* Empty State */}
        {!isLoadingProducts &&
          !productsError &&
          paginatedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {debouncedSearch
                  ? "No products found matching your search."
                  : "No products in this category."}
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Catalogue;
