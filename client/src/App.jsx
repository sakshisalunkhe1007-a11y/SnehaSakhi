import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3002/api";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "Mumbai",
    paymentMethod: "Cash on Delivery"
  });

  useEffect(() => {
    fetch(`${API}/jewellery`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setMessage("Could not connect to the backend. Please start the server."))
      .finally(() => setLoading(false));
  }, []);

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
    setMessage(`${product.name} added to cart`);
    setTimeout(() => setMessage(""), 1800);
  };

  const changeQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity + amount } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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

      setMessage(`Order placed successfully! Order ID: ${data.order._id}`);
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
      setForm({
        customerName: "",
        phone: "",
        address: "",
        city: "Mumbai",
        paymentMethod: "Cash on Delivery"
      });
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">SNEHASAKHI <span>COLLECTION</span></div>
        <button className="cart-button" onClick={() => setShowCart(true)}>
          🛍 Cart <b>{cartCount}</b>
        </button>
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">HANDPICKED • ELEGANT • EVERYDAY</p>
          <h1>Jewellery that feels<br />like <i>you.</i></h1>
          <p className="hero-text">
            Discover beautiful pieces from Snehasakhi Collection,
            made to add a little sparkle to every moment.
          </p>
          <a href="#collection" className="shop-now">Explore Collection ↓</a>
        </div>
        <div className="hero-art">✦</div>
      </section>

      <section id="collection" className="collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OUR COLLECTION</p>
            <h2>Made to be noticed.</h2>
          </div>
          <span>{products.length} pieces available</span>
        </div>

        {message && <div className="toast">{message}</div>}

        {loading ? (
          <div className="empty">Loading collection...</div>
        ) : products.length === 0 ? (
          <div className="empty">No products found in MongoDB.</div>
        ) : (
          <div className="product-grid">
            {products.map((product, index) => (
              <article className="product-card" key={product._id}>
                <div className={`product-image image-${index % 4}`}>
                  <span>✦</span>
                </div>
                <div className="product-info">
                  <p className="category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <div className="price-row">
                    <strong>₹{product.price}</strong>
                    <button onClick={() => addToCart(product)}>Add to Cart</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>
        <strong>Snehasakhi Collection</strong>
        <span>Made with love • Jewellery for every occasion</span>
      </footer>

      {showCart && (
        <div className="overlay" onClick={() => setShowCart(false)}>
          <aside className="side-panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <h2>Your Cart</h2>
              <button onClick={() => setShowCart(false)}>×</button>
            </div>

            {cart.length === 0 ? (
              <div className="empty">Your cart is empty.</div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item._id}>
                      <div>
                        <strong>{item.name}</strong>
                        <small>₹{item.price} each</small>
                      </div>
                      <div className="quantity">
                        <button onClick={() => changeQuantity(item._id, -1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => changeQuantity(item._id, 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <span>Total</span><strong>₹{total}</strong>
                </div>
                <button className="checkout-button" onClick={() => setShowCheckout(true)}>
                  Proceed to Checkout
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      {showCheckout && (
        <div className="overlay" onClick={() => setShowCheckout(false)}>
          <div className="checkout" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <h2>Place Your Order</h2>
              <button onClick={() => setShowCheckout(false)}>×</button>
            </div>
            <p className="checkout-total">Order Total: <b>₹{total}</b></p>
            <form onSubmit={placeOrder}>
              <input
                required
                placeholder="Full Name"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
              <input
                required
                pattern="[0-9]{10}"
                title="Enter a 10-digit phone number"
                placeholder="10-digit Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <textarea
                required
                placeholder="Delivery Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <input
                required
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                <option>Cash on Delivery</option>
                <option>UPI on Delivery</option>
              </select>
              <button className="checkout-button" type="submit">Place Order</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;