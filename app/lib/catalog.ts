export type ProductVariant = {
  color: "Matte Black" | "Navy Blue" | "White/Cream" | "Olive";
  hex: string;
  imageUrl: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  capacity: string;
  description: string;
  imageUrl: string;
  images: string[];
  colors: string[];
  variants: ProductVariant[];
  price: number;
  mrp: number;
  productCost: number;
  packagingCost: number;
  otherCost: number;
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  specifications: Record<string, string>;
};

export const catalogProducts: CatalogProduct[] = [
  {
    id: "vpansak-core-750",
    name: "VPANSAK Core Bottle — 750ml",
    brand: "VPANSAK Official",
    category: "Bottles & Hydration",
    capacity: "750ml",
    description: "Minimalist, double-wall copper vacuum insulated reusable bottle. Engineered with pro-grade 18/8 stainless steel, sweat-free powder coating, and a leakproof carrying handle. Made for the modern life.",
    imageUrl: "/shop/vpansak-bottle-black.jpg",
    images: [
      "/shop/vpansak-bottle-black.jpg",
      "/shop/vpansak-bottle-blue.jpg",
      "/shop/vpansak-bottle-white.jpg",
      "/shop/vpansak-bottle-olive.jpg"
    ],
    colors: ["Matte Black", "Navy Blue", "White/Cream", "Olive"],
    variants: [
      { color: "Matte Black", hex: "#1c1917", imageUrl: "/shop/vpansak-bottle-black.jpg" },
      { color: "Navy Blue", hex: "#1e3a8a", imageUrl: "/shop/vpansak-bottle-blue.jpg" },
      { color: "White/Cream", hex: "#f5f5f4", imageUrl: "/shop/vpansak-bottle-white.jpg" },
      { color: "Olive", hex: "#3f6212", imageUrl: "/shop/vpansak-bottle-olive.jpg" }
    ],
    price: 699,
    mrp: 1299,
    productCost: 350,
    packagingCost: 40,
    otherCost: 30,
    stock: 150,
    sku: "VP-BOT-CORE-750",
    rating: 49,
    reviewCount: 428,
    badge: "VPANSAK Official",
    specifications: {
      "Capacity": "750 ml",
      "Material": "Pro-Grade 18/8 Stainless Steel",
      "Insulation": "Double-Wall Vacuum + Copper Layer",
      "Thermal Rating": "24 Hours Cold / 12 Hours Hot",
      "Lid Type": "Leakproof Ergonomic Handle Cap",
      "Finish": "Sweat-Free Matte Powder Coat",
      "BPA Free": "100% Non-Toxic & BPA Free",
      "Warranty": "1 Year Official VPANSAK Warranty"
    }
  },
  {
    id: "vpansak-core-1000",
    name: "VPANSAK Core Bottle — 1000ml",
    brand: "VPANSAK Official",
    category: "Bottles & Hydration",
    capacity: "1000ml",
    description: "High-capacity 1 Litre insulated VPANSAK hydration bottle. Built to keep cold drinks chilled for 24 hours and hot drinks steaming for 12 hours without external condensation.",
    imageUrl: "/shop/vpansak-bottle-blue.jpg",
    images: [
      "/shop/vpansak-bottle-blue.jpg",
      "/shop/vpansak-bottle-black.jpg",
      "/shop/vpansak-bottle-white.jpg",
      "/shop/vpansak-bottle-olive.jpg"
    ],
    colors: ["Navy Blue", "Matte Black", "White/Cream", "Olive"],
    variants: [
      { color: "Navy Blue", hex: "#1e3a8a", imageUrl: "/shop/vpansak-bottle-blue.jpg" },
      { color: "Matte Black", hex: "#1c1917", imageUrl: "/shop/vpansak-bottle-black.jpg" },
      { color: "White/Cream", hex: "#f5f5f4", imageUrl: "/shop/vpansak-bottle-white.jpg" },
      { color: "Olive", hex: "#3f6212", imageUrl: "/shop/vpansak-bottle-olive.jpg" }
    ],
    price: 849,
    mrp: 1599,
    productCost: 420,
    packagingCost: 50,
    otherCost: 30,
    stock: 200,
    sku: "VP-BOT-CORE-1000",
    rating: 48,
    reviewCount: 614,
    badge: "VPANSAK Official",
    specifications: {
      "Capacity": "1000 ml (1 Litre)",
      "Material": "Pro-Grade 18/8 Stainless Steel",
      "Insulation": "Double-Wall Vacuum Insulation",
      "Thermal Rating": "24 Hours Cold / 12 Hours Hot",
      "Lid Type": "Heavy-Duty Carry Handle Lid",
      "Finish": "Textured Grip Powder Coating",
      "BPA Free": "100% Food Safe & BPA Free",
      "Warranty": "1 Year Official VPANSAK Warranty"
    }
  },
  {
    id: "vpansak-steel-750",
    name: "VPANSAK Steel Bottle — 750ml",
    brand: "VPANSAK Official",
    category: "Bottles & Hydration",
    capacity: "750ml",
    description: "Rugged double-walled stainless steel bottle featuring laser-engraved VPANSAK emblem branding and an anti-slip protective silicone base for everyday active life.",
    imageUrl: "/shop/vpansak-bottle-white.jpg",
    images: [
      "/shop/vpansak-bottle-white.jpg",
      "/shop/vpansak-bottle-black.jpg",
      "/shop/vpansak-bottle-blue.jpg",
      "/shop/vpansak-bottle-olive.jpg"
    ],
    colors: ["White/Cream", "Matte Black", "Navy Blue", "Olive"],
    variants: [
      { color: "White/Cream", hex: "#f5f5f4", imageUrl: "/shop/vpansak-bottle-white.jpg" },
      { color: "Matte Black", hex: "#1c1917", imageUrl: "/shop/vpansak-bottle-black.jpg" },
      { color: "Navy Blue", hex: "#1e3a8a", imageUrl: "/shop/vpansak-bottle-blue.jpg" },
      { color: "Olive", hex: "#3f6212", imageUrl: "/shop/vpansak-bottle-olive.jpg" }
    ],
    price: 799,
    mrp: 1499,
    productCost: 400,
    packagingCost: 45,
    otherCost: 35,
    stock: 120,
    sku: "VP-BOT-STL-750",
    rating: 49,
    reviewCount: 382,
    badge: "VPANSAK Official",
    specifications: {
      "Capacity": "750 ml",
      "Material": "Pure 18/8 Food-Grade Steel",
      "Insulation": "Extreme Vacuum Insulation",
      "Branding": "Minimal Laser Engraved Logo",
      "Lid Type": "Stainless Steel Threaded Cap",
      "Base": "Non-Slip Reinforced Steel Base",
      "Warranty": "1 Year Official VPANSAK Warranty"
    }
  },
  {
    id: "vpansak-steel-1000",
    name: "VPANSAK Steel Bottle — 1000ml",
    brand: "VPANSAK Official",
    category: "Bottles & Hydration",
    capacity: "1000ml",
    description: "Flagship 1000ml VPANSAK Steel Edition insulated bottle. Ultra-durable double-wall steel body, wide mouth opening for easy cleaning and ice insertion.",
    imageUrl: "/shop/vpansak-bottle-olive.jpg",
    images: [
      "/shop/vpansak-bottle-olive.jpg",
      "/shop/vpansak-bottle-black.jpg",
      "/shop/vpansak-bottle-blue.jpg",
      "/shop/vpansak-bottle-white.jpg"
    ],
    colors: ["Olive", "Matte Black", "Navy Blue", "White/Cream"],
    variants: [
      { color: "Olive", hex: "#3f6212", imageUrl: "/shop/vpansak-bottle-olive.jpg" },
      { color: "Matte Black", hex: "#1c1917", imageUrl: "/shop/vpansak-bottle-black.jpg" },
      { color: "Navy Blue", hex: "#1e3a8a", imageUrl: "/shop/vpansak-bottle-blue.jpg" },
      { color: "White/Cream", hex: "#f5f5f4", imageUrl: "/shop/vpansak-bottle-white.jpg" }
    ],
    price: 949,
    mrp: 1799,
    productCost: 480,
    packagingCost: 55,
    otherCost: 35,
    stock: 180,
    sku: "VP-BOT-STL-1000",
    rating: 50,
    reviewCount: 512,
    badge: "VPANSAK Official",
    specifications: {
      "Capacity": "1000 ml",
      "Material": "Pro-Grade 18/8 Stainless Steel",
      "Insulation": "Double-Wall Vacuum Insulation",
      "Mouth Diameter": "54 mm Wide Mouth",
      "Dishwasher Safe": "Top-Rack Safe Finish",
      "Warranty": "1 Year Official VPANSAK Warranty"
    }
  },
  {
    id: "vpansak-travel-600",
    name: "VPANSAK Travel Bottle — 600ml",
    brand: "VPANSAK Official",
    category: "Bottles & Hydration",
    capacity: "600ml",
    description: "Compact 600ml travel hydration bottle designed for effortless portability, car cup holders, and gym bags. One-touch flip lid with safety lock.",
    imageUrl: "/shop/vpansak-bottle-black.jpg",
    images: [
      "/shop/vpansak-bottle-black.jpg",
      "/shop/vpansak-bottle-blue.jpg",
      "/shop/vpansak-bottle-white.jpg",
      "/shop/vpansak-bottle-olive.jpg"
    ],
    colors: ["Matte Black", "Navy Blue", "White/Cream", "Olive"],
    variants: [
      { color: "Matte Black", hex: "#1c1917", imageUrl: "/shop/vpansak-bottle-black.jpg" },
      { color: "Navy Blue", hex: "#1e3a8a", imageUrl: "/shop/vpansak-bottle-blue.jpg" },
      { color: "White/Cream", hex: "#f5f5f4", imageUrl: "/shop/vpansak-bottle-white.jpg" },
      { color: "Olive", hex: "#3f6212", imageUrl: "/shop/vpansak-bottle-olive.jpg" }
    ],
    price: 599,
    mrp: 1199,
    productCost: 300,
    packagingCost: 35,
    otherCost: 25,
    stock: 160,
    sku: "VP-BOT-TRV-600",
    rating: 48,
    reviewCount: 295,
    badge: "VPANSAK Official",
    specifications: {
      "Capacity": "600 ml",
      "Material": "Lightweight 18/8 Stainless Steel",
      "Lid": "One-Touch Flip Top Lid with Lock",
      "Compatibility": "Fits Standard Car Cup Holders",
      "Weight": "280 g",
      "Warranty": "1 Year Official VPANSAK Warranty"
    }
  }
];
