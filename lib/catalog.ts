import {
  zowkinsApi,
  ProductDetails,
  CategoryProductsResponse,
  CategoryListItem,
} from "./zowkins-api";

export type CatalogItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  brand: string;
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
    price: formatPrice(product.price),
    href: `/products/${product.slug}`,
    image: typeof product.image === "string" ? product.image : product.image?.url || "/desktop.jpg",
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
    const categoriesResponse = await zowkinsApi.listCategories({
      page: 1,
      limit: 100,
    });
    const categories: CategoryListItem[] = Array.isArray(
      categoriesResponse?.categories,
    )
      ? categoriesResponse.categories
      : [];

    if (categories.length === 0) return [];

    const results = await Promise.all(
      categories.map((cat) =>
        zowkinsApi
          .listCategoryProducts(cat.slug, { page: 1, limit: 100 })
          .catch(() => emptyProductsResponse),
      ),
    );

    const allProducts: CatalogItem[] = [];
    for (const result of results) {
      if (!result?.products) continue;
      for (const product of result.products) {
        if (product && product.visible !== false) {
          allProducts.push(productToCatalogItem(product));
        }
      }
    }

    return allProducts;
  } catch (error) {
    console.error("Error fetching all products:", error);
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

