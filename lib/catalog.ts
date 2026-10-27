import {
  zowkinsApi,
  ProductDetails,
  CategoryListItem,
  CategoryProductsResponse,
} from "./zowkins-api";
import { resolveImageSource } from "./media";

export type CatalogItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  brand: string;
  subcategory: string;
  price: string;
  href: string;
  image: string;
  description: string;
};

export function formatPrice(value: number): string {
  return value.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function productToCatalogItem(product: ProductDetails): CatalogItem {
  const categoryLabel =
    typeof product.category === "object" && product.category !== null
      ? (product.category as any).name || "Unknown"
      : product.category;

  const subcategoryLabel =
    typeof product.subcategory === "object" && product.subcategory !== null
      ? (product.subcategory as any).name || "Unknown"
      : product.subcategory;

  return {
    id: product.id || (product as any)._id || "",
    slug: product.slug,
    title: product.name,
    category: String(categoryLabel),
    brand: String(subcategoryLabel || categoryLabel),
    subcategory: String(subcategoryLabel || ""),
    price: formatPrice(product.price),
    href: `/products/${product.slug}`,
    // Use the product fallback image instead of the generic file placeholder.
    image: resolveImageSource(product.image, "/desktop.jpg"),
    description: product.description,
  };
}

const emptyProductsResponse: CategoryProductsResponse = {
  products: [],
  meta: {
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 50,
    totalPages: 0,
    currentPage: 1,
  },
  maxPrice: 0,
};

async function fetchProductsByCategoryCrawl(limit = 6): Promise<CatalogItem[]> {
  const pageSize = 50;
  const firstCategoryPage = await zowkinsApi.listCategories({
    page: 1,
    limit: pageSize,
  });
  const categoryPages = await Promise.all(
    Array.from(
      { length: Math.max(0, firstCategoryPage.meta.totalPages - 1) },
      (_, index) =>
        zowkinsApi.listCategories({ page: index + 2, limit: pageSize }),
    ),
  );
  const categories: CategoryListItem[] = [
    ...(Array.isArray(firstCategoryPage?.categories)
      ? firstCategoryPage.categories
      : []),
    ...categoryPages.flatMap((response) =>
      Array.isArray(response?.categories) ? response.categories : [],
    ),
  ];

  if (categories.length === 0) return [];

  const results = await Promise.all(
    categories.map(async (category) => {
      try {
        const firstPage = await zowkinsApi.listCategoryProducts(category.slug, {
          page: 1,
          limit: pageSize,
        });
        const otherPages = await Promise.all(
          Array.from(
            { length: Math.max(0, firstPage.meta.totalPages - 1) },
            (_, index) =>
              zowkinsApi.listCategoryProducts(category.slug, {
                page: index + 2,
                limit: pageSize,
              }),
          ),
        );
        return [
          ...(firstPage.products ?? []),
          ...otherPages.flatMap((response) => response.products ?? []),
        ];
      } catch (error) {
        console.error(
          `Failed to load products for category "${category.slug}":`,
          error,
        );
        return emptyProductsResponse.products;
      }
    }),
  );

  const uniqueProducts = new Map<string, ProductDetails>();
  for (const product of results.flat()) {
    if (product && product.visible !== false) {
      uniqueProducts.set(product.id || product.slug, product);
    }
  }

  return Array.from(uniqueProducts.values())
    .map(productToCatalogItem)
    .slice(0, limit);
}


/**
 * Fetch visible products for a specific category slug,
 * optionally filtered by subcategory slugs.
 */
export async function fetchProductsForCategory(
  categorySlug: string,
  options?: { subcategories?: string[]; page?: number; limit?: number },
): Promise<ProductDetails[]> {
  try {
    const response = await zowkinsApi.listCategoryProducts(categorySlug, {
      page: options?.page ?? 1,
      limit: options?.limit ?? 50,
      subcategories: options?.subcategories,
    });
    return response.products;
  } catch {
    return [];
  }
}

/**
 * Fetch all visible products across every category.
 */
export async function fetchAllProducts(): Promise<CatalogItem[]> {
  try {
    return fetchProductsByCategoryCrawl(999);
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

/**
 * Fetch a small, fast set of featured products for the homepage.
 */
export async function fetchFeaturedProducts(limit = 6): Promise<CatalogItem[]> {
  try {
    // Skip the /products endpoint which may not exist on all backends
    // Instead crawl products by category
    return fetchProductsByCategoryCrawl(limit);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

/**
 * Search across all visible products in every category.
 */
export async function searchCatalog(query: string): Promise<CatalogItem[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const allProducts = await fetchAllProducts();
  return allProducts.filter((item) => {
    return (
      item.title.toLowerCase().includes(normalized) ||
      item.brand.toLowerCase().includes(normalized) ||
      item.category.toLowerCase().includes(normalized) ||
      item.description.toLowerCase().includes(normalized)
    );
  });
}
