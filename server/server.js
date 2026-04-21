const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
app.use(cors());

let salesData = [];

// Load CSV data
const path = require("path");

fs.createReadStream(path.join(__dirname, "data.csv"))
  .pipe(csv())
  .on("data", (row) => {
    salesData.push(row);
  })
  .on("end", () => {
    console.log("CSV Loaded:", salesData.length, "records");
  });

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/total-sales", (req, res) => {
  console.log("Sales Data:", salesData);

  if (salesData.length === 0) {
    return res.json({ message: "Data not loaded yet" });
  }

  const total = salesData.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * parseInt(item.quantity));
  }, 0);

  res.json({ totalSales: total });
});

app.get("/top-products", (req, res) => {
  const { category } = req.query;

  let filteredData = salesData;

  if (category) {
    filteredData = salesData.filter(item => item.category === category);
  }

  const productSales = {};

  filteredData.forEach((item) => {
    const revenue = parseFloat(item.price) * parseInt(item.quantity);

    if (productSales[item.product]) {
      productSales[item.product] += revenue;
    } else {
      productSales[item.product] = revenue;
    }
  });

  const sorted = Object.entries(productSales)
    .map(([product, revenue]) => ({ product, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  res.json(sorted);
});

app.get("/category-sales", (req, res) => {
  if (salesData.length === 0) {
    return res.json({ message: "Data not loaded yet" });
  }

  const categorySales = {};

  salesData.forEach((item) => {
    const revenue = parseFloat(item.price) * parseInt(item.quantity);

    if (categorySales[item.category]) {
      categorySales[item.category] += revenue;
    } else {
      categorySales[item.category] = revenue;
    }
  });

  res.json(categorySales);
});