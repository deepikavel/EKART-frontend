import React, { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  fetchProductsOnline,
  loginUser,
  registerUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  createPurchaseOrder,
  fetchOrdersByUser,
} from "./api/products.js";
import { products as localProducts } from "./data/products.js";

function ConfettiField({ density = 18, burstOnClick = true }) {
  const [seed, setSeed] = useState(1);
  const [burstSeed, setBurstSeed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeed((s) => s + 1), 3800);
    return () => clearInterval(t);
  }, []);

  const particles = useMemo(() => {
    const rand = (a, b, k) => {
      const x = Math.sin(k * 9999) * 10000;
      const r = x - Math.floor(x);
      return a + r * (b - a);
    };
    const palette = ["#ff7a18", "#ffb703", "#fb7185", "#a78bfa", "#67e8f9", "#bbf7d0"];
    const out = [];
    for (let i = 0; i < density; i += 1) {
      const k = (seed + 1) * 100 + i * 17;
      out.push({
        id: `${seed}-${i}`,
        left: rand(6, 94, k + 1),
        top: rand(10, 88, k + 2),
        size: rand(6, 12, k + 3),
        rot: rand(-120, 120, k + 4),
        dur: rand(1400, 2600, k + 5),
        delay: rand(0, 850, k + 6),
        color: palette[Math.floor(rand(0, palette.length - 0.001, k + 7))],
        kind: rand(0, 1, k + 8) > 0.62 ? "ribbon" : rand(0, 1, k + 9) > 0.55 ? "star" : "chip",
      });
    }
    return out;
  }, [density, seed]);

  return (
    <div
      className="ek-confetti-field"
      onClick={() => {
        if (!burstOnClick) return;
        setBurstSeed((x) => x + 1);
      }}
      data-burst={burstSeed}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={`ek-confetti ek-confetti-${p.kind}`}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.kind === "ribbon" ? Math.max(10, p.size * 1.8) : p.size,
            height: p.kind === "ribbon" ? Math.max(2, p.size / 3) : p.size,
            background: p.kind === "star" ? "transparent" : p.color,
            color: p.color,
            ["--rot"]: `${p.rot}deg`,
            ["--dur"]: `${p.dur}ms`,
            ["--delay"]: `${p.delay}ms`,
            ["--spin"]: `${Math.max(900, Math.round(p.dur * 0.85))}ms`,
          }}
        />
      ))}
    </div>
  );
}

function CartIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6.2 6.8H21L19.2 14.6H7.5L6.2 6.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M6.2 6.8L5.2 3H2.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M8.3 20.2C9.0 20.2 9.6 19.6 9.6 18.9C9.6 18.2 9.0 17.6 8.3 17.6C7.6 17.6 7.0 18.2 7.0 18.9C7.0 19.6 7.6 20.2 8.3 20.2Z"
        fill="currentColor"
      />
      <path
        d="M18 20.2C18.7 20.2 19.3 19.6 19.3 18.9C19.3 18.2 18.7 17.6 18 17.6C17.3 17.6 16.7 18.2 16.7 18.9C16.7 19.6 17.3 20.2 18 20.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function useScrollToHash() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);
}

function Header({ cartCount, isAuthed, onLogout, profileName, profilePhoto }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);
  const initials = String(profileName || "U")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("") || "U";

  return (
    <header className="ek-top-nav">
      <div className="ek-logo">
        <CartIcon size={22} />
        <span>Shopynex</span>
      </div>

      <div className="ek-nav-right">
        <nav className="ek-nav-links" aria-label="Primary">
          <Link to="/" onClick={closeMobile}>Home</Link>
          <Link to="/products" onClick={(e) => {
            if (!isAuthed) {
              e.preventDefault();
              alert("Please login first");
              navigate("/login");
              return;
            }
            closeMobile();
          }}>Products</Link>
          <Link
            to="/orders"
            onClick={(e) => {
              if (!isAuthed) {
                e.preventDefault();
                alert("Please login first");
                navigate("/login");
                return;
              }
              closeMobile();
            }}
          >
            My Orders
          </Link>
          <Link to="/#brands" onClick={closeMobile}>Brands</Link>
          <Link to="/#reviews" onClick={closeMobile}>Reviews</Link>
          <Link to="/#about" onClick={closeMobile}>About</Link>
        </nav>

        <button
          type="button"
          className="ek-cart-btn"
          aria-label="Cart"
          onClick={() => {
            if (!isAuthed) {
              alert("Please login first");
              navigate("/login");
              return;
            }
            closeMobile();
            navigate("/cart");
          }}
        >
          <CartIcon size={18} />
          <span className="ek-cart-badge" aria-label={`Cart count: ${cartCount}`}>
            {cartCount}
          </span>
        </button>

        {isAuthed ? (
          <>
            <button
              type="button"
              className="ek-profile-btn"
              title={profileName || "Profile"}
              onClick={() => {
                closeMobile();
                navigate("/profile");
              }}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" />
              ) : (
                initials
              )}
            </button>
            <button type="button" className="ek-login-btn" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            className="ek-login-btn"
            onClick={() => {
              closeMobile();
              navigate("/login");
            }}
          >
            Login
          </button>
        )}

        <button
          type="button"
          className="ek-burger"
          aria-label="Menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {mobileOpen ? (
        <div className="ek-mobile-menu" role="dialog" aria-label="Mobile menu">
          <Link to="/" onClick={closeMobile}>Home</Link>
          <Link
            to="/products"
            onClick={(e) => {
              if (!isAuthed) {
                e.preventDefault();
                alert("Please login first");
                navigate("/login");
                return;
              }
              closeMobile();
            }}
          >
            Products
          </Link>
          <Link
            to="/orders"
            onClick={(e) => {
              if (!isAuthed) {
                e.preventDefault();
                alert("Please login first");
                navigate("/login");
                return;
              }
              closeMobile();
            }}
          >
            My Orders
          </Link>
          <Link to="/#brands" onClick={closeMobile}>Brands</Link>
          <Link to="/#reviews" onClick={closeMobile}>Reviews</Link>
          <Link to="/#about" onClick={closeMobile}>About</Link>
        </div>
      ) : null}
    </header>
  );
}

function RequireAuth({ isAuthed, children }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthed) {
      alert("Please login first");
      navigate("/login", { replace: true });
    }
  }, [isAuthed, navigate]);
  if (!isAuthed) return null;
  return children;
}

function formatPrice(price) {
  return `\u20B9${Number(price ?? 0)}`;
}

function getCategoryLabel(category) {
  if (category === "MOBILE") return "Phone";
  return category;
}

