const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    name: String,
    phone: String,
    address: String,
    items: [
        {
            productId: Number,
            title: String,
            price: Number,
            quantity: Number
        }
    ],
    total: Number,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema); 