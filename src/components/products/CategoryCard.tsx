import { Link } from "react-router-dom";
import { type Category } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  productCount?: number;
  className?: string;
  imageUrl?: string;
  isImageLoading?: boolean;
}

export function CategoryCard({
  category,
  productCount,
  className,
  imageUrl,
  isImageLoading,
}: CategoryCardProps) {
  return (
    <Link to={`/catalogue/${category.slug}`}>
      <Card
        className={cn(
          "group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer",
          className
        )}
      >
        {/* Image Section */}
        <div className="relative w-full h-48 bg-muted overflow-hidden">
          {isImageLoading ? (
            <div className="w-full h-full bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse" />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted via-muted-foreground/20 to-muted" />
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-6">
          <h3 className="font-semibold capitalize group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          {productCount !== undefined && (
            <p className="text-sm text-muted-foreground mt-1">
              {productCount} items
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
