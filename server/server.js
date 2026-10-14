const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

/* ─────────────────── SCHEMAS ─────────────────── */

const jewellerySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    category:    { type: String, required: true },
    price:       { type: Number, required: true },
    description: { type: String, default: "" },
    imageUrl:    { type: String, default: "" }
  },
  { collection: "jewellery" }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      customerName:  { type: String, required: true },
      phone:         { type: String, required: true },
      address:       { type: String, required: true },
      city:          { type: String, required: true },
      paymentMethod: { type: String, required: true }
    },
    items: [
      {
        productId: String,
        name:      String,
        price:     Number,
        quantity:  Number
      }
    ],
    total:  { type: Number, required: true },
    status: { type: String, default: "Order Received" }
  },
  { timestamps: true, collection: "orders" }
);

const Jewellery = mongoose.model("Jewellery", jewellerySchema);
const Order     = mongoose.model("Order",     orderSchema);

/* ─────────────────── DEMO SEED DATA ─────────────────── */

const DEMO_PRODUCTS = [
  {
    name: "Antique Oxidised Chandbali Earrings",
    category: "Earrings",
    price: 349,
    description: "Classic chandbali design with intricate oxidised silver finish. Perfect for festive occasions and traditional wear.",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"
  },
  {
    name: "Gold-Plated Kundan Jhumka",
    category: "Earrings",
    price: 499,
    description: "Elegant kundan-set jhumka earrings with gold plating. Features delicate hanging bells that add a melodious charm.",
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80"
  },
  {
    name: "Layered Pearl Necklace Set",
    category: "Necklaces",
    price: 899,
    description: "Multi-layer pearl and gold bead necklace set with matching earrings. Timeless elegance for weddings and parties.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80"
  },
  {
    name: "Oxidised Silver Temple Necklace",
    category: "Necklaces",
    price: 749,
    description: "Handcrafted oxidised silver temple necklace with goddess motif. A piece of art inspired by South Indian jewellery tradition.",
    imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80"
  },
  {
    name: "Traditional Meenakari Bangles (Set of 4)",
    category: "Bangles",
    price: 599,
    description: "Vibrant meenakari enamel bangles in a set of 4. Bright floral patterns on a gold base — made for celebrations.",
    imageUrl: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80"
  },
  {
    name: "Silver Kada Bangle",
    category: "Bangles",
    price: 449,
    description: "Sturdy silver-toned kada bangle with engraved geometric patterns. Suitable for daily wear and special occasions.",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80"
  },
  {
    name: "Boho Beaded Charm Bracelet",
    category: "Bracelets",
    price: 249,
    description: "Colourful boho-style beaded bracelet with turquoise and gold charms. Stackable design for a trendy layered look.",
    imageUrl: "https://images.unsplash.com/photo-1573408301185-9519f94f00b8?w=600&q=80"
  },
  {
    name: "Gold Link Chain Bracelet",
    category: "Bracelets",
    price: 399,
    description: "Minimalist gold-plated link chain bracelet. Versatile enough to pair with traditional or modern outfits.",
    imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80"
  },
  {
    name: "Adjustable Floral Finger Ring",
    category: "Rings",
    price: 199,
    description: "Delicate adjustable ring with a blooming floral motif. One-size-fits-all design with a dainty rose gold finish.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80"
  },
  {
    name: "Kundan Statement Ring",
    category: "Rings",
    price: 299,
    description: "Bold kundan statement ring with coloured stones set in a golden base. A head-turner for weddings and festivities.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80"
  },
  {
    name: "Maang Tikka Hair Jewellery",
    category: "Hair Jewellery",
    price: 329,
    description: "Exquisite gold-plated maang tikka with pearl drops. Completes any bridal or festive look with grace.",
    imageUrl: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80"
  },
  {
    name: "Oxidised Tribal Anklet Pair",
    category: "Anklets",
    price: 279,
    description: "Handcrafted oxidised silver tribal anklets sold as a pair. Light ghungroo bells add a traditional musical touch.",
    imageUrl: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80"
  }
];

/* ─────────────────── ROUTES ─────────────────── */

app.get("/", (req, res) => {
  res.send("Snehasakhi Collection backend is running successfully!");
});

/* GET all jewellery — supports ?search= and ?category= query params */
app.get("/api/jewellery", async (req, res) => {
  try {
    const query = {};
    if (req.query.category && req.query.category !== "All") {
      query.category = req.query.category;
    }
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" };
    }
    const products = await Jewellery.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
});

/* GET single product by ID */
app.get("/api/jewellery/:id", async (req, res) => {
  try {
    const product = await Jewellery.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
});

/* POST seed demo products (only inserts missing ones — safe to call multiple times) */
app.post("/api/jewellery/seed", async (req, res) => {
  try {
    let inserted = 0;
    for (const product of DEMO_PRODUCTS) {
      const exists = await Jewellery.findOne({ name: product.name });
      if (!exists) {
        await Jewellery.create(product);
        inserted++;
      }
    }
    const total = await Jewellery.countDocuments();
    res.json({ message: `Seeded ${inserted} new products. Total in DB: ${total}` });
  } catch (error) {
    res.status(500).json({ message: "Seeding failed", error: error.message });
  }
});

/* POST place an order */
app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, total } = req.body;

    if (!customer || !items || !items.length || !total) {
      return res.status(400).json({ message: "Complete order details are required." });
    }

    const order = await Order.create({ customer, items, total });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Could not place order", error: error.message });
  }
});

/* GET all orders */
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

/* ─────────────────── STATIC FILES (Production) ─────────────────── */

/* Serve React build when running on Render / in production */
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

/* Catch-all: send React's index.html for any non-API route */
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

/* ─────────────────── DB CONNECTION ─────────────────── */

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/snehasakhiDB";

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("MongoDB connected successfully to:", MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Snehasakhi backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });