const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: String, 
  price: Number,
  description: String,
  image: String
});

const cartSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  qty: { type: Number, required: true },
  // Optional user id to scope cart items to a specific user. If absent, item is a guest/global cart item.
  userId: { type: String, required: false }
});

const receiptSchema = new mongoose.Schema({
  total: Number,
  name: String,
  email: String,
  items: Array,
  timestamp: { type: Date, default: () => new Date() }
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: () => new Date() }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', cartSchema);
const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', receiptSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

let _mongoMemoryServer = null;
async function connect(uri) {
  // If a URI is provided, try to connect. If it fails, fall back to an in-memory server.
  try {
    if (uri) {
      await mongoose.connect(uri, {});
      return;
    }
    throw new Error('no uri');
  } catch (err) {
    // fallback to mongodb-memory-server
    const { MongoMemoryServer } = require('mongodb-memory-server');
    _mongoMemoryServer = await MongoMemoryServer.create();
    const memUri = _mongoMemoryServer.getUri();
    await mongoose.connect(memUri, {});
    return;
  }
}

async function disconnect() {
  try {
    await mongoose.disconnect();
  } finally {
    if (_mongoMemoryServer) {
      try { await _mongoMemoryServer.stop(); } catch (e) {}
      _mongoMemoryServer = null;
    }
  }
}

module.exports = { connect, disconnect, Product, CartItem, Receipt, User };
