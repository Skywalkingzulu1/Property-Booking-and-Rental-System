const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer'); // Import multer

const app = express();

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Parsing JSON data

// Serve static files
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(__dirname));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/houseRentalDB')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Booking Schema
const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    bookingType: { type: String, required: true } // Add bookingType field (Book or Rent)
});

const Booking = mongoose.model('Booking', bookingSchema);

// User Schema for signup
const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Property Schema
const propertySchema = new mongoose.Schema({
    userName: { type: String, required: true },
    userContact: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true } // Store the image base64 string
});

const Property = mongoose.model('Property', propertySchema);

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage for the uploaded files
const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/book', (req, res) => {
    res.sendFile(path.join(__dirname, 'book.html'));
});

// Route for adding a new property
app.get('/add_property', (req, res) => {
    res.sendFile(path.join(__dirname, 'add_property.html'));
});

// Handle booking form submission with "Book or Rent" option
app.post('/bookhome', async (req, res) => {
    const { name, email, phone, bookingType } = req.body;

    try {
        const newBooking = new Booking({ name, email, phone, bookingType });
        await newBooking.save();
        res.status(200).send('Booking Successful!');
    } catch (err) {
        console.error('Error saving booking:', err);
        res.status(500).send('Error occurred during booking.');
    }
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    try {
        const newUser = new User({ first_name, last_name, email, password });
        await newUser.save();
        res.status(200).send('Signup Successful!');
    } catch (err) {
        console.error('Error during signup:', err);
        if (err.code === 11000) {
            res.status(400).send('Email already exists.');
        } else {
            res.status(500).send('Error occurred during signup.');
        }
    }
});

// Handle property form submission with image upload
app.post('/properties', upload.single('property-image'), async (req, res) => {
    const { userName, userContact, location } = req.body;
    const image = req.file.buffer.toString('base64'); // Convert image buffer to base64 string

    try {
        const newProperty = new Property({ userName, userContact, location, image });
        await newProperty.save();
        res.status(200).send('Property added successfully!');
    } catch (err) {
        console.error('Error saving property:', err);
        res.status(500).send('Error occurred while adding property.');
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
