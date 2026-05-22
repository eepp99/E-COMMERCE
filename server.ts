import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables for local development
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Endpoint to get the Paystack Public Key on the client side
  app.get("/api/config", (req, res) => {
    res.json({
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
    });
  });

  // Basic mock database for products and orders
  let products = [
    { id: "p1", name: "Minimalist T-Shirt", description: "Crafted from heavy-weight organic cotton, this classic piece offers an oversized, structural fit designed for everyday durability.", price: 4500, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800", stock: 10 },
    { id: "p2", name: "Noir Hoodie", description: "An ultra-soft fleece-lined hoodie that drapes perfectly. Features a relaxed cut, dropped shoulders, and a distinct minimalist silhouette.", price: 12000, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800", stock: 5 },
    { id: "p3", name: "Classic Watch", description: "A timeless analog timepiece built with a matte black stainless steel casing, sapphire glass, and a genuine leather strap.", price: 25000, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800", stock: 12 },
    { id: "p4", name: "Leather Tote", description: "This everyday essential tote bag is constructed from premium full-grain leather, featuring reinforced stitching and an internal pocket.", price: 18000, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800", stock: 2 }
  ];

  let orders: any[] = [];
  let users: any[] = [];

  // User Auth Routes
  app.post("/api/auth/register", (req, res) => {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    const newUser = { email, password }; // In a real app, hash password
    users.push(newUser);
    res.json({ token: email, user: { email } });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      res.json({ token: email, user: { email } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/user/orders", (req, res) => {
    const email = req.headers.authorization?.split(" ")[1];
    if (!email) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userOrders = orders.filter(o => o.email === email);
    res.json(userOrders);
  });

  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  // Verify Paystack checkout
  app.post("/api/paystack/verify", async (req, res) => {
    const { reference, items, email, amount } = req.body;
    
    if (!reference) {
      return res.status(400).json({ error: "Reference missing" });
    }

    try {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      if (!secret) {
        // If no secret key is set, mock a successful response for preview purposes
        const mockOrder = {
          id: `ord_${Date.now()}`,
          reference,
          email,
          amount,
          items,
          status: "success (mocked)",
          date: new Date().toISOString()
        };
        orders.push(mockOrder);
        return res.json({ success: true, order: mockOrder });
      }

      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secret}`
        }
      });
      
      const data = await response.json();
      if (data.status && data.data.status === "success") {
        const order = {
          id: `ord_${Date.now()}`,
          reference,
          email,
          amount,
          items,
          status: "success",
          date: new Date().toISOString()
        };
        orders.push(order);
        res.json({ success: true, order });
      } else {
        res.status(400).json({ success: false, error: "Transaction verification failed" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error during verification" });
    }
  });

  // Admin Auth Route
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";
    if (password === adminPassword) {
      res.json({ token: "admin_token_xyz" });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  // Admin middleware
  const authenticateAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader === "Bearer admin_token_xyz") {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  // Admin routes
  app.get("/api/admin/orders", authenticateAdmin, (req, res) => {
    res.json(orders);
  });
  
  app.get("/api/admin/products", authenticateAdmin, (req, res) => {
    res.json(products);
  });

  app.post("/api/admin/products", authenticateAdmin, (req, res) => {
    const newProduct = {
      id: `p${Date.now()}`,
      ...req.body
    };
    products.push(newProduct);
    res.json(newProduct);
  });

  app.put("/api/admin/products/:id", authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...req.body };
      res.json(products[index]);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
