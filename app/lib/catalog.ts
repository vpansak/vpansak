export type CatalogProduct = {
  id: string; name: string; brand: string; category: string; description: string;
  imageUrl: string; images: string[]; price: number; mrp: number; stock: number;
  sku: string; rating: number; reviewCount: number; badge?: string;
  specifications: Record<string, string>;
};

export const catalogProducts: CatalogProduct[] = [];

