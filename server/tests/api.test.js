const request = require('supertest');
jest.setTimeout(20000);
const { MongoMemoryServer } = require('mongodb-memory-server');
const { connect, disconnect, Product, CartItem } = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connect(uri);
  // seed
  await Product.deleteMany({});
  await CartItem.deleteMany({});
  await Product.insertMany([
    { productId: 'p1', name: 'Neo T-Shirt', price: 19.99, description: 'Comfort tee' },
    { productId: 'p2', name: 'Vibe Hoodie', price: 49.99, description: 'Cozy hoodie' },
    { productId: 'p3', name: 'Slick Jeans', price: 59.99, description: 'Slim fit' },
    { productId: 'p4', name: 'Sneaker X', price: 89.99, description: 'Street style' },
    { productId: 'p5', name: 'Cap Classic', price: 15.0, description: 'One size' }
  ]);

  app = require('../index');
});

afterAll(async () => {
  await disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('API basics', () => {
  test('GET /api/products returns list', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
  });

  test('Cart flow: add, get, delete', async () => {
    const add = await request(app).post('/api/cart').send({ productId: 'p1', qty: 2 });
    expect(add.statusCode).toBe(200);
    const cart = await request(app).get('/api/cart');
    expect(cart.statusCode).toBe(200);
    expect(cart.body.items.length).toBeGreaterThanOrEqual(1);
    const cartId = cart.body.items[0].cartId;
    const del = await request(app).delete(`/api/cart/${cartId}`);
    expect(del.statusCode).toBe(200);
  });

  test('Cart per-user isolation', async () => {
    // create a test user directly and sign a token
    const User = require('../db').User;
    const u = await User.create({ name: 'TUser', email: 'tuser@example.com', password: 'x' });
    const token = jwt.sign({ id: u._id.toString(), email: u.email }, JWT_SECRET);

    // add an item as this user
    const add = await request(app).post('/api/cart').set('Authorization', `Bearer ${token}`).send({ productId: 'p2', qty: 1 });
    expect(add.statusCode).toBe(200);

    // unauthenticated cart should NOT include this user's item
    const globalCart = await request(app).get('/api/cart');
    expect(globalCart.statusCode).toBe(200);
    const foundInGlobal = (globalCart.body.items || []).find(i => i.productId === 'p2');
    expect(foundInGlobal).toBeUndefined();

    // authenticated cart should include it
    const userCart = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
    expect(userCart.statusCode).toBe(200);
    expect((userCart.body.items || []).length).toBeGreaterThanOrEqual(1);
    const found = (userCart.body.items || []).find(i => i.productId === 'p2');
    expect(found).toBeDefined();

    // cleanup: delete the user-scoped item
    const cartId = found.cartId;
    const del = await request(app).delete(`/api/cart/${cartId}`).set('Authorization', `Bearer ${token}`);
    expect(del.statusCode).toBe(200);
  });
});
