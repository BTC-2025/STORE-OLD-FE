import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import "../home/Home.css"; // Use shared Home CSS for consistent spacing

const TopSelling = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/product/top/selling`
        );
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch top selling products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSelling();
  }, []);

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Top Selling Products</h2>
        <a href="/products?sort=popular" className="view-all-link">View All</a>
      </div>
      <div className="products-grid">
        {Array.isArray(products) && products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default TopSelling;