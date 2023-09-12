require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const nocache = require('nocache');
const mongoURI = process.env.MONGODB_URI;

const app = express();
const port = process.env.PORT || 3000;

// Middleware to prevent caching
app.use(nocache());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, w: 'majority' })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error during connecting to MongoDB', err);
    });

// Load static contents
app.use(express.static(path.join(__dirname, 'public')));

// User route
const userRoute = require('./routes/userRoute');
app.use('/', userRoute);
// Admin route
const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute);

const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).render('error', { message: 'Internal Server Error' });
  };
app.use(errorHandler);

app.use((req, res) => {
    res.status(404).render('error')
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});