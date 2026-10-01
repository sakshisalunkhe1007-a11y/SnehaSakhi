const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3002;


app.use(cors());
app.use(express.json());

const jewellerySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { collection: "jewellery" }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      customerName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      paymentMethod: { type: String, required: true }
    },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number
      }
    ],
    total: { type: Number, required: true },
    status: { type: String, default: "Order Received" }
  },
  { timestamps: true, collection: "orders" }
);

const Jewellery = mongoose.model("Jewellery", jewellerySchema);
const Order = mongoose.model("Order", orderSchema);

app.get("/", (req, res) => {
  res.send("Snehasakhi Collection backend is running successfully!");
});

app.get("/api/jewellery", async (req, res) => {
  try {
    const products = await Jewellery.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, total } = req.body;

    if (!customer || !items || !items.length || !total) {
      return res.status(400).json({ message: "Complete order details are required." });
    }

    const order = await Order.create({ customer, items, total });

    res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not place order",
      error: error.message
    });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

mongoose
  .connect("mongodb://127.0.0.1:27017/snehasakhiDB")
  .then(() => {
    console.log("MongoDB connected successfully.");
    app.listen(PORT, () => {
      console.log(`Snehasakhi backend running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });