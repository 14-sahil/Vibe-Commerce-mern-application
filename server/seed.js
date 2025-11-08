const { connect, disconnect, Product, CartItem } = require('./db');

const products = [
  {
    productId: 'p1',
    name: 'Neo T-Shirt',
    price: 19.99,
    description: 'Comfort tee',
    image: 'https://picsum.photos/seed/p1/600/400'
  },
  {
    productId: 'p2',
    name: 'Vibe Hoodie',
    price: 49.99,
    description: 'Cozy hoodie',
    image: 'https://picsum.photos/seed/p2/600/400'
  },
  {
    productId: 'p3',
    name: 'Slick Jeans',
    price: 59.99,
    description: 'Slim fit',
    image: 'https://picsum.photos/seed/p3/600/400'
  },
  {
    productId: 'p4',
    name: 'Sneaker X',
    price: 89.99,
    description: 'Street style',
    image: 'https://picsum.photos/seed/p4/600/400'
  },
  {
    productId: 'p5',
    name: 'Cap Classic',
    price: 15.0,
    description: 'One size',
    image: 'https://picsum.photos/seed/p5/600/400'
  }
];

async function seed(uri) {
  await connect(uri);
  await Product.deleteMany({});
  await CartItem.deleteMany({});
  await Product.insertMany(products);
  console.log('Seeded products:', products.length);
  await disconnect();
}

if (require.main === module) {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/vibe-commerce';
  seed(uri).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { seed };
