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

const MAX_CATALOG_REQUESTS = 4;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex++;
        results[currentIndex] = await mapper(items[currentIndex]);
      }
    }),
  );

  return results;
}

async function fetchCategories(): Promise<CategoryListItem[]> {
  const pageSize = 50;
  const firstPage = await zowkinsApi.listCategories({ page: 1, limit: pageSize });
  const pageNumbers = Array.from(
    { length: Math.max(0, firstPage.meta.totalPages - 1) },
    (_, index) => index + 2,
  );
  const additionalCategories = await mapWithConcurrency(
    pageNumbers,
    MAX_CATALOG_REQUESTS,
    async (page) => {
      try {
        const response = await zowkinsApi.listCategories({ page, limit: pageSize });
        return Array.isArray(response.categories) ? response.categories : [];
      } catch (error) {
        console.error(`Failed to load category page ${page}:`, error);
        return [];
      }
    },
  );

  return [
    ...(Array.isArray(firstPage.categories) ? firstPage.categories : []),
    ...additionalCategories.flat(),
  ];
}

function toCatalogItems(products: ProductDetails[], limit: number): CatalogItem[] {
  const uniqueProducts = new Map<string, ProductDetails>();
  for (const product of products) {
    if (product && product.visible !== false) {
      uniqueProducts.set(product.id || product.slug, product);
    }
  }

  return Array.from(uniqueProducts.values())
    .map(productToCatalogItem)
    .slice(0, limit);
}

async function fetchProductsByCategoryCrawl(limit = 6): Promise<CatalogItem[]> {
  const pageSize = 50;
  const categories = await fetchCategories();
  if (categories.length === 0) return [];

  const firstPages = await mapWithConcurrency(
    categories,
    MAX_CATALOG_REQUESTS,
    async (category) => {
      try {
        const response = await zowkinsApi.listCategoryProducts(category.slug, {
          page: 1,
          limit: pageSize,
        });
        return { category, response };
      } catch (error) {
        console.error(
          `Failed to load products for category "${category.slug}":`,
          error,
        );
        return { category, response: emptyProductsResponse };
      }
    },
  );

  const additionalPageRequests = firstPages.flatMap(({ category, response }) =>
    Array.from({ length: Math.max(0, response.meta.totalPages - 1) }, (_, index) => ({
      category,
      page: index + 2,
    })),
  );
  const additionalProductPages = await mapWithConcurrency(
    additionalPageRequests,
    MAX_CATALOG_REQUESTS,
    async ({ category, page }) => {
      try {
        const response = await zowkinsApi.listCategoryProducts(category.slug, {
          page,
          limit: pageSize,
        });
        return response.products ?? [];
      } catch (error) {
        console.error(
          `Failed to load page ${page} for category "${category.slug}":`,
          error,
        );
        return emptyProductsResponse.products;
      }
    },
  );

  const products = [
    ...firstPages.flatMap(({ response }) => response.products ?? []),
    ...additionalProductPages.flat(),
  ];
  return toCatalogItems(products, limit);
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
    return await fetchProductsByCategoryCrawl(999);
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
    const response = await zowkinsApi.listCategories({ page: 1, limit: 50 });
    const categories = Array.isArray(response.categories)
      ? response.categories
      : [];
    const products: ProductDetails[] = [];

    for (let start = 0; start < categories.length; start += MAX_CATALOG_REQUESTS) {
      const categoryBatch = categories.slice(start, start + MAX_CATALOG_REQUESTS);
      const batchProducts = await Promise.all(
        categoryBatch.map(async (category) => {
          try {
            const result = await zowkinsApi.listCategoryProducts(category.slug, {
              page: 1,
              limit,
            });
            return result.products ?? [];
          } catch (error) {
            console.error(
              `Failed to load featured products for category "${category.slug}":`,
              error,
            );
            return [];
          }
        }),
      );

      products.push(...batchProducts.flat());
      if (toCatalogItems(products, limit).length >= limit) break;
    }

    return toCatalogItems(products, limit);
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
