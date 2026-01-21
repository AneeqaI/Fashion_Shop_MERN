// server.js
const express = require('express');
const cors = require('cors');
const app = express();

// Import Schema/Model
const FashionItem = require('./fashionSchema');

// Import connectDB function
const connectDB = require('./connectMongo');

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send("Server is running and connected to MongoDB");
});

// POST route to add a new item
app.post('/addItem', async (req, res) => {
    try {
        const newItem = new FashionItem({
            "Product Category": req.body["Product Category"],
            "Product Name": req.body["Product Name"],
            "Units Sold": req.body["Units Sold"],
            "Returns": req.body["Returns"],
            "Revenue": req.body["Revenue"],
            "Customer Rating": req.body["Customer Rating"],
            "Stock Level": req.body["Stock Level"],
            "Season": req.body["Season"],
            "Trend Score": req.body["Trend Score"]
        });

        const savedItem = await newItem.save();
        res.status(201).json({ message: "Item added successfully", item: savedItem });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to add item", error: err.message });
    }
});

// UPDATE ITEM ROUTE
app.post('/updateItem', async (req, res) => {
    try {
        const { "Product Name": productName, ...updateData } = req.body;

        if (!productName) {
            return res.status(400).json({ message: "Product Name is required to update" });
        }

        const updatedItem = await FashionItem.findOneAndUpdate(
            { "Product Name": productName },
            updateData,
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json({ message: "Item updated successfully", item: updatedItem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE ITEM ROUTE
app.post('/deleteItem', async (req, res) => {
    try {
        const { "Product Name": productName } = req.body;

        if (!productName) {
            return res.status(400).json({ message: "Product Name is required to delete" });
        }

        const deletedItem = await FashionItem.findOneAndDelete({ "Product Name": productName });

        if (!deletedItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json({ message: "Item deleted successfully", item: deletedItem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET TOTALS BY SEASON
app.get('/seasonTotals', async (req, res) => {
    try {
        const season = req.query.season;

        if (!season) {
            return res.status(400).json({ message: "Season is required" });
        }

        const totals = await FashionItem.aggregate([
            { $match: { Season: season } },
            {
                $group: {
                    _id: "$Season",
                    totalUnitsSold: { $sum: "$Units Sold" },
                    totalReturns: { $sum: "$Returns" },
                    totalRevenue: { $sum: "$Revenue" }
                }
            }
        ]);

        if (totals.length === 0) {
            return res.status(404).json({ message: "No data found for this season" });
        }

        res.json({
            Season: season,
            totalUnitsSold: totals[0].totalUnitsSold,
            totalReturns: totals[0].totalReturns,
            totalRevenue: totals[0].totalRevenue
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET FIRST 10 RECORDS BY UNITS SOLD AND SEASON (JSON)
app.get('/filterRecords', async (req, res) => {
    try {
        const season = req.query.season;
        const minUnitsSold = parseInt(req.query.minUnitsSold);

        if (!season || isNaN(minUnitsSold)) {
            return res.status(400).json({ message: "Please provide both season and minUnitsSold as query parameters." });
        }

        const records = await FashionItem.find({
            Season: season,
            "Units Sold": { $gt: minUnitsSold }
        }).limit(10);

        if (records.length === 0) {
            return res.status(404).json({ message: `No records found for Season: ${season} with Units Sold > ${minUnitsSold}` });
        }

        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET item by Product Name
app.get('/getItem', async (req, res) => {
  try {
    const productName = req.query.productName;
    if (!productName) {
      return res.status(400).json({ message: "Product Name is required" });
    }

    const item = await FashionItem.findOne({ "Product Name": productName });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET PRODUCTS BY CUSTOMER RATING FOR A SEASON (JSON)
app.get('/ratingFilter', async (req, res) => {
    try {
        const season = req.query.season;
        const minRating = parseFloat(req.query.minRating);

        if (!season || isNaN(minRating)) {
            return res.status(400).json({ message: "Please provide both season and minRating as query parameters." });
        }

        const products = await FashionItem.find({
            Season: season,
            "Customer Rating": { $gte: minRating }
        });

        if (products.length === 0) {
            return res.status(404).json({ message: `No products found for Season: ${season} with Customer Rating >= ${minRating}` });
        }

        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
