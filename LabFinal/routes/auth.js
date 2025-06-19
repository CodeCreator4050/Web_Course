const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// In-memory user store (for demo)
const users = [];

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login', error: null, user: req.session.user });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        return res.redirect('/');
    }
    res.render('login', { title: 'Login', error: 'Invalid credentials', user: req.session.user });
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Register', error: null, user: req.session.user });
});

router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.render('register', { title: 'Register', error: 'Username already exists', user: req.session.user });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashedPassword });
    res.redirect('/auth/login');
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router; 