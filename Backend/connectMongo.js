// connectMongo.js
const mongoose = require('mongoose');

// Import the Schema + Model created in Task 1.2
const FashionItem = require('./fashionSchema');

// Connect to MongoDB database
async function connectDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/FashionShop');
        console.log("Connected to MongoDB successfully");
    } catch (err) {
        console.error("MongoDB connection failed:", err);
    }
}

// Export the function so server.js can call it
module.exports = connectDB;
