const express = require('express');
const router = express.Router();
const Vehicle = require('../models/vehicle');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Admin check middleware
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) return next();
    res.status(403).send('Forbidden: Admins only');
}

// Public: List all vehicles
router.get('/vehicles', async (req, res) => {
    const vehicles = await Vehicle.find();
    res.render('vehicles/list', { title: 'Vehicles', vehicles, user: req.session.user });
});

// Admin: List all vehicles
router.get('/admin/vehicles', isAdmin, async (req, res) => {
    const vehicles = await Vehicle.find();
    res.render('vehicles/admin-list', { title: 'Manage Vehicles', vehicles, user: req.session.user });
});

// Admin: New vehicle form
router.get('/admin/vehicles/new', isAdmin, (req, res) => {
    res.render('vehicles/new', { title: 'Add Vehicle', user: req.session.user, error: null });
});

// Admin: Create vehicle
router.post('/admin/vehicles', isAdmin, upload.single('image'), async (req, res) => {
    const { name, brand, price, type } = req.body;
    if (!name || !brand || !price || !type || !req.file) {
        return res.render('vehicles/new', { title: 'Add Vehicle', user: req.session.user, error: 'All fields are required.' });
    }
    try {
        await Vehicle.create({
            name,
            brand,
            price,
            type,
            image: '/uploads/' + req.file.filename
        });
        res.redirect('/admin/vehicles');
    } catch (err) {
        res.render('vehicles/new', { title: 'Add Vehicle', user: req.session.user, error: 'Error creating vehicle.' });
    }
});

// Admin: Edit vehicle form
router.get('/admin/vehicles/:id/edit', isAdmin, async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.redirect('/admin/vehicles');
    res.render('vehicles/edit', { title: 'Edit Vehicle', vehicle, user: req.session.user, error: null });
});

// Admin: Update vehicle
router.post('/admin/vehicles/:id', isAdmin, upload.single('image'), async (req, res) => {
    const { name, brand, price, type } = req.body;
    const update = { name, brand, price, type };
    if (req.file) update.image = '/uploads/' + req.file.filename;
    try {
        await Vehicle.findByIdAndUpdate(req.params.id, update);
        res.redirect('/admin/vehicles');
    } catch (err) {
        const vehicle = await Vehicle.findById(req.params.id);
        res.render('vehicles/edit', { title: 'Edit Vehicle', vehicle, user: req.session.user, error: 'Error updating vehicle.' });
    }
});

// Admin: Delete vehicle
router.post('/admin/vehicles/:id/delete', isAdmin, async (req, res) => {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.redirect('/admin/vehicles');
});

module.exports = router; 