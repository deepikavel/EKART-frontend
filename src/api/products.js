const CATEGORY_MAP = [
  { match: /smartphones|mobile|phone/i, to: "MOBILE" },
  { match: /laptops|laptop/i, to: "LAPTOP" },
  { match: /headphones|earbuds|audio/i, to: "HEADPHONE" },
  { match: /tv|television/i, to: "TV" },
];

const DEFAULT_API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");

function apiUrl(path) {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL}${path}`;
}

function withNetworkHint(error, fallbackMessage) {
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("failed to fetch")) {
    return new Error("Cannot reach backend server. Start backend on http://localhost:8000");
  }
  return new Error(error?.message || fallbackMessage);
}

function mapCategory(raw) {
  const val = String(raw || "").trim();
  for (const rule of CATEGORY_MAP) {
    if (rule.match.test(val)) return rule.to;
  }
  if (!val) return "OTHER";
  return val.replace(/[-_]/g, " ").toUpperCase();
}

// Authentication API functions
export async function loginUser(email, password) {
  try {
    const response = await fetch(apiUrl("/api/v1/user/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "Login failed");
    }
    return data;
  } catch (error) {
    throw withNetworkHint(error, "Login failed");
  }
}

export async function registerUser(userData) {
  try {
    const response = await fetch(apiUrl("/api/v1/user/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      throw new Error("Registration failed: Invalid response from server");
    }

    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "Registration failed");
    }

    return data;
  } catch (error) {
    throw withNetworkHint(error, "Registration failed");
  }
}

export async function forgotPassword(email) {
  try {
    const response = await fetch(apiUrl("/api/v1/user/forgot-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "Password reset failed");
    }
    return data;
  } catch (error) {
    throw withNetworkHint(error, "Password reset failed");
  }
}

export async function verifyResetOtp(email, otp) {
  try {
    const response = await fetch(apiUrl("/api/v1/user/verify-reset-otp"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });
    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "OTP verification failed");
    }
    return data;
  } catch (error) {
    throw withNetworkHint(error, "OTP verification failed");
  }
}

export async function resetPassword(email, otp, newPassword) {
  try {
    const response = await fetch(apiUrl("/api/v1/user/reset-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "Password reset failed");
    }
    return data;
  } catch (error) {
    throw withNetworkHint(error, "Password reset failed");
  }
}

export async function createPurchaseOrder({ userEmail, userName, items, shippingAddress, paymentMethod }) {
  try {
    const token = localStorage.getItem("ekart_token");
    const response = await fetch(apiUrl("/api/v1/order/create"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userEmail, userName, items, shippingAddress, paymentMethod }),
    });
    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "Payment failed");
    }
    return data;
  } catch (error) {
    throw withNetworkHint(error, "Payment failed");
  }
}

export async function fetchOrdersByUser(email) {
  if (!email) return [];
  try {
    const token = localStorage.getItem("ekart_token");
    const response = await fetch(apiUrl(`/api/v1/order/user-orders?email=${encodeURIComponent(email)}`), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "Failed to load previous orders");
    }
    return Array.isArray(data.orders) ? data.orders : [];
  } catch (error) {
    throw withNetworkHint(error, "Failed to load previous orders");
  }
}

export async function fetchProductsOnline() {
  // Public demo API (no key) to load real products+images.
  // If you later want "Google Sheets" / "Google Drive" as source, we can swap this function.
  const res = await fetch("https://dummyjson.com/products?limit=100");
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  const data = await res.json();

  const list = Array.isArray(data?.products) ? data.products : [];
  return list.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price ?? 0),
    category: mapCategory(p.category),
    brand: String(p.brand || "OTHER").toUpperCase(),
    image: p.thumbnail || (Array.isArray(p.images) ? p.images[0] : ""),
  }));
}

