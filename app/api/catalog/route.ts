import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { products } from "../../../db/schema";
import { catalogProducts } from "../../lib/catalog";

async function seed() {
  const db = await getDb();
  await db.insert(products).values(catalogProducts.map((item) => ({ id:item.id,name:item.name,brand:item.brand,category:item.category,description:item.description,specifications:JSON.stringify(item.specifications),imageUrl:item.imageUrl,images:JSON.stringify(item.images),price:item.price,mrp:item.mrp,stock:item.stock,sku:item.sku,rating:item.rating,reviewCount:item.reviewCount }))).onConflictDoNothing();
  return db;
}

export async function GET(request: Request) {
  try { const db = await seed(); const url = new URL(request.url); const id = url.searchParams.get("id"); const category = url.searchParams.get("category"); if (id) { const [product] = await db.select().from(products).where(eq(products.id,id)).limit(1); return product ? Response.json({ product }) : Response.json({ error:"Product not found." },{status:404}); } const rows = category ? await db.select().from(products).where(eq(products.category,category)).orderBy(asc(products.name)) : await db.select().from(products).orderBy(asc(products.name)); return Response.json({ products:rows }); }
  catch { return Response.json({ products:catalogProducts, fallback:true }); }
}