function SidebarFilters({
  categories,
  brands,
  category,
  setCategory,
  brand,
  setBrand,
  search,
  setSearch,
  onReset,
}) {
  return (
    <aside className="ek-sidebar" aria-label="Filters">
      <div className="ek-section-title">Search</div>
      <input
        className="ek-search"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="ek-section-title">Category</div>
      {categories.map((c) => (
        <div key={c} className="ek-radio-row">
          <label>
            <input
              type="radio"
              name="category"
              value={c}
              checked={category === c}
              onChange={() => setCategory(c)}
            />
            {c === "ALL" ? "ALL" : getCategoryLabel(c)}
          </label>
        </div>
      ))}

      <div className="ek-section-title">Brand</div>
      <select className="ek-brand-select" value={brand} onChange={(e) => setBrand(e.target.value)}>
        {brands.map((b) => (
          <option value={b} key={b}>
            {b === "ALL" ? "ALL" : b}
          </option>
        ))}
      </select>

      <button type="button" className="ek-reset-btn" onClick={onReset}>
        Reset Filters
      </button>
    </aside>
  );
}

function SortBar({ sort, setSort }) {
  return (
    <div className="ek-sort-row">
      <select className="ek-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="price_asc">Price (low to high)</option>
        <option value="price_desc">Price (high to low)</option>
      </select>
    </div>
  );
}

