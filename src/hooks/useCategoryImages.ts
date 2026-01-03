import { useState, useEffect } from "react";
import type { Category } from "@/lib/api";

interface ImageMap {
  [key: string]: string;
}

/**
 * Hook to fetch product images for categories
 * Uses the first product image from each category as the category image
 */
export function useCategoryImages(categories: Category[] | undefined) {
  const [imageMap, setImageMap] = useState<ImageMap>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      setImageMap({});
      return;
    }

    const fetchCategoryImages = async () => {
      setIsLoading(true);
      const newImageMap: ImageMap = {};

      try {
        // Fetch first product from each category to get an image
        const imagePromises = categories.map(async (category) => {
          try {
            const response = await fetch(
              `https://dummyjson.com/products/category/${category.slug}?limit=1`
            );
            const data = await response.json();

            if (data.products && data.products.length > 0) {
              const product = data.products[0];
              // Use the first image from the product
              if (product.images && product.images.length > 0) {
                newImageMap[category.slug] = product.images[0];
              } else if (product.thumbnail) {
                newImageMap[category.slug] = product.thumbnail;
              }
            }
          } catch (error) {
            console.error(
              `Failed to fetch image for category ${category.slug}:`,
              error
            );
            // Continue with other categories
          }
        });

        await Promise.all(imagePromises);
        setImageMap(newImageMap);
      } catch (error) {
        console.error("Error fetching category images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryImages();
  }, [categories]);

  return { imageMap, isLoading };
}
