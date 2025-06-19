const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory user storage (replace with database in production)
const users = [];

// Middleware
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration
app.use(session({
    secret: 'stylehub-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.session.user || null;
    next();
});

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Please login to access this page');
    res.redirect('/login');
}

// Routes
app.get('/', (req, res) => {
    const featuredProducts = [
        { id: 1, name: 'Premium Cotton T-Shirt', category: 'Men\'s Casual', price: 29.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_LttAfEOM8sVS5XYqc5WNE7ZYbco9iJalgA&s' },
        { id: 2, name: 'Floral Summer Dress', category: 'Women\'s Fashion', price: 49.99, image: 'https://sowears.net/cdn/shop/files/www-sowears-net-dresses-floral-waltz-lacey-dress-1141178842_600x.webp?v=1740669928' },
        { id: 3, name: 'Classic Denim Jacket', category: 'Men\'s Outerwear', price: 69.99, image: 'https://imageseu.wrangler.com/is/image/EUWrangler/W4481514V_1?$KDP-XXLARGE$' },
        { id: 4, name: 'Designer Leather Handbag', category: 'Accessories', price: 89.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShNwgn1kzAKLoSojUCshIMlUnOS48wOmnmZw&s' },
        { id: 5, name: 'Performance Running Shoes', category: 'Footwear', price: 79.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXLX9yCv5tl6SmEQvQUtiZO1lex26hCJxorg&s' },
        { id: 6, name: 'Polarized Sunglasses', category: 'Accessories', price: 39.99, image: 'https://m.media-amazon.com/images/I/71jiEpKjdEL._AC_SL1500_.jpg' },
        { id: 7, name: 'Smart Fitness Watch', category: 'Electronics', price: 129.99, image: 'https://cdn.thewirecutter.com/wp-content/media/2023/11/fitness-tracker-2048px-5344.jpg' },
        { id: 8, name: 'Insulated Winter Coat', category: 'Winter Collection', price: 149.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPtFQy8jGrwjfPPmasNsW4R2o3kb-JHOAoig&s' }
    ];

    res.render('index', { 
        title: 'StyleHub - Fashion E-Commerce',
        products: featuredProducts,
        cartCount: req.session.cartCount || 0
    });
});

app.get('/products', (req, res) => {
    const allProducts = [
        { id: 1, name: 'Premium Cotton T-Shirt', category: 'Men\'s Casual', price: 29.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_LttAfEOM8sVS5XYqc5WNE7ZYbco9iJalgA&s' },
        { id: 2, name: 'Floral Summer Dress', category: 'Women\'s Fashion', price: 49.99, image: 'https://sowears.net/cdn/shop/files/www-sowears-net-dresses-floral-waltz-lacey-dress-1141178842_600x.webp?v=1740669928' },
        { id: 3, name: 'Classic Denim Jacket', category: 'Men\'s Outerwear', price: 69.99, image: 'https://imageseu.wrangler.com/is/image/EUWrangler/W4481514V_1?$KDP-XXLARGE$' },
        { id: 4, name: 'Designer Leather Handbag', category: 'Accessories', price: 89.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShNwgn1kzAKLoSojUCshIMlUnOS48wOmnmZw&s' },
        { id: 5, name: 'Performance Running Shoes', category: 'Footwear', price: 79.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXLX9yCv5tl6SmEQvQUtiZO1lex26hCJxorg&s' },
        { id: 6, name: 'Polarized Sunglasses', category: 'Accessories', price: 39.99, image: 'https://m.media-amazon.com/images/I/71jiEpKjdEL._AC_SL1500_.jpg' },
        { id: 7, name: 'Smart Fitness Watch', category: 'Electronics', price: 129.99, image: 'https://cdn.thewirecutter.com/wp-content/media/2023/11/fitness-tracker-2048px-5344.jpg' },
        { id: 8, name: 'Insulated Winter Coat', category: 'Winter Collection', price: 149.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPtFQy8jGrwjfPPmasNsW4R2o3kb-JHOAoig&s' }
    ];

    res.render('products', { 
        title: 'Products - StyleHub',
        products: allProducts,
        cartCount: req.session.cartCount || 0
    });
});

app.get('/about', (req, res) => {
    res.render('about', { 
        title: 'About Us - StyleHub'
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', { 
        title: 'Contact Us - StyleHub'
    });
});

// Authentication routes
app.get('/login', (req, res) => {
    res.render('auth/login', { 
        title: 'Login - StyleHub',
        layout: 'layouts/auth'
    });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    
    if (!user) {
        req.flash('error_msg', 'Invalid email or password');
        return res.redirect('/login');
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
        req.flash('error_msg', 'Invalid email or password');
        return res.redirect('/login');
    }
    
    // Create session
    req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email
    };
    
    req.flash('success_msg', 'You are now logged in');
    res.redirect('/');
});

app.get('/register', (req, res) => {
    res.render('auth/register', { 
        title: 'Register - StyleHub',
        layout: 'layouts/auth'
    });
});

app.post('/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    
    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }
    
    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }
    
    // Check password length
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        errors.push({ msg: 'Email is already registered' });
    }
    
    if (errors.length > 0) {
        res.render('auth/register', {
            title: 'Register - StyleHub',
            layout: 'layouts/auth',
            errors,
            name,
            email
        });
    } else {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create new user
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword
        };
        
        users.push(newUser);
        
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

// Protected routes
app.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { 
        title: 'Dashboard - StyleHub'
    });
});

// Add to cart route
app.post('/add-to-cart', (req, res) => {
    if (!req.session.cartCount) {
        req.session.cartCount = 0;
    }
    req.session.cartCount++;
    res.json({ success: true, cartCount: req.session.cartCount });
});

// Error handling middleware
app.use((req, res, next) => {
    res.status(404).render('error', { 
        title: '404 - Page Not Found',
        error: { status: 404, message: 'Page not found' }
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: '500 - Server Error',
        error: { status: 500, message: 'Something went wrong!' }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});