function PromoCategoryStrip({ onPick, items }) {
  const fallbackItems = [
    { key: "ALL", label: "All", icon: "✨", category: "ALL" },
    { key: "MOBILE", label: "Phone", icon: "📱", category: "MOBILE" },
    { key: "AIRPODS", label: "Airpods", icon: "🎧", category: "HEADPHONE" },
    { key: "HEADPHONE", label: "Headphone", icon: "🎧", category: "HEADPHONE" },
    { key: "LAPTOP", label: "Laptop", icon: "💻", category: "LAPTOP" },
    { key: "TV", label: "TV", icon: "📺", category: "TV" },
  ];
  const finalItems = Array.isArray(items) && items.length ? items : fallbackItems;

  return (
    <div className="ek-promo-strip" aria-label="Promo categories">
      {finalItems.map((it) => (
        <button
          key={it.key}
          type="button"
          className="ek-promo-item"
          onClick={() => onPick?.(it.category || it.key)}
        >
          <span className="ek-promo-glow" />
          <span className="ek-promo-icon">{it.icon}</span>
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

const PRODUCT_REVIEW_TEXTS = [
  "Great quality and value for money.",
  "Superb product with excellent performance.",
  "Worth buying. Good build and fast delivery.",
  "Customer support was helpful and quick.",
  "Amazing experience. Highly recommended!",
];

function getProductSeed(product) {
  const n = Number(product?.id ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function getProductRating(product) {
  const seed = getProductSeed(product);
  // Stable demo rating (3.8 - 4.9)
  return 3.8 + ((seed % 11) * 0.1);
}

function getProductReviewCount(product) {
  const seed = getProductSeed(product);
  // Stable demo review count (50 - 149)
  return 50 + (seed % 100);
}

function getProductReviewText(product) {
  const seed = getProductSeed(product);
  return PRODUCT_REVIEW_TEXTS[seed % PRODUCT_REVIEW_TEXTS.length];
}

function getShoeSizeOptions(product) {
  // Demo "shoe size" options.
  return ["6", "7", "8", "9", "10"];
}

function getDressSizeOptions(product) {
  // Demo "dress size" options.
  return ["S", "M", "L", "XL"];
}

function RatingStars({ value, onChange, size = 16, readOnly = false, stopPropagation = false }) {
  const current = Number(value || 0);
  const rounded = Math.max(0, Math.min(5, Math.round(current)));
  const Stars = [1, 2, 3, 4, 5];

  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {Stars.map((i) => {
        const filled = i <= rounded;
        return (
          <button
            key={i}
            type="button"
            aria-label={`${i} star`}
            disabled={readOnly || !onChange}
            onClick={(e) => {
              if (stopPropagation) e.stopPropagation();
              onChange?.(i);
            }}
            style={{
              padding: 0,
              width: size,
              height: size,
              border: 0,
              background: "transparent",
              cursor: readOnly || !onChange ? "default" : "pointer",
              color: filled ? "#f59e0b" : "rgba(0,0,0,0.20)",
              fontSize: size,
              lineHeight: `${size}px`,
            }}
          >
            ★
          </button>
        );
      })}
    </span>
  );
}

function ProductCard({ product, onAdd, ratingValue, onRatingChange }) {
  const baseRating = getProductRating(product);
  const currentRating = typeof ratingValue === "number" ? ratingValue : baseRating;

  return (
    <div className="ek-card ek-card-offer ek-card-list" role="group" aria-label={product.title}>
      <div className="ek-img-wrap ek-img-wrap-list">
        <img className="ek-img" src={product.image} alt={product.title} loading="lazy" />
      </div>
      <div className="ek-card-info">
        <div className="ek-card-title ek-card-title-list">{product.title}</div>
        <div className="ek-card-price">{formatPrice(product.price)}</div>
        <div style={{ padding: "0 10px 12px", fontSize: 12, color: "#111", opacity: 0.9 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RatingStars
              value={currentRating}
              onChange={onRatingChange}
              size={14}
              readOnly={false}
              stopPropagation={true}
            />
            <span style={{ fontWeight: 900 }}>{currentRating.toFixed(1)}</span>
            <span style={{ opacity: 0.85 }}>({getProductReviewCount(product)} reviews)</span>
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              lineHeight: 1.25,
              color: "#111",
              opacity: 0.78,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {getProductReviewText(product)}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="ek-add-btn ek-add-btn-list"
        onClick={(e) => {
          e.stopPropagation();
          onAdd(product);
        }}
      >
        <CartIcon size={16} />
        Add
      </button>
    </div>
  );
}

function ProductsPage({ onAddToCart }) {
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);

  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [brand, setBrand] = useState("ALL");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(99999);
  const [sort, setSort] = useState("price_asc");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userRatings, setUserRatings] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        setUsingFallback(false);
        const list = await fetchProductsOnline();
        if (!alive) return;
        setRemoteProducts(list);
      } catch (e) {
        if (!alive) return;
        setLoadError(e?.message || "Failed to load products");
        setUsingFallback(true);
        setRemoteProducts(Array.isArray(localProducts) ? localProducts : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(remoteProducts.map((p) => p.category).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [remoteProducts]);

  const brands = useMemo(() => {
    const set = new Set(remoteProducts.map((p) => p.brand).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [remoteProducts]);

  useEffect(() => {
    const wanted = searchParams.get("category");
    if (!wanted) return;
    const normalized = String(wanted).trim().toUpperCase();
    if (!normalized) return;
    setCategory((current) => (current === normalized ? current : normalized));
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...remoteProducts];
    if (category !== "ALL") list = list.filter((p) => p.category === category);
    if (brand !== "ALL") list = list.filter((p) => p.brand === brand);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => String(p.title).toLowerCase().includes(q));
    }
    list = list.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    list.sort((a, b) => {
      if (sort === "price_desc") return b.price - a.price;
      return a.price - b.price;
    });
    return list;
  }, [brand, category, maxPrice, minPrice, remoteProducts, search, sort]);

  return (
    <>
      <div className="ek-page">
      <PromoCategoryStrip
        onPick={(cat) => {
          setCategory(cat);
          setBrand("ALL");
          setSearch("");
        }}
      />
      <div className="ek-body">
        <SidebarFilters
          categories={categories}
          brands={brands}
          category={category}
          setCategory={setCategory}
          brand={brand}
          setBrand={setBrand}
          search={search}
          setSearch={setSearch}
          onReset={() => {
            setSearch("");
            setCategory("ALL");
            setBrand("ALL");
            setMinPrice(0);
            setMaxPrice(99999);
          }}
        />

        <main className="ek-main">
          <div className="ek-main-top">
            <SortBar sort={sort} setSort={setSort} />
          </div>
          {usingFallback ? (
            <div style={{ padding: "6px 0 10px", fontSize: 12, color: "rgba(255,255,255,0.72)" }}>
              Showing offline demo products (API not reachable).
            </div>
          ) : null}
          {loading ? (
            <div style={{ padding: 10, fontSize: 14 }}>Loading products...</div>
          ) : (
            <div className="ek-product-list" aria-label="Products">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedProduct(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedProduct(p);
                  }}
                >
                  <ProductCard
                    product={p}
                    onAdd={onAddToCart}
                    ratingValue={typeof userRatings[p.id] === "number" ? userRatings[p.id] : undefined}
                    onRatingChange={(val) => {
                      setUserRatings((prev) => ({ ...prev, [p.id]: val }));
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
      {selectedProduct ? (
        <ProductQuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={() => onAddToCart(selectedProduct)}
          initialRating={
            typeof userRatings[selectedProduct?.id] === "number" ? userRatings[selectedProduct.id] : undefined
          }
          onRatingChange={(val) => {
            setUserRatings((prev) => ({ ...prev, [selectedProduct.id]: val }));
          }}
        />
      ) : null}
    </>
  );
}

function ProductQuickViewModal({ product, onClose, onAdd, initialRating, onRatingChange }) {
  const baseRating = getProductRating(product);
  const reviewText = getProductReviewText(product);
  const reviewCount = getProductReviewCount(product);
  const [userRating, setUserRating] = useState(
    typeof initialRating === "number" ? initialRating : baseRating
  );

  useEffect(() => {
    setUserRating(typeof initialRating === "number" ? initialRating : baseRating);
  }, [initialRating, baseRating]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product details"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          borderRadius: 18,
          background: "#fff",
          color: "#111",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontWeight: 900 }}>Product Details</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid rgba(0,0,0,0.10)",
              background: "transparent",
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14, padding: 16 }}>
          <div style={{ background: "#f6f7fb", borderRadius: 14, padding: 12, display: "grid", placeItems: "center" }}>
            <img src={product.image} alt={product.title} style={{ maxWidth: "100%", maxHeight: 260, objectFit: "contain" }} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 950, fontSize: 18, lineHeight: 1.25 }}>{product.title}</div>
            <div style={{ marginTop: 6, fontWeight: 900, fontSize: 16, color: "#111" }}>{formatPrice(product.price)}</div>

            <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontWeight: 900 }}>
                <RatingStars
                  value={userRating}
                  onChange={(val) => {
                    setUserRating(val);
                    onRatingChange?.(val);
                  }}
                  size={18}
                />
                <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 950 }}>{userRating.toFixed(1)}</span>
                <span style={{ fontWeight: 700, opacity: 0.7, fontSize: 13, marginLeft: 8 }}>({reviewCount} reviews)</span>
              </div>
            </div>

            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.82, lineHeight: 1.35 }}>
              Comment: {reviewText}
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => onAdd?.()}
                style={{
                  flex: 1,
                  border: 0,
                  borderRadius: 12,
                  padding: "12px 14px",
                  background: "linear-gradient(45deg, #7c3aed, #ec4899)",
                  color: "#fff",
                  fontWeight: 950,
                  cursor: "pointer",
                }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  background: "#fff",
                  color: "#111",
                  fontWeight: 950,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomePage({ onAddToCart }) {
  useScrollToHash();
  const navigate = useNavigate();

  const [homeProducts, setHomeProducts] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeCategory, setHomeCategory] = useState("ALL");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [homeUserRatings, setHomeUserRatings] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setHomeLoading(true);
        const list = await fetchProductsOnline();
        if (!alive) return;
        // Merge remote + local demo products so categories like HEADPHONE/TV always have products.
        const merged = [
          ...(Array.isArray(list) ? list : []),
          ...(Array.isArray(localProducts) ? localProducts : []),
        ];
        const seen = new Set();
        const unique = merged.filter((p) => {
          const key = `${String(p.category || "").toUpperCase()}|${String(p.title || "")}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setHomeProducts(unique.slice(0, 24));
      } catch {
        if (!alive) return;
        setHomeProducts((Array.isArray(localProducts) ? localProducts : []).slice(0, 18));
      } finally {
        if (alive) setHomeLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    // Close quick view when switching categories.
    setSelectedProduct(null);
  }, [homeCategory]);

  const brandRow = ["APPLE", "SAMSUNG", "ONEPLUS", "HP", "ASUS", "BOAT", "SONY", "DELL"];

  const reviews = [
    { name: "Asha", text: "Fast delivery and great offers. The UI is very easy to use.", rating: 5 },
    { name: "Rahul", text: "Cart and filters work smoothly. Products look exactly like a real store.", rating: 4 },
    { name: "Deepak", text: "Good pricing and clean design. Login was simple and quick.", rating: 5 },
  ];

  const aboutHighlights = [
    { key: "Fast", icon: "⚡", text: "Quick filters, instant cart updates, smooth browsing." },
    { key: "Trusted", icon: "🛡️", text: "Login backed by your secure backend API." },
    { key: "Offers", icon: "🎁", text: "Sales-offer hero UI to showcase promotions." },
  ];

  const dealsList =
    homeCategory === "ALL" ? homeProducts : homeProducts.filter((p) => p.category === homeCategory);
  const leftDeals = dealsList.slice(0, 9);
  const rightDeals = dealsList.slice(9, 18);

  const categoryCounts = useMemo(() => {
    const counts = { MOBILE: 0, HEADPHONE: 0, LAPTOP: 0, TV: 0 };
    for (const p of homeProducts) {
      const c = String(p.category || "").toUpperCase();
      if (counts[c] != null) counts[c] += 1;
    }
    return counts;
  }, [homeProducts]);

  const stripItems = [
    { key: "MOBILE", label: "Phone", icon: "📱", category: "MOBILE" },
    { key: "AIRPODS", label: "Airpods", icon: "🎧", category: "HEADPHONE" },
    { key: "HEADPHONE", label: "Headphone", icon: "🎧", category: "HEADPHONE" },
    { key: "LAPTOP", label: "Laptop", icon: "💻", category: "LAPTOP" },
    { key: "TV", label: "TV", icon: "📺", category: "TV" },
  ].filter((it) => {
    return (categoryCounts[it.category] || 0) > 0;
  });

  return (
    <>
      <div className="ek-home">
      <section className="ek-hero">
        <div className="ek-hero-inner">
          <div className="ek-hero-poster" aria-label="Shopynex hero">
            <ConfettiField />
            <div className="ek-hero-brand">Shopynex</div>
            <div className="ek-hero-tag">Shop with confidence</div>
            <div className="ek-hero-tag2">Your satisfaction is our priority</div>
            <div className="ek-hero-marquee" aria-label="Running text">
              <div className="ek-hero-marquee-track">
                <span>
                  BIG SALE: 50% OFF • Flash Deals on Electronics • Limited Time Offer • Grab Your Favorites • Extra Savings •
                  50% OFF Ends Soon • Shop Now & Save •
                </span>
                <span aria-hidden="true">
                  BIG SALE: 50% OFF • Flash Deals on Electronics • Limited Time Offer • Grab Your Favorites • Extra Savings •
                  50% OFF Ends Soon • Shop Now & Save •
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ek-section" style={{ paddingTop: 8 }}>
        {/* Static chips on Home (clicking should not change any filtering state). */}
        <PromoCategoryStrip items={stripItems} />
      </section>

      <section className="ek-section" id="today-deals">
        <div className="ek-section-head">
          <div className="ek-section-title2">Today’s Deals</div>
        </div>

        {homeLoading ? (
          <div style={{ padding: "10px 0", color: "#444" }}>Loading deals...</div>
        ) : (
          <div className="ek-deals-2col">
            <AutoProductSlider
              title="Trending"
              items={leftDeals}
              onViewAll={() => navigate("/products")}
              onClickProduct={(p) => setSelectedProduct(p)}
            />
            <AutoProductSlider
              title="Hot Picks"
              items={rightDeals}
              onViewAll={() => navigate("/products")}
              onClickProduct={(p) => setSelectedProduct(p)}
              reverse
            />
          </div>
        )}
      </section>

      <section className="ek-section" id="brands">
        <div className="ek-section-head">
          <div className="ek-section-title2">Top Brands</div>
          <div className="ek-section-sub">Popular brands customers love on Shopynex</div>
        </div>
        <div className="ek-brand-row">
          {brandRow.map((b) => (
            <button
              key={b}
              type="button"
              className="ek-brand-pill"
              onClick={() => navigate(`/products?brand=${encodeURIComponent(b)}`)}
              title={`View ${b} products`}
            >
              {b}
            </button>
          ))}
        </div>
      </section>

      <section className="ek-section" id="reviews">
        <div className="ek-section-head">
          <div className="ek-section-title2">Customer Reviews</div>
          <div className="ek-section-sub">What people say about Shopynex</div>
        </div>
        <div className="ek-review-grid">
          {reviews.map((r) => (
            <div key={r.name} className="ek-review-card">
              <div className="ek-review-head">
                <div className="ek-review-name">{r.name}</div>
                <div className="ek-review-badge">Verified Buyer</div>
              </div>
              <div className="ek-review-rating" aria-label={`Rating ${r.rating} out of 5`}>
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>
              <div className="ek-review-text">“{r.text}”</div>
            </div>
          ))}
        </div>
      </section>

      <section className="ek-section" id="about">
        <div className="ek-section-head">
          <div className="ek-section-title2">About Shopynex</div>
          <div className="ek-section-sub">
            Shopynex is a modern shopping experience built for speed, simplicity, and great deals.
          </div>
        </div>
        <div className="ek-about-box">
          {aboutHighlights.map((item) => (
            <div key={item.key} className="ek-about-item">
              <div className="ek-about-k">{item.icon} {item.key}</div>
              <div className="ek-about-v">{item.text}</div>
              <button type="button" className="ek-about-link">Learn more</button>
            </div>
          ))}
        </div>
      </section>
      </div>
      {selectedProduct ? (
        <ProductQuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={() => onAddToCart(selectedProduct)}
        />
      ) : null}
    </>
  );
}

function AutoProductSlider({ title, items, onViewAll, onClickProduct, reverse = false }) {
  const [index, setIndex] = useState(0);

  const pageSize = 3;
  const pages = Math.max(1, Math.ceil((items?.length || 0) / pageSize));

  useEffect(() => {
    if (!items || items.length === 0) return undefined;
    const t = setInterval(() => {
      setIndex((i) => {
        const next = reverse ? i - 1 : i + 1;
        if (next < 0) return pages - 1;
        return next % pages;
      });
    }, 2500);
    return () => clearInterval(t);
  }, [items, pages, reverse]);

  const start = index * pageSize;
  const slice = items.slice(start, start + pageSize);

  return (
    <div className="ek-slider">
      <div className="ek-slider-head">
        <div className="ek-slider-title">{title}</div>
        <button type="button" className="ek-slider-link" onClick={onViewAll}>
          View all
        </button>
      </div>

      <div className="ek-slider-body">
        <button
          type="button"
          className="ek-slider-arrow"
          aria-label="Previous"
          onClick={() => setIndex((i) => (i - 1 + pages) % pages)}
        >
          ‹
        </button>

        <div className="ek-slider-track" aria-label="Sliding products">
          {slice.map((p) => (
            <button key={p.id} type="button" className="ek-mini-card" onClick={() => onClickProduct?.(p)}>
              <div className="ek-mini-img">
                <img src={p.image} alt={p.title} />
              </div>
              <div className="ek-mini-title">{p.title}</div>
              <div className="ek-mini-price">{formatPrice(p.price)}</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="ek-slider-arrow"
          aria-label="Next"
          onClick={() => setIndex((i) => (i + 1) % pages)}
        >
          ›
        </button>
      </div>

      <div className="ek-slider-dots" aria-label="Slider position">
        {Array.from({ length: pages }).map((_, i) => (
          <span key={i} className={i === index ? "ek-dot ek-dot-active" : "ek-dot"} />
        ))}
      </div>
    </div>
  );
}

function CartPage({ items, onInc, onDec, onRemove, onClear, currentUser }) {
  const navigate = useNavigate();
  const total = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0);
  const totalItems = items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
  const _currentUser = currentUser;
  const tax = total * 0.05;
  const shipping = total > 0 ? 0 : 0;
  const grandTotal = total + tax + shipping;
  return (
    <div className="ek-cart-page">
      <div className="ek-cart-grid">
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Your Cart</div>
            <button type="button" className="ek-login-btn" onClick={onClear} disabled={items.length === 0}>
              Clear
            </button>
          </div>

          {items.length === 0 ? (
            <div style={{ padding: "18px 0", color: "#444" }}>Cart is empty.</div>
          ) : (
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {items.map((it) => (
                <div
                  key={it.id}
                  className="ek-cart-item"
                >
                  <div style={{ width: 96, height: 64, background: "#fafafa", borderRadius: 10, overflow: "hidden" }}>
                    <img src={it.image} alt={it.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 6 }}>{it.title}</div>
                    <div style={{ fontSize: 13, color: "#fff" }}>{formatPrice(it.price)}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" className="ek-add-btn" style={{ width: 36, padding: 8 }} onClick={() => onDec(it.id)}>
                      -
                    </button>
                    <div style={{ width: 22, textAlign: "center", fontWeight: 800 }}>{it.qty}</div>
                    <button type="button" className="ek-add-btn" style={{ width: 36, padding: 8 }} onClick={() => onInc(it.id)}>
                      +
                    </button>
                    <button type="button" className="ek-login-btn" onClick={() => onRemove(it.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, fontWeight: 900, fontSize: 16 }}>
                Total: {formatPrice(total)}
              </div>
            </div>
          )}

          {/* Previous orders are now available on the dedicated /orders page */}
        </div>

        <aside
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 14,
            padding: 14,
            background: "linear-gradient(145deg, #0b1020 0%, #171234 45%, #240b36 100%)",
            color: "#fff",
            alignSelf: "start",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Order Summary</div>
          <div style={{ display: "grid", gap: 8, marginBottom: 12, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal ({totalItems} items)</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Shipping</span>
              <strong>{formatPrice(shipping)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tax (5%)</span>
              <strong>{formatPrice(tax.toFixed(2))}</strong>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: 4, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800 }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: 16 }}>{formatPrice(grandTotal.toFixed(2))}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/payment")}
            disabled={!items.length}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 10,
              padding: "10px 12px",
              fontWeight: 800,
              cursor: items.length ? "pointer" : "not-allowed",
              background: "linear-gradient(45deg, #f97316, #ec4899, #8b5cf6)",
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Proceed To Payment
          </button>

          <div style={{ fontSize: 12, opacity: 0.8 }}>
            Checkout & payment are available on the Payment page.
          </div>
        </aside>
      </div>
    </div>
  );
}

function PaymentPage({ items, onClear, currentUser }) {
  const navigate = useNavigate();
  const [busyPay, setBusyPay] = useState(false);
  const [payMsg, setPayMsg] = useState("");
  const [payErr, setPayErr] = useState("");
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi"); // "upi" | "cod"

  const total = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0);
  const totalItems = items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
  const tax = total * 0.05;
  const shipping = total > 0 ? 0 : 0;
  const grandTotal = total + tax + shipping;
  const orderAmount = total.toFixed(2);

  const [address, setAddress] = useState(() => ({
    fullName: `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim(),
    phoneNo: currentUser?.phoneNo || "",
    addressLine: currentUser?.address || "",
    city: currentUser?.city || "",
    zipcode: currentUser?.zipcode || "",
  }));

  const upiId = "deepi022005@okicici";
  const upiUri = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("Shopynex Store")}&am=${encodeURIComponent(
        orderAmount
      )}&cu=INR&tn=${encodeURIComponent("Shopynex Order Payment")}`
    : "";
  const qrUrl = upiUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}`
    : "";

  async function handlePayAndSave(method = "upi") {
    if (!currentUser?.email) {
      setPayErr("Please login first");
      return;
    }
    if (!items.length) {
      setPayErr("Cart is empty");
      return;
    }
    setBusyPay(true);
    setPayErr("");
    setPayMsg("");
    setPaymentSaved(false);

    try {
      const response = await createPurchaseOrder({
        userEmail: currentUser.email,
        userName: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim(),
        items,
        shippingAddress: address,
        paymentMethod: method,
      });

      setPayMsg(`${response.message} (Transaction: ${response?.order?.transactionId || "-"})`);
      setPaymentSaved(true);
      onClear();
      // Let cart page refresh its order history.
      setTimeout(() => navigate("/orders"), 500);
    } catch (e) {
      setPayErr(e?.message || "Payment failed");
    } finally {
      setBusyPay(false);
    }
  }

  return (
    <div className="ek-cart-page">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>Payment</div>
        <button type="button" className="ek-login-btn" onClick={() => navigate("/cart")} style={{ background: "transparent" }}>
          Back to Cart
        </button>
      </div>

      <div className="ek-cart-grid" style={{ marginTop: 16 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>Delivery Address</div>
          <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
            <input
              className="ek-search"
              placeholder="Full Name"
              value={address.fullName}
              onChange={(e) => setAddress((p) => ({ ...p, fullName: e.target.value }))}
            />
            <input
              className="ek-search"
              placeholder="Phone Number"
              value={address.phoneNo}
              onChange={(e) => setAddress((p) => ({ ...p, phoneNo: e.target.value }))}
            />
            <input
              className="ek-search"
              placeholder="Address"
              value={address.addressLine}
              onChange={(e) => setAddress((p) => ({ ...p, addressLine: e.target.value }))}
            />
            <div className="ek-cart-2col">
              <input
                className="ek-search"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
              />
              <input
                className="ek-search"
                placeholder="Pincode"
                value={address.zipcode}
                onChange={(e) => setAddress((p) => ({ ...p, zipcode: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Payment Method</div>
          <div style={{ display: "grid", gap: 8, marginBottom: 14, fontSize: 13, opacity: 0.95 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} />
              <span>UPI</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
              <span>Cash on Delivery</span>
            </label>
          </div>

          <div style={{ fontSize: 14, marginBottom: 10 }}>
            Payable: <strong>{formatPrice(orderAmount)}</strong>
          </div>

          {paymentMethod === "upi" ? (
            <>
              <div
                style={{
                  width: "100%",
                  minHeight: 240,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,64,175,0.75))",
                  border: "1px dashed rgba(148, 163, 184, 0.9)",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              >
                {qrUrl ? (
                  <img src={qrUrl} alt="UPI QR code" style={{ width: "100%", maxWidth: 240, display: "block" }} />
                ) : (
                  <div style={{ fontSize: 13, opacity: 0.75, textAlign: "center", padding: 10 }}>Add UPI ID to generate payment QR</div>
                )}
              </div>

              {upiUri ? (
                <a
                  href={upiUri}
                  style={{
                    marginTop: 12,
                    width: "100%",
                    display: "inline-block",
                    textAlign: "center",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontWeight: 800,
                    background: "linear-gradient(45deg, #22c55e, #06b6d4)",
                    color: "#fff",
                    textDecoration: "none",
                  }}
                >
                  Open UPI App (Mobile)
                </a>
              ) : null}
            </>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.4 }}>Pay when your order is delivered. (Cash on Delivery)</div>
          )}

          {!paymentSaved ? (
            <button
              type="button"
              onClick={() => handlePayAndSave(paymentMethod)}
              disabled={
                busyPay ||
                !items.length ||
                !address.fullName ||
                !address.phoneNo ||
                !address.addressLine ||
                (paymentMethod === "upi" && !upiUri)
              }
              style={{
                marginTop: 14,
                width: "100%",
                border: "none",
                borderRadius: 10,
                padding: "10px 12px",
                fontWeight: 800,
                cursor: busyPay ? "not-allowed" : "pointer",
                background:
                  paymentMethod === "cod"
                    ? busyPay
                      ? "rgba(255,255,255,0.25)"
                      : "linear-gradient(45deg, #f97316, #ec4899)"
                    : busyPay
                      ? "rgba(255,255,255,0.25)"
                      : "#16a34a",
                color: "#fff",
              }}
            >
              {busyPay ? "Placing..." : paymentMethod === "cod" ? "Place Order (Cash on Delivery)" : "Payment Success - Save Order"}
            </button>
          ) : null}

          {paymentSaved ? (
            <div
              style={{
                marginTop: 10,
                borderRadius: 10,
                padding: "10px 12px",
                background: "rgba(34,197,94,0.18)",
                border: "1px solid rgba(74,222,128,0.5)",
                color: "#bbf7d0",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>✓</span>
              <span>Order placed successfully.</span>
            </div>
          ) : null}

          {payMsg ? <div style={{ marginTop: 10, color: "#4ade80", fontSize: 12 }}>{payMsg}</div> : null}
          {payErr ? <div style={{ marginTop: 10, color: "#ff6b6b", fontSize: 12 }}>{payErr}</div> : null}
        </div>

        <aside
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 14,
            padding: 14,
            background: "linear-gradient(145deg, #0b1020 0%, #171234 45%, #240b36 100%)",
            color: "#fff",
            alignSelf: "start",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Order Summary</div>
          <div style={{ display: "grid", gap: 8, marginBottom: 12, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal ({totalItems} items)</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Shipping</span>
              <strong>{formatPrice(shipping)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tax (5%)</span>
              <strong>{formatPrice(tax.toFixed(2))}</strong>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: 4, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800 }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: 16 }}>{formatPrice(grandTotal.toFixed(2))}</span>
            </div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Add to cart is on the Products page. Order is placed here.</div>
        </aside>
      </div>
    </div>
  );
}

function OrdersPage({ currentUser }) {
  const navigate = useNavigate();
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [openOrderId, setOpenOrderId] = useState("");
  const [cancelInfoOrderId, setCancelInfoOrderId] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadOrders() {
      if (!currentUser?.email) {
        setOrderHistory([]);
        return;
      }
      setLoadingOrders(true);
      try {
        const orders = await fetchOrdersByUser(currentUser.email);
        if (mounted) setOrderHistory(orders);
      } catch (_e) {
        if (mounted) setOrderHistory([]);
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    }
    loadOrders();
    return () => {
      mounted = false;
    };
  }, [currentUser?.email]);

  return (
    <div className="ek-cart-page">
      <div className="ek-cart-grid">
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>My Orders</div>
            <button
              type="button"
              className="ek-login-btn"
              onClick={() => navigate("/cart")}
              style={{ background: "transparent" }}
            >
              Back to Cart
            </button>
          </div>

          <div id="my-orders" style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Previous Orders</div>
            {loadingOrders ? (
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Loading previous orders...</div>
            ) : orderHistory.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>No previous orders found.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {orderHistory.slice(0, 10).map((order) => {
                  const orderId = order._id || order.transactionId;
                  const isDetailsOpen = openOrderId === orderId;
                  const isCancelInfoOpen = cancelInfoOrderId === orderId;
                  return (
                    <div
                      key={orderId}
                      className="ek-order-card"
                      style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 10,
                        padding: 10,
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
                        <strong>{order.transactionId || "Transaction"}</strong>
                        <span>{formatPrice(order.amount || 0)}</span>
                      </div>

                      <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
                        Items: {Array.isArray(order.items) ? order.items.length : 0} | Status: {order.paymentStatus || "paid"}
                      </div>

                      <div className="ek-order-actions" style={{ marginTop: 10, display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          className="ek-login-btn"
                          onClick={() => setOpenOrderId((prev) => (prev === orderId ? "" : orderId))}
                        >
                          {isDetailsOpen ? "Hide Details" : "Order Details"}
                        </button>
                        <button
                          type="button"
                          className="ek-login-btn"
                          onClick={() => setCancelInfoOrderId((prev) => (prev === orderId ? "" : orderId))}
                        >
                          {isCancelInfoOpen ? "Hide Cancel Info" : "Cancel Details"}
                        </button>
                      </div>

                      {isDetailsOpen ? (
                        <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.5, opacity: 0.95 }}>
                          <div>Customer: {order.userName || currentUser?.firstName || "User"}</div>
                          <div>
                            Address: {order?.shippingAddress?.addressLine || "-"}, {order?.shippingAddress?.city || "-"} -{" "}
                            {order?.shippingAddress?.zipcode || "-"}
                          </div>
                          <div>
                            Payment method: {(order.paymentStatus || "paid").toLowerCase() === "cod" ? "Cash on Delivery" : "UPI"} |{" "}
                            Payment status: {order.paymentStatus || "paid"}
                          </div>
                        </div>
                      ) : null}

                      {isCancelInfoOpen ? (
                        <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.5, opacity: 0.95 }}>
                          <div>Cancellation is only allowed if the product is delivered in damaged condition.</div>
                          <div>
                            If your item is damaged, contact support with Transaction ID: {order.transactionId || "-"} to raise a cancellation request.
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 14,
            padding: 14,
            background: "linear-gradient(145deg, #0b1020 0%, #171234 45%, #240b36 100%)",
            color: "#fff",
            alignSelf: "start",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Support</div>
          <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
            Use “Cancel Details” for damage-related cancellation requests.
          </div>
        </aside>
      </div>
    </div>
  );
}

function RegisterPage({ onAuthed }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setBusy(false);
      return;
    }

    try {
      const nameParts = formData.name.trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "User";

      const data = await registerUser({
        firstName,
        lastName,
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem("ekart_token", data.token);
      localStorage.setItem("ekart_user", JSON.stringify(data.user || {}));
      onAuthed(data.user || true);
      navigate("/products");
    } catch (e) {
      setError(e?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div 
      style={{ 
        maxWidth: 420, 
        margin: "36px auto", 
        padding: 24,
        background: "rgba(15, 23, 48, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "18px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        transition: "all 0.3s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
      }}
    >
      <div style={{ 
        fontWeight: 800, 
        fontSize: 24, 
        marginBottom: 20,
        textAlign: "center",
        background: "linear-gradient(45deg, #ff6aa2, #a855f7)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text"
      }}>
        Create Account
      </div>
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <div style={{ position: "relative" }}>
          <input
            className="ek-search"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            type="text"
            required
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#fff",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              transition: "all 0.3s ease",
              outline: "none"
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "#ff6aa2";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 106, 162, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
        <div style={{ position: "relative" }}>
          <input
            className="ek-search"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            type="email"
            required
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#fff",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              transition: "all 0.3s ease",
              outline: "none"
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "#ff6aa2";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 106, 162, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
        <div style={{ position: "relative" }}>
          <input
            className="ek-search"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            type="password"
            required
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#fff",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              transition: "all 0.3s ease",
              outline: "none"
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "#ff6aa2";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 106, 162, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
        <div style={{ position: "relative" }}>
          <input
            className="ek-search"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            type="password"
            required
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#fff",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              transition: "all 0.3s ease",
              outline: "none"
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "#ff6aa2";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 106, 162, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
        {error ? (
          <div style={{ 
            color: "#ff6b6b", 
            fontSize: 13, 
            padding: "8px 12px",
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid rgba(255, 107, 107, 0.2)",
            borderRadius: "8px"
          }}>
            {error}
          </div>
        ) : null}
        <button 
          className="ek-login-btn" 
          type="submit" 
          disabled={busy} 
          style={{ 
            justifySelf: "stretch",
            background: busy ? "rgba(255, 255, 255, 0.3)" : "linear-gradient(45deg, #ff6aa2, #a855f7)",
            border: "none",
            padding: "14px 24px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "700",
            color: "#fff",
            cursor: busy ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(255, 106, 162, 0.3)"
          }}
          onMouseEnter={(e) => {
            if (!busy) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 106, 162, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!busy) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 106, 162, 0.3)";
            }
          }}
        >
          {busy ? "Creating Account..." : "Register"}
        </button>
      </form>
      <div style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
        <button 
          type="button" 
          style={{ 
            background: "transparent", 
            border: "none", 
            color: "#ff6aa2", 
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.target.style.textDecoration = "none"}
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submitEmail(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    
    try {
      await forgotPassword(email);
      setStep(2);
      setSuccess("OTP sent to your email.");
    } catch (e) {
      setError(e?.message || "Password reset failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await verifyResetOtp(email, otp);
      setStep(3);
      setSuccess("OTP verified. Set your new password.");
    } catch (e) {
      setError(e?.message || "OTP verification failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitNewPassword(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setBusy(false);
      return;
    }

    try {
      await resetPassword(email, otp, newPassword);
      setSuccess("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (e) {
      setError(e?.message || "Password reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div 
      style={{ 
        maxWidth: 420, 
        margin: "36px auto", 
        padding: 24,
        background: "rgba(15, 23, 48, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "18px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        transition: "all 0.3s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
      }}
    >
      <div style={{ 
        fontWeight: 800, 
        fontSize: 24, 
        marginBottom: 20,
        textAlign: "center",
        background: "linear-gradient(45deg, #ff6aa2, #a855f7)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text"
      }}>
        Reset Password
      </div>
      <form
        onSubmit={step === 1 ? submitEmail : step === 2 ? submitOtp : submitNewPassword}
        style={{ display: "grid", gap: 16 }}
      >
        <div style={{ position: "relative" }}>
          <input
            className="ek-search"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#d478be",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              transition: "all 0.3s ease",
              outline: "none"
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "#ff6aa2";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 106, 162, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
        {step >= 2 ? (
          <div style={{ position: "relative" }}>
            <input
              className="ek-search"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              required
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#d478be",
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                transition: "all 0.3s ease",
                outline: "none"
              }}
            />
          </div>
        ) : null}
        {step === 3 ? (
          <>
            <div style={{ position: "relative" }}>
              <input
                className="ek-search"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                required
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#d478be",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <input
                className="ek-search"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                required
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#d478be",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
              />
            </div>
          </>
        ) : null}
        {error ? (
          <div style={{ 
            color: "#ff6b6b", 
            fontSize: 13, 
            padding: "8px 12px",
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid rgba(255, 107, 107, 0.2)",
            borderRadius: "8px"
          }}>
            {error}
          </div>
        ) : null}
        {success ? (
          <div style={{ 
            color: "#4ade80", 
            fontSize: 13, 
            padding: "8px 12px",
            background: "rgba(74, 222, 128, 0.1)",
            border: "1px solid rgba(74, 222, 128, 0.2)",
            borderRadius: "8px"
          }}>
            {success}
          </div>
        ) : null}
        <button 
          className="ek-login-btn" 
          type="submit" 
          disabled={busy} 
          style={{ 
            justifySelf: "stretch",
            background: busy ? "rgba(255, 255, 255, 0.3)" : "linear-gradient(45deg, #ff6aa2, #a855f7)",
            border: "none",
            padding: "14px 24px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "700",
            color: "#fff",
            cursor: busy ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(255, 106, 162, 0.3)"
          }}
          onMouseEnter={(e) => {
            if (!busy) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 106, 162, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!busy) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 106, 162, 0.3)";
            }
          }}
        >
          {busy
            ? "Please wait..."
            : step === 1
              ? "Send OTP"
              : step === 2
                ? "Verify OTP"
                : "Reset Password"}
        </button>
      </form>
      <div style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
        <button 
          type="button" 
          style={{ 
            background: "transparent", 
            border: "none", 
            color: "#ff6aa2", 
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.target.style.textDecoration = "none"}
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

function LoginPage({ onAuthed }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("ekart_token", data.token);
      localStorage.setItem("ekart_user", JSON.stringify(data.user || {}));
      onAuthed(data.user || true);
      navigate("/products");
    } catch (e2) {
      setError(e2?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "36px auto",
        padding: 26,
        background: "rgba(15, 23, 48, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "20px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
        transition: "all 0.25s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.45)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.35)";
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: 24,
          textAlign: "center",
          marginBottom: 6,
          background: "linear-gradient(45deg, #ff6aa2, #a855f7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}
      >
        Welcome Back
      </div>
      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 18 }}>
        Sign in to continue shopping on Shopynex
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <input
            className="ek-search"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#fff",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              transition: "all 0.3s ease",
              outline: "none"
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "#ff6aa2";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 106, 162, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
        <div style={{ position: "relative" }}>
          <input
            className="ek-search"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            required
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#fff",
              padding: "12px 84px 12px 16px",
              borderRadius: "12px",
              fontSize: "14px",
              transition: "all 0.3s ease",
              outline: "none"
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "#ff6aa2";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 106, 162, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              color: "#ff6aa2",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700
            }}
          >
            {showPassword ? "HIDE" : "SHOW"}
          </button>
        </div>
        {password && password.length < 6 ? (
          <div style={{ color: "rgba(255, 214, 102, 0.95)", fontSize: 12, marginTop: -4 }}>
            Use at least 6 characters
          </div>
        ) : null}
        {error ? (
          <div style={{ 
            color: "#ff6b6b", 
            fontSize: 13, 
            padding: "8px 12px",
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid rgba(255, 107, 107, 0.2)",
            borderRadius: "8px"
          }}>
            {error}
          </div>
        ) : null}
        <button 
          className="ek-login-btn" 
          type="submit" 
          disabled={busy || !email || !password}
          style={{ 
            justifySelf: "stretch",
            background: busy ? "rgba(255, 255, 255, 0.3)" : "linear-gradient(45deg, #ff6aa2, #a855f7)",
            border: "none",
            padding: "14px 24px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "700",
            color: "#fff",
            cursor: busy ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(255, 106, 162, 0.3)"
          }}
          onMouseEnter={(e) => {
            if (!busy) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 106, 162, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!busy) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 106, 162, 0.3)";
            }
          }}
        >
          {busy ? "Signing in..." : "Login"}
        </button>
      </form>
      <div style={{ marginTop: 16, textAlign: "center", fontSize: 14 }}>
        <button 
          type="button" 
          style={{ 
            background: "transparent", 
            border: "none", 
            color: "#ff6aa2", 
            cursor: "pointer", 
            marginRight: 16,
            fontSize: 13,
            fontWeight: 600
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.target.style.textDecoration = "none"}
          onClick={() => navigate("/register")}
        >
          Register
        </button>
        <button 
          type="button" 
          style={{ 
            background: "transparent", 
            border: "none", 
            color: "#ff6aa2", 
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.target.style.textDecoration = "none"}
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
}

function ProfilePage({ user, onSaveProfile }) {
  const [form, setForm] = useState(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNo: user?.phoneNo || "",
    address: user?.address || "",
    city: user?.city || "",
    zipcode: user?.zipcode || "",
    profilePic: user?.profilePic || "",
  }));
  const [saved, setSaved] = useState("");

  const fullName = `${form.firstName || ""} ${form.lastName || ""}`.trim() || "User";

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((p) => ({ ...p, profilePic: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  }

  function saveProfile() {
    const updated = { ...user, ...form };
    localStorage.setItem("ekart_user", JSON.stringify(updated));
    onSaveProfile?.(updated);
    setSaved("Profile updated successfully ✅");
  }

  return (
    <div className="ek-profile-page">
      <div
        style={{
          borderRadius: 22,
          padding: 24,
          background:
            "radial-gradient(circle at 0% 0%, rgba(236,72,153,0.24), transparent 55%), " +
            "radial-gradient(circle at 100% 0%, rgba(59,130,246,0.24), transparent 55%), " +
            "radial-gradient(circle at 0% 100%, rgba(45,212,191,0.20), transparent 55%), " +
            "rgba(10,16,36,0.97)",
          color: "#fff",
          boxShadow: "0 22px 60px rgba(15,23,42,0.9)",
          border: "1px solid rgba(148,163,184,0.28)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 1,
            borderRadius: 20,
            border: "1px solid rgba(148,163,184,0.22)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 14 }}>Edit Profile</div>
        <div className="ek-profile-grid">
          <div>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid rgba(248, 250, 252, 0.95)",
                  marginBottom: 10,
                  boxShadow: "0 0 0 4px rgba(129, 140, 248, 0.35)",
                  background: "radial-gradient(circle at 0% 0%, #f97316, #ec4899, #6366f1)",
                }}
              >
              {form.profilePic ? (
                <img src={form.profilePic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 800,
                      fontSize: 32,
                      color: "#f9fafb",
                    }}
                  >
                    {fullName.slice(0, 1).toUpperCase()}
                  </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} />
          </div>

            <div style={{ display: "grid", gap: 10 }}>
            <div className="ek-profile-2col">
              <input className="ek-search" placeholder="First name" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
              <input className="ek-search" placeholder="Last name" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
            </div>
            <input className="ek-search" placeholder="Email" value={form.email} disabled />
            <input className="ek-search" placeholder="Phone" value={form.phoneNo} onChange={(e) => setForm((p) => ({ ...p, phoneNo: e.target.value }))} />
            <input className="ek-search" placeholder="Address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            <div className="ek-profile-2col">
              <input className="ek-search" placeholder="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
              <input className="ek-search" placeholder="Zipcode" value={form.zipcode} onChange={(e) => setForm((p) => ({ ...p, zipcode: e.target.value }))} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                <strong>Verified:</strong> {user?.isVerified ? "Yes" : "No"}
              </div>
              <button
                type="button"
                className="ek-login-btn"
                onClick={saveProfile}
                style={{
                  background: "linear-gradient(45deg, #22c55e, #0ea5e9)",
                  border: "none",
                  paddingInline: 18,
                  fontWeight: 800,
                }}
              >
                Save Profile
              </button>
            </div>
            {saved ? <div style={{ color: "#4ade80", fontSize: 13 }}>{saved}</div> : null}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function App() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem("ekart_cart");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const cartCount = useMemo(() => cartItems.reduce((sum, it) => sum + Number(it.qty || 0), 0), [cartItems]);

  const [isAuthed, setIsAuthed] = useState(Boolean(localStorage.getItem("ekart_token")));
  const [authedUser, setAuthedUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ekart_user") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("ekart_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(product) {
    if (!isAuthed) {
      alert("Please login first to add products to cart");
      return;
    }
    setCartItems((prev) => {
      const idx = prev.findIndex((x) => x.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Number(next[idx].qty || 0) + 1 };
        return next;
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          qty: 1,
        },
      ];
    });
  }

  function inc(id) {
    setCartItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: Number(it.qty || 0) + 1 } : it)));
  }

  function dec(id) {
    setCartItems((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, qty: Math.max(1, Number(it.qty || 0) - 1) } : it))
        .filter(Boolean),
    );
  }

  function remove(id) {
    setCartItems((prev) => prev.filter((it) => it.id !== id));
  }

  function clear() {
    setCartItems([]);
  }

  function logout() {
    localStorage.removeItem("ekart_token");
    localStorage.removeItem("ekart_user");
    setIsAuthed(false);
    setAuthedUser({});
  }

  function handleAuthSuccess(user) {
    setIsAuthed(true);
    setAuthedUser(user || {});
  }

  function handleProfileSave(user) {
    setAuthedUser(user || {});
  }

  return (
    <div>
      <Header
        cartCount={cartCount}
        isAuthed={isAuthed}
        onLogout={logout}
        profileName={`${authedUser?.firstName || ""} ${authedUser?.lastName || ""}`.trim()}
        profilePhoto={authedUser?.profilePic || ""}
      />
      <Routes>
        <Route path="/" element={<HomePage onAddToCart={addToCart} />} />
        <Route
          path="/products"
          element={
            <RequireAuth isAuthed={isAuthed}>
              <ProductsPage onAddToCart={addToCart} />
            </RequireAuth>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireAuth isAuthed={isAuthed}>
              <CartPage
                items={cartItems}
                onInc={inc}
                onDec={dec}
                onRemove={remove}
                onClear={clear}
                currentUser={authedUser}
              />
            </RequireAuth>
          }
        />
        <Route
          path="/payment"
          element={
            <RequireAuth isAuthed={isAuthed}>
              <PaymentPage items={cartItems} onClear={clear} currentUser={authedUser} />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth isAuthed={isAuthed}>
              <OrdersPage currentUser={authedUser} />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginPage onAuthed={handleAuthSuccess} />} />
        <Route path="/register" element={<RegisterPage onAuthed={handleAuthSuccess} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/profile"
          element={
            <RequireAuth isAuthed={isAuthed}>
              <ProfilePage user={authedUser} onSaveProfile={handleProfileSave} />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
}

