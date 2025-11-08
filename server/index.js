const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connect, disconnect, Product, CartItem, Receipt, User } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

const app = express();
app.use(cors());
app.use(bodyParser.json());

// GET /api/products
app.get('/api/products', async (req, res) => {
  const rows = await Product.find({}).lean();
  res.json(rows.map(r => ({ productId: r.productId, name: r.name, price: r.price, description: r.description, image: r.image || '' })));
});

// Get cart
app.get('/api/cart', async (req, res) => {
  // determine user scope from Authorization header (optional)
  const auth = req.headers.authorization || '';
  let userId = null;
  try {
    if (auth.startsWith('Bearer ')) {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET);
      userId = payload.id;
    }
  } catch (e) {
    userId = null;
  }
  // Only authenticated users may have a cart. Guests may browse products but cannot add items.
  if (!userId) return res.json({ items: [], total: 0 });

  const findQuery = { userId };
  const items = await CartItem.find(findQuery).lean();
  // attach product info
  const productIds = items.map(i => i.productId);
  const products = await Product.find({ productId: { $in: productIds } }).lean();
  const itemsWithProduct = items.map(it => {
    const p = products.find(pp => pp.productId === it.productId) || {};
    return { cartId: it._id.toString(), qty: it.qty, productId: it.productId, name: p.name || '', price: p.price || 0 };
  });
  const total = itemsWithProduct.reduce((s, it) => s + it.price * it.qty, 0);
  res.json({ items: itemsWithProduct, total });
});

// Add/update cart
app.post('/api/cart', async (req, res) => {
  const { productId, qty } = req.body;
  if (!productId || !Number.isInteger(qty) || qty < 0) return res.status(400).json({ error: 'Invalid input' });

  const product = await Product.findOne({ productId }).lean();
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Require authenticated user to add/update cart
  const auth = req.headers.authorization || '';
  let userId = null;
  try {
    if (auth.startsWith('Bearer ')) {
      const token = auth.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET);
      userId = payload.id;
    }
  } catch (e) {
    userId = null;
  }
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const queryForExisting = { productId, userId };
  const existing = await CartItem.findOne(queryForExisting);
  if (existing) {
    if (qty === 0) await CartItem.deleteOne({ _id: existing._id });
    else { existing.qty = qty; await existing.save(); }
  } else {
    if (qty > 0) await CartItem.create(userId ? { productId, qty, userId } : { productId, qty });
  }

  const findQuery = { userId };
  const items = await CartItem.find(findQuery).lean();
  const productIds = items.map(i => i.productId);
  const products = await Product.find({ productId: { $in: productIds } }).lean();
  const itemsWithProduct = items.map(it => {
    const p = products.find(pp => pp.productId === it.productId) || {};
    return { cartId: it._id.toString(), qty: it.qty, productId: it.productId, name: p.name || '', price: p.price || 0 };
  });
  const total = itemsWithProduct.reduce((s, it) => s + it.price * it.qty, 0);
  res.json({ items: itemsWithProduct, total });
});

// Delete from cart
app.delete('/api/cart/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  // require auth and only delete items belonging to the authenticated user
  const auth = req.headers.authorization || '';
  let userId = null;
  try { if (auth.startsWith('Bearer ')) { const token = auth.split(' ')[1]; const payload = jwt.verify(token, JWT_SECRET); userId = payload.id } } catch(e) { userId = null }
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  const delQuery = { _id: id, userId };
  await CartItem.deleteOne(delQuery);
  res.json({ success: true });
});

// Checkout
app.post('/api/checkout', async (req, res) => {
  const { cartItems } = req.body || {};
  if (!Array.isArray(cartItems) || cartItems.length === 0) return res.status(400).json({ error: 'Empty cart' });

  // Require authenticated user for checkout
  let authUser = null
  try {
    const auth = req.headers.authorization || ''
    if (auth.startsWith('Bearer ')) {
      const token = auth.split(' ')[1]
      const payload = jwt.verify(token, JWT_SECRET)
      authUser = await User.findById(payload.id).lean()
    }
  } catch (err) {
    authUser = null
  }
  if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

  const total = cartItems.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);

  const usedName = authUser.name || 'User'
  const usedEmail = authUser.email || ''

  // upsert user record to ensure name/email are stored
  try { await User.findByIdAndUpdate(authUser._id, { name: usedName, email: usedEmail }, { upsert: true }) } catch (e) {}

  const rec = await Receipt.create({ total, name: usedName, email: usedEmail, items: cartItems, timestamp: new Date() });

  // clear this user's cart
  await CartItem.deleteMany({ userId: authUser._id.toString() });

  res.json({ receipt: { id: rec._id.toString(), total: rec.total, name: rec.name, email: rec.email, items: rec.items, timestamp: rec.timestamp } });
});

// Orders list
app.get('/api/orders', async (req, res) => {
  const orders = await Receipt.find({}).sort({ timestamp: -1 }).lean();
  res.json(orders.map(o => ({ id: o._id.toString(), total: o.total, name: o.name, email: o.email, timestamp: o.timestamp, items: o.items })));
});

// Auth: signup
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  try {
    const hashed = await bcrypt.hash(password, 10)
    const u = await User.create({ name: name || 'User', email, password: hashed })
    const token = jwt.sign({ id: u._id.toString(), email: u.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: u._id.toString(), name: u.name, email: u.email } })
  } catch (err) {
    console.error(err && err.message)
    if (err && err.code === 11000) return res.status(409).json({ error: 'Email already exists' })
    res.status(500).json({ error: 'signup failed' })
  }
})

// Auth: login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  const u = await User.findOne({ email }).lean()
  if (!u || !u.password) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, u.password)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ id: u._id.toString(), email: u.email }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: u._id.toString(), name: u.name, email: u.email } })
})

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 4000;

// Graceful error handlers to avoid nodemon crashes and to provide clearer logs
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

if (require.main === module) {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/vibe-commerce';
  (async () => {
    try {
      await connect(uri);
      const server = app.listen(port, '0.0.0.0', () => {
        const addr = server.address();
        console.log('Server running on', addr.address + ':' + addr.port);
      });
      server.on('error', (err) => {
        console.error('Server failed to start:', err && err.stack ? err.stack : err);
        // don't exit; nodemon will keep running and report the error
      });
    } catch (err) {
      console.error('DB connect failed', err && err.stack ? err.stack : err);
    }
  })();
} else {
  module.exports = app;
}
