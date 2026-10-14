import { useEffect, useState, useCallback } from "react";
import "./App.css";

const API = "/api";

const CATEGORIES = ["All", "Earrings", "Necklaces", "Bangles", "Bracelets", "Rings", "Anklets", "Hair Jewellery"];

/* ── Fallback placeholder image when Unsplash image fails to load ── */
const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0e6d3'/%3E%3Ctext x='200' y='155' font-size='60' text-anchor='middle' fill='%23c9a96e'%3E✦%3C/text%3E%3Ctext x='200' y='200' font-size='14' text-anchor='middle' fill='%238b6d5e' font-family='Georgia'%3ESnehasakhi Collection%3C/text%3E%3C/svg%3E";

function App() {
  /* ── State ── */
  const [products, setProducts]         = useState([]);
  const [cart, setCart]                 = useState([]);
  const [showCart, setShowCart]         = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [message, setMessage]           = useState("");
  const [messageType, setMessageType]   = useState("info"); // "info" | "success" | "error"
  const [selectedProduct, setSelectedProduct] = useState(null); // product detail modal
  const [seeding, setSeeding]           = useState(false);

  /* Search & filter */
  const [searchQuery, setSearchQuery]       = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchInput, setSearchInput]       = useState("");

  /* Checkout form */
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "Mumbai",
    paymentMethod: "Cash on Delivery"
  });

  /* ── Helpers ── */
  const showToast = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 2800);
  };

  /* ── Fetch products ── */
  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "All") params.set("category", activeCategory);
    if (searchQuery) params.set("search", searchQuery);

    fetch(`${API}/jewellery?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        showToast("Could not connect to the backend. Please start the server.", "error");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ── Search submit (debounce on Enter / button) ── */
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  /* ── Cart ── */
  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (existing) {
        return current.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} added to cart ✓`, "success");
  };

  const changeQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) => (item._id === id ? { ...item, quantity: item.quantity + amount } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item._id !== id));
  };

  const total     = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  /* ── Order Now (adds to cart + opens checkout immediately) ── */
  const orderNow = (product) => {
    addToCart(product);
    setShowCart(false);
    setShowCheckout(true);
  };

  /* ── Place order ── */
  const placeOrder = async (e) => {
    e.preventDefault();
    if (!cart.length) return;

    try {
      const response = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: cart.map(({ _id, name, price, quantity }) => ({
            productId: _id,
            name,
            price,
            quantity
          })),
          total
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Order failed");

      showToast(`🎉 Order placed! ID: ${data.order._id.slice(-6).toUpperCase()}`, "success");
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
      setForm({ customerName: "", phone: "", address: "", city: "Mumbai", paymentMethod: "Cash on Delivery" });
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  /* ── Seed demo products ── */
  const seedProducts = async () => {
    setSeeding(true);
    try {
      const res  = await fetch(`${API}/jewellery/seed`, { method: "POST" });
      const data = await res.json();
      showToast(data.message, "success");
      fetchProducts();
    } catch {
      showToast("Seeding failed.", "error");
    } finally {
      setSeeding(false);
    }
  };

  /* ── JSX ── */
  return (
    <div className="app">
      {/* ────────── NAVBAR ────────── */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">✦</span>
          SNEHASAKHI <span>COLLECTION</span>
        </div>
        <div className="nav-actions">
          <button className="cart-button" onClick={() => setShowCart(true)}>
            <span className="cart-icon">🛍</span>
            <span>Cart</span>
            {cartCount > 0 && <b className="cart-badge">{cartCount}</b>}
          </button>
        </div>
      </nav>

      {/* ────────── HERO ────────── */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">HANDPICKED • ELEGANT • EVERYDAY</p>
          <h1>
            Jewellery that feels<br />like <i>you.</i>
          </h1>
          <p className="hero-text">
            Discover beautiful pieces from Snehasakhi Collection,
            made to add a little sparkle to every moment.
          </p>
          <a href="#collection" className="shop-now btn-gold">
            Explore Collection ↓
          </a>
        </div>
        <div className="hero-art">
          <div className="hero-ornament">✦</div>
          <div className="hero-ring ring-1"></div>
          <div className="hero-ring ring-2"></div>
          <div className="hero-ring ring-3"></div>
        </div>
      </section>

      {/* ────────── COLLECTION ────────── */}
      <section id="collection" className="collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OUR COLLECTION</p>
            <h2>Made to be noticed.</h2>
          </div>
          <div className="section-meta">
            <span className="product-count">
              {loading ? "Loading…" : `${products.length} pieces available`}
            </span>
            {!loading && products.length === 0 && (
              <button
                className="btn-outline seed-btn"
                onClick={seedProducts}
                disabled={seeding}
              >
                {seeding ? "Adding…" : "➕ Add Sample Products"}
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="toolbar">
          <form className="search-form" onSubmit={handleSearch}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search jewellery…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                className="search-clear"
                onClick={() => { setSearchInput(""); setSearchQuery(""); }}
              >
                ×
              </button>
            )}
            <button type="submit" className="search-submit btn-gold">Search</button>
          </form>

          <div className="category-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${activeCategory === cat ? "active" : ""}`}
                onClick={() => { setActiveCategory(cat); setSearchQuery(""); setSearchInput(""); }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Toast */}
        {message && (
          <div className={`toast toast-${messageType}`}>
            {message}
          </div>
        )}

        {/* Product grid */}
        {loading ? (
          <div className="loading-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img shimmer"></div>
                <div className="skeleton-body">
                  <div className="skeleton-line shimmer" style={{ width: "50%" }}></div>
                  <div className="skeleton-line shimmer" style={{ width: "80%" }}></div>
                  <div className="skeleton-line shimmer" style={{ width: "60%" }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💎</div>
            <h3>No jewellery found</h3>
            {searchQuery || activeCategory !== "All" ? (
              <p>
                No results for your search.{" "}
                <button
                  className="link-btn"
                  onClick={() => { setSearchQuery(""); setSearchInput(""); setActiveCategory("All"); }}
                >
                  Clear filters
                </button>
              </p>
            ) : (
              <p>
                Your collection is empty.{" "}
                <button className="link-btn" onClick={seedProducts} disabled={seeding}>
                  {seeding ? "Adding…" : "Add sample products"}
                </button>{" "}
                to get started.
              </p>
            )}
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={addToCart}
                onOrderNow={orderNow}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* ────────── FOOTER ────────── */}
      <footer>
        <div className="footer-brand">
          <span className="logo-icon">✦</span>
          <strong>Snehasakhi Collection</strong>
        </div>
        <span className="footer-tagline">Made with love • Jewellery for every occasion</span>
        <span className="footer-copy">© 2025 All rights reserved</span>
      </footer>

      {/* ────────── PRODUCT DETAIL MODAL ────────── */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p) => { addToCart(p); setSelectedProduct(null); }}
          onOrderNow={(p) => { setSelectedProduct(null); orderNow(p); }}
        />
      )}

      {/* ────────── CART PANEL ────────── */}
      {showCart && (
        <div className="overlay" onClick={() => setShowCart(false)}>
          <aside className="side-panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <h2>🛍 Your Cart</h2>
              <button className="close-btn" onClick={() => setShowCart(false)}>×</button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-state small">
                <div className="empty-icon">🛒</div>
                <p>Your cart is empty.</p>
                <button className="btn-gold" onClick={() => setShowCart(false)}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item._id}>
                      <div className="cart-item-img">
                        <img
                          src={item.imageUrl || FALLBACK_IMG}
                          alt={item.name}
                          onError={(e) => { e.target.src = FALLBACK_IMG; }}
                        />
                      </div>
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <small className="cart-category">{item.category}</small>
                        <small>₹{item.price} each</small>
                      </div>
                      <div className="cart-item-controls">
                        <div className="quantity">
                          <button onClick={() => changeQuantity(item._id, -1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => changeQuantity(item._id, 1)}>+</button>
                        </div>
                        <span className="cart-item-total">₹{item.price * item.quantity}</span>
                        <button className="remove-btn" onClick={() => removeFromCart(item._id)} title="Remove">🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <span>Total</span>
                  <strong>₹{total.toLocaleString("en-IN")}</strong>
                </div>
                <button
                  className="checkout-button btn-gold"
                  onClick={() => { setShowCart(false); setShowCheckout(true); }}
                >
                  Proceed to Checkout →
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      {/* ────────── CHECKOUT MODAL ────────── */}
      {showCheckout && (
        <div className="overlay center-overlay" onClick={() => setShowCheckout(false)}>
          <div className="checkout" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <h2>Place Your Order</h2>
              <button className="close-btn" onClick={() => setShowCheckout(false)}>×</button>
            </div>

            <div className="checkout-summary">
              <div className="checkout-items-preview">
                {cart.map((item) => (
                  <div key={item._id} className="checkout-item-row">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="checkout-total-row">
                <span>Order Total</span>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <form onSubmit={placeOrder} className="checkout-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  required
                  placeholder="Your full name"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  required
                  pattern="[0-9]{10}"
                  title="Enter a 10-digit phone number"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea
                  required
                  placeholder="House/Flat No., Street, Area…"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    required
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  >
                    <option>Cash on Delivery</option>
                    <option>UPI on Delivery</option>
                  </select>
                </div>
              </div>
              <button className="checkout-button btn-gold" type="submit">
                🎉 Place Order
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PRODUCT CARD COMPONENT
═══════════════════════════════════════════ */
function ProductCard({ product, onAddToCart, onOrderNow, onViewDetails }) {
  const [imgError, setImgError] = useState(false);

  const FALLBACK_IMG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0e6d3'/%3E%3Ctext x='200' y='155' font-size='60' text-anchor='middle' fill='%23c9a96e'%3E✦%3C/text%3E%3Ctext x='200' y='200' font-size='14' text-anchor='middle' fill='%238b6d5e' font-family='Georgia'%3ESnehasakhi%3C/text%3E%3C/svg%3E";

  return (
    <article className="product-card">
      <div className="product-image-wrap" onClick={() => onViewDetails(product)}>
        <img
          className="product-img"
          src={imgError || !product.imageUrl ? FALLBACK_IMG : product.imageUrl}
          alt={product.name}
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="product-img-overlay">
          <span>View Details</span>
        </div>
        <div className="product-badge">{product.category}</div>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}
        <div className="price-row">
          <strong className="product-price">₹{product.price.toLocaleString("en-IN")}</strong>
        </div>
        <div className="card-actions">
          <button
            className="btn-outline card-btn"
            onClick={() => onAddToCart(product)}
            title="Add to Cart"
          >
            🛒 Add to Cart
          </button>
          <button
            className="btn-gold card-btn"
            onClick={() => onOrderNow(product)}
            title="Order Now"
          >
            ⚡ Order Now
          </button>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════
   PRODUCT DETAIL MODAL COMPONENT
═══════════════════════════════════════════ */
function ProductModal({ product, onClose, onAddToCart, onOrderNow }) {
  const [imgError, setImgError] = useState(false);

  const FALLBACK_IMG =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0e6d3'/%3E%3Ctext x='200' y='155' font-size='60' text-anchor='middle' fill='%23c9a96e'%3E✦%3C/text%3E%3Ctext x='200' y='200' font-size='14' text-anchor='middle' fill='%238b6d5e' font-family='Georgia'%3ESnehasakhi%3C/text%3E%3C/svg%3E";

  /* Close on Escape key */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="overlay center-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn modal-close" onClick={onClose}>×</button>

        <div className="modal-grid">
          <div className="modal-img-wrap">
            <img
              className="modal-img"
              src={imgError || !product.imageUrl ? FALLBACK_IMG : product.imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
            />
          </div>

          <div className="modal-details">
            <p className="modal-category eyebrow">{product.category}</p>
            <h2 className="modal-title">{product.name}</h2>
            <p className="modal-price">₹{product.price.toLocaleString("en-IN")}</p>

            {product.description && (
              <p className="modal-description">{product.description}</p>
            )}

            <div className="modal-tags">
              <span className="tag">✓ Handcrafted</span>
              <span className="tag">✓ Quality Assured</span>
              <span className="tag">✓ Fast Delivery</span>
            </div>

            <div className="modal-actions">
              <button className="btn-outline modal-btn" onClick={() => onAddToCart(product)}>
                🛒 Add to Cart
              </button>
              <button className="btn-gold modal-btn" onClick={() => onOrderNow(product)}>
                ⚡ Order Now
              </button>
            </div>

            <p className="modal-note">
              💳 Pay on delivery • 🔁 Easy returns • 🚚 Ships within 2–4 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;