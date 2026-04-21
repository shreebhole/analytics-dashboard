import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

function App() {
  const [totalSales, setTotalSales] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [categorySales, setCategorySales] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");

  // 🔥 NEW STATES
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    Promise.all([
      axios.get("http://localhost:5000/total-sales"),
      axios.get(`http://localhost:5000/top-products?category=${selectedCategory}`),
      axios.get("http://localhost:5000/category-sales")
    ])
      .then(([t, p, c]) => {
        setTotalSales(t.data.totalSales);
        setTopProducts(p.data);
        setCategorySales(c.data);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  // 🔍 SEARCH FILTER
  const filteredProducts = topProducts.filter(p =>
    p.product.toLowerCase().includes(search.toLowerCase())
  );

  // 💰 FORMATTER
  const formatINR = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);

  // 📊 BAR CHART
  const barData = {
    labels: filteredProducts.map(item => item.product),
    datasets: [
      {
        label: "Revenue",
        data: filteredProducts.map(item => item.revenue),
        backgroundColor: "#4CAF50"
      }
    ]
  };

  // 🥧 PIE CHART
  const pieData = {
    labels: Object.keys(categorySales),
    datasets: [
      {
        data: Object.values(categorySales),
        backgroundColor: ["#4CAF50", "#2196F3", "#FF9800", "#E91E63"]
      }
    ]
  };

  // 💡 INSIGHTS
  const topCategory = Object.entries(categorySales)
    .sort((a, b) => b[1] - a[1])[0];

  const bestProduct = filteredProducts[0];

  return (
    <div className="dashboard">
      <h1>📊 Analytics Dashboard</h1>

      {/* 🔽 LOADING + ERROR */}
      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 🔽 FILTER */}
      <div className="controls"></div>
      <select onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value="">All</option>
        <option value="Fashion">Fashion</option>
        <option value="Electronics">Electronics</option>
        <option value="Accessories">Accessories</option>
      </select>

      {/* 🔍 SEARCH */}
      <input
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 🔽 KPI CARDS */}
      <div className="kpi-container">
        <div className="kpi-card">
          <h4>Total Sales</h4>
          <p>{formatINR(totalSales)}</p>
        </div>

        <div className="kpi-card">
          <h4>Total Products</h4>
          <p>{filteredProducts.length}</p>
        </div>
      </div>

      {/* 🔽 CHARTS */}
      <div className="chart-container">

        {filteredProducts.length > 0 && (
          <div className="chart-box">
            <h3>Top Products</h3>
            <Bar data={barData} />
          </div>
        )}

        {Object.keys(categorySales).length > 0 && (
          <div className="chart-box">
            <h3>Category Sales</h3>
            <Pie data={pieData} />
          </div>
        )}

      </div>

      {/* 🔽 INSIGHTS */}
      {topCategory && (
        <div className="insights">
          <h3>Insights</h3>
          <p>Top Category: {topCategory[0]}</p>
          <p>Revenue: {formatINR(topCategory[1])}</p>

          {bestProduct && (
            <p>
              🔥 Best-selling product is <b>{bestProduct.product}</b> generating{" "}
              <b>{formatINR(bestProduct.revenue)}</b>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;