import { asc, eq, inArray, notInArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { products } from "../../../db/schema";
import { catalogProducts } from "../../lib/catalog";

async function seed() {
  const db = await getDb();
  
  // 1. Purge legacy demo products that are not in catalogProducts
  const validIds = catalogProducts.map((p) => p.id);
  try {
    await db.delete(products).where(notInArray(products.id, validIds));
  } catch {}

  // 2. Insert or update valid VPANSAK bottle products
  for (const item of catalogProducts) {
    try {
      await db.insert(products).values({
        id: item.id,
        name: item.name,
        brand: item.brand,
        category: item.category,
        capacity: item.capacity || null,
        description: item.description,
        specifications: JSON.stringify(item.specifications),
        imageUrl: item.imageUrl,
        images: JSON.stringify(item.images),
        colors: JSON.stringify(item.colors || []),
        variants: JSON.stringify(item.variants || []),
        price: item.price,
        mrp: item.mrp,
        productCost: item.productCost || 0,
        packagingCost: item.packagingCost || 0,
        otherCost: item.otherCost || 0,
        stock: item.stock,
        sku: item.sku,
        rating: item.rating,
        reviewCount: item.reviewCount,
        status: "Approved"
      }).onConflictDoUpdate({
        target: products.id,
        set: {
          name: item.name,
          brand: item.brand,
          category: item.category,
          capacity: item.capacity || null,
          description: item.description,
          specifications: JSON.stringify(item.specifications),
          imageUrl: item.imageUrl,
          images: JSON.stringify(item.images),
          colors: JSON.stringify(item.colors || []),
          variants: JSON.stringify(item.variants || []),
          price: item.price,
          mrp: item.mrp,
          productCost: item.productCost || 0,
          packagingCost: item.packagingCost || 0,
          otherCost: item.otherCost || 0,
          stock: item.stock,
          sku: item.sku,
          rating: item.rating,
          reviewCount: item.reviewCount
        }
      });
    } catch {}
  }
  return db;
}

export async function GET(request: Request) {
  try {
    const db = await seed();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const category = url.searchParams.get("category");

    if (id) {
      const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
      return product ? Response.json({ product }) : Response.json({ error: "Product not found." }, { status: 404 });
    }

    const rows = category
      ? await db.select().from(products).where(eq(products.category, category)).orderBy(asc(products.name))
      : await db.select().from(products).orderBy(asc(products.name));

    return Response.json({ products: rows.length ? rows : catalogProducts });
  } catch {
    return Response.json({ products: catalogProducts, fallback: true });
  }
}
