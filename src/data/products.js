function svgToDataUri(svg) {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

function makePlaceholder(title, bg1, bg2) {
  const short = String(title).slice(0, 22);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${bg1}"/>
          <stop offset="1" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#g)"/>
      <g opacity="0.18">
        <circle cx="120" cy="90" r="70" fill="#22bb39"/>
        <circle cx="470" cy="120" r="90" fill="#3830d2"/>
        <circle cx="420" cy="320" r="120" fill="#6f2323"/>
      </g>
      <g>
        <rect x="38" y="268" width="524" height="64" rx="14" fill="#862a2a" opacity="0.88"/>
        <text x="300" y="309" text-anchor="middle" font-family="Arial" font-size="18" fill="#111">${short}</text>
      </g>
    </svg>
  `;
  return svgToDataUri(svg);
}

const RUPEE = "\u20B9";

export const categories = ["ALL", "MOBILE", "HEADPHONE", "LAPTOP", "TV"];
export const brands = ["ALL", "APPLE", "SAMSUNG", "ONEPLUS", "HP", "ASUS", "BOAT"];

// Demo products for the UI (you can later replace with real API data).
export const products = [
  {
    id: 1,
    title: "iPhone Air 256 GB: Thinnest iPhone Cube",
    price: 11990,
    category: "MOBILE",
    brand: "APPLE",
    image: makePlaceholder("iPhone Air 256 GB", "#f7f7ff", "#cfd6ff"),
  },
  {
    id: 2,
    title: "iPhone 17 Pro 1 TB: 1TB memory, 6.3'' OLED",
    price: 174900,
    category: "MOBILE",
    brand: "APPLE",
    image: makePlaceholder("iPhone 17 Pro 1 TB", "#0b1220", "#2b3a55"),
  },
  {
    id: 3,
    title: "boAt Rockerz 421 (2025 Launch), 40Hrs...",
    price: 2999,
    category: "HEADPHONE",
    brand: "BOAT",
    image: makePlaceholder("boAt Rockerz 421", "#0b3a5a", "#1bb4a1"),
  },
  {
    id: 4,
    title: "Apple 2025 MacBook Air (13-inch, Apple...)",
    price: 83990,
    category: "LAPTOP",
    brand: "APPLE",
    image: makePlaceholder("MacBook Air", "#1a1a1a", "#3c3c3c"),
  },
  {
    id: 5,
    title: "Samsung Galaxy S24 Ultra 2025",
    price: 74999,
    category: "MOBILE",
    brand: "SAMSUNG",
    image: makePlaceholder("Samsung S24 Ultra", "#0f172a", "#7c3aed"),
  },
  {
    id: 6,
    title: "Samsung 108 cm (43 inches) Crystal 4K...",
    price: 26990,
    category: "TV",
    brand: "SAMSUNG",
    image: makePlaceholder("Samsung 43 inch TV", "#b91c1c", "#f97316"),
  },
  {
    id: 7,
    title: "OnePlus Buds 2r True Wireless Ear Pods",
    price: 1399,
    category: "HEADPHONE",
    brand: "ONEPLUS",
    image: makePlaceholder("OnePlus Buds 2r", "#111827", "#2563eb"),
  },
  {
    id: 8,
    title: "HP 15 13th Gen Intel Core i5-13340U (16GB...",
    price: 51990,
    category: "LAPTOP",
    brand: "HP",
    image: makePlaceholder("HP 15 i5 13th Gen", "#0f172a", "#10b981"),
  },
  {
    id: 9,
    title: "ASUS Vivobook 15, AMD Ryzen, 16GB (2025...)",
    price: 41990,
    category: "LAPTOP",
    brand: "ASUS",
    image: makePlaceholder("ASUS Vivobook 15", "#1f2937", "#06b6d4"),
  },
  {
    id: 10,
    title: "OnePlus 13R | Smarter choice, Intel...",
    price: 38990,
    category: "MOBILE",
    brand: "ONEPLUS",
    image: makePlaceholder("OnePlus 13R", "#111827", "#f43f5e"),
  },
  {
    id: 11,
    title: "Apple AirPods Pro (2nd Gen), ANC, MagSafe",
    price: 24990,
    category: "HEADPHONE",
    brand: "APPLE",
    image: makePlaceholder("Apple AirPods Pro", "#0f172a", "#38bdf8"),
  },
  {
    id: 12,
    title: "Sony Bravia 55\" 4K Ultra HD Smart TV",
    price: 59990,
    category: "TV",
    brand: "SONY",
    image: makePlaceholder("Sony Bravia 55 4K", "#020617", "#22c55e"),
  },
];

export function formatPrice(price) {
  return `${RUPEE}${price}`;
}

