const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Session setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost/ecommerce' })
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Product Schema
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String
});
const Product = mongoose.model('Product', productSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  userDetails: {
    name: String,
    phone: String,
    address: String
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Middleware to make session available in EJS
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.messages = req.session.messages || [];
  req.session.messages = [];
  next();
});

// Routes
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.render('products', { products });
});

app.post('/cart/add/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.session.messages.push({ type: 'error', text: 'Product not found' });
      return res.redirect('/products');
    }

    if (!req.session.cart) {
      req.session.cart = [];
    }

    const cartItem = req.session.cart.find(item => item.productId.toString() === req.params.id);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      req.session.cart.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: 1
      });
    }

    req.session.messages.push({ type: 'success', text: 'Product added to cart' });
    res.redirect('/products');
  } catch (error) {
    req.session.messages.push({ type: 'error', text: 'Error adding to cart' });
    res.redirect('/products');
  }
});

app.get('/cart', async (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('cart', { cart, total });
});

app.post('/cart/update', (req, res) => {
  const { quantities } = req.body;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter((item, index) => {
      if (quantities[index] && parseInt(quantities[index]) > 0) {
        item.quantity = parseInt(quantities[index]);
        return true;
      }
      return false;
    });
  }
  req.session.messages.push({ type: 'success', text: 'Cart updated' });
  res.redirect('/cart');
});

app.get('/checkout', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('checkout', { cart, total });
});

app.post('/checkout', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const cart = req.session.cart || [];

    if (!cart.length) {
      req.session.messages.push({ type: 'error', text: 'Cart is empty' });
      return res.redirect('/checkout');
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const order = new Order({
      userDetails: { name, phone, address },
      items: cart,
      total
    });

    await order.save();
    req.session.cart = [];
    req.session.messages.push({ type: 'success', text: 'Order placed successfully' });
    res.redirect('/products');
  } catch (error) {
    req.session.messages.push({ type: 'error', text: 'Error placing order' });
    res.redirect('/checkout');
  }
});

// Start server
app.listen(3000, () => console.log('Server running on port 3000'));