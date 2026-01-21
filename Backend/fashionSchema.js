// fashionSchema.js
const mongoose = require('mongoose');

// Schema matching CSV fields 
const fashionSchema = new mongoose.Schema({
    "Product Category": { type: String, required: true },
    "Product Name": { type: String, required: true },
    "Units Sold": { type: Number, required: true },
    "Returns": { type: Number, required: true },
    "Revenue": { type: Number, required: true },
    "Customer Rating": { type: Number, required: true },
    "Stock Level": { type: Number, required: true },
    "Season": { type: String, required: true },
    "Trend Score": { type: Number, required: true }
}, {
    collection: "FashionShopData" // ensures correct collection
});

// Create model from schema
const FashionItem = mongoose.model("FashionShopData", fashionSchema);

// Export model
module.exports = FashionItem;
