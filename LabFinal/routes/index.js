const express = require('express');
const router = express.Router();
const Order = require('../models/order');

// Sample product data
const productList = [
    { id: 1, name: 'Product 1', price: 29.99, category: 'Category A' },
    { id: 2, name: 'Product 2', price: 49.99, category: 'Category B' },
    { id: 3, name: 'Product 3', price: 19.99, category: 'Category C' },
    { id: 4, name: 'Product 4', price: 99.99, category: 'Category D' }
];

function getCart(req) {
    if (!req.session.cart) req.session.cart = [];
    return req.session.cart;
}

router.get('/', (req, res) => {
    res.render('index', { title: 'Home', products: productList, user: req.session.user });
});

router.get('/products', (req, res) => {
    res.render('products', { title: 'Products', products: productList, user: req.session.user });
});

router.get('/about', (req, res) => {
    res.render('about', { title: 'About', user: req.session.user });
});

// Add to cart
router.post('/add-to-cart', (req, res) => {
    const { productId } = req.body;
    const product = productList.find(p => p.id == productId);
    if (!product) return res.redirect('/products');
    const cart = getCart(req);
    const existing = cart.find(item => item.productId == product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ productId: product.id, title: product.name, price: product.price, quantity: 1 });
    }
    res.redirect('/cart');
});

// Cart view
router.get('/cart', (req, res) => {
    const cart = getCart(req);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.render('cart', { title: 'Your Cart', cart, total, user: req.session.user, message: req.session.message });
    req.session.message = null;
});

// Update cart quantities
router.post('/update-cart', (req, res) => {
    const { quantities } = req.body;
    const cart = getCart(req);
    if (quantities) {
        cart.forEach((item, idx) => {
            const qty = parseInt(Array.isArray(quantities) ? quantities[idx] : quantities);
            if (!isNaN(qty) && qty > 0) item.quantity = qty;
        });
    }
    res.redirect('/cart');
});

// Remove from cart
router.post('/remove-from-cart', (req, res) => {
    const { productId } = req.body;
    let cart = getCart(req);
    req.session.cart = cart.filter(item => item.productId != productId);
    res.redirect('/cart');
});

// Checkout page
router.get('/checkout', (req, res) => {
    const cart = getCart(req);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (cart.length === 0) {
        req.session.message = 'Your cart is empty!';
        return res.redirect('/cart');
    }
    res.render('checkout', { title: 'Checkout', cart, total, user: req.session.user, message: null });
});

// Place order
router.post('/place-order', async (req, res) => {
    const cart = getCart(req);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const { name, phone, address } = req.body;
    if (!name || !phone || !address || cart.length === 0) {
        return res.render('checkout', { title: 'Checkout', cart, total, user: req.session.user, message: 'Please fill all details and ensure cart is not empty.' });
    }
    try {
        await Order.create({ name, phone, address, items: cart, total });
        req.session.cart = [];
        res.render('order-success', { title: 'Order Placed', user: req.session.user });
    } catch (err) {
        res.render('checkout', { title: 'Checkout', cart, total, user: req.session.user, message: 'Error placing order. Try again.' });
    }
});

module.exports = router; 