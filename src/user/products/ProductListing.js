import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductListing.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

const ProductListing = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // -- State --
  const [allProducts, setAllProducts] = useState([]); // Store all products for client-side reset
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters Data
  const [categories] = useState([
    {
      name: 'Electronics',
      subCategories: ['Mobiles & Accessories', 'Laptops & Accessories', 'Computers & Components', 'Audio & Wearables', 'Cameras & Photography', 'TVs & Home Entertainment', 'Gaming', 'Home Appliances', 'Networking & Smart Devices', 'Electronic Accessories']
    },
    {
      name: 'Clothing',
      subCategories: ['Men Top Wear', 'Men Bottom Wear', 'Women Ethnic', 'Women Western', 'Men Footwear', 'Women Footwear']
    },
    {
      name: 'Home & Kitchen',
      subCategories: ['Furniture', 'Kitchen & Dining', 'Home Decor', 'Bed Linens', 'Bath']
    },
    {
      name: 'Beauty',
      subCategories: ['Makeup', 'Skincare', 'Haircare', 'Fragrances', 'Personal Care']
    },
    {
      name: 'Sports',
      subCategories: ['Fitness', 'Outdoor', 'Team Sports', 'Water Sports', 'Cycling']
    },
    {
      name: 'Books',
      subCategories: ['Fiction', 'Non-Fiction', 'Academic', 'Children Books', 'Best Sellers']
    },
    {
      name: 'Toys',
      subCategories: ['Action Figures', 'Educational', 'Outdoor Toys', 'Board Games', 'Puzzles']
    },
    {
      name: 'Accessories',
      subCategories: ['Watches', 'Bags', 'Jewelry', 'Sunglasses', 'Belts']
    },
    {
      name: 'Grocery',
      subCategories: ['Food Cupboard', 'Beverages', 'Snacks', 'Dairy', 'Frozen Foods']
    },
    {
      name: 'Furniture',
      subCategories: ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Outdoor']
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(''); // For accordion logic

  const [sortOption, setSortOption] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  // User & Cart State
  const user = JSON.parse(localStorage.getItem('user'));
  const [carted, setCarted] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [showFilters, setShowFilters] = useState(false);

  // -- Effects --

  // Filtering Logic
  useEffect(() => {
    let result = [...products];

    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Client-side subcategory logic
    if (selectedSubCategory && !loading) {
      result = result.filter(product => product.subcategory === selectedSubCategory);
    }

    result = result.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    if (selectedBrands.length > 0) {
      result = result.filter(product => selectedBrands.includes(product.brand));
    }

    if (selectedRatings.length > 0) {
      result = result.filter(product =>
        selectedRatings.includes(Math.floor(product.averageRating || 0))
      );
    }

    // Sorting
    if (sortOption === 'priceLowToHigh') result.sort((a, b) => a.price - b.price);
    if (sortOption === 'priceHighToLow') result.sort((a, b) => b.price - a.price);
    if (sortOption === 'topRating') result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    if (sortOption === 'newestFirst') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortOption === 'popular') result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));

    setFilteredProducts(result);
  }, [products, selectedCategory, selectedSubCategory, sortOption, priceRange, selectedBrands, selectedRatings, loading]);


  // -- API Calls --
  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/product`);
      setAllProducts(response.data); // Cache full list
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductsBySubCategory = React.useCallback(async (subcategory) => {
    if (allProducts.length > 0) {
      setProducts(allProducts); // Ensure we filter from full list
      setSelectedSubCategory(subcategory);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/product/subcategory/filter?subcategory=${encodeURIComponent(subcategory)}`
      );
      setProducts(response.data);
      setSelectedSubCategory(subcategory);
    } catch (error) {
      toast.error("Failed to load subcategory products");
    } finally {
      setLoading(false);
    }
  }, [allProducts]);

  const fetchCart = React.useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/cart/userid/${user.id}`);
      setCarted(res.data);
    } catch (err) { console.error(err); }
  }, [user]);

  const fetchWishlist = React.useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/wishlist/userid/${user.id}`);
      setWishlist(res.data.map(item => item.productId));
    } catch (err) { console.error(err); }
  }, [user]);

  // -- Effects --

  useEffect(() => {
    if (location.state?.products) {
      setAllProducts(location.state.products); // Cache passed products too
      setProducts(location.state.products);
      setFilteredProducts(location.state.products);
      setLoading(false);
    } else {
      fetchProducts();
    }
  }, [location.state, fetchProducts]);

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
    }
  }, [user, fetchCart, fetchWishlist]);

  // -- Actions --
  const handleCategoryClick = (catName) => {
    if (selectedCategory === catName) {
      setExpandedCategory(expandedCategory === catName ? '' : catName);
    } else {
      setSelectedCategory(catName);
      setExpandedCategory(catName);
      setSelectedSubCategory('');
      // Use cached allProducts instead of re-fetching
      if (allProducts.length > 0) {
        setProducts(allProducts);
      } else {
        fetchProducts();
      }
    }
  };

  const handleSubCategoryClick = (sub, e) => {
    e.stopPropagation();
    fetchProductsBySubCategory(sub);
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const handleRatingToggle = (rating) => {
    setSelectedRatings(prev => prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]);
  };



  const toggleWishlist = async (id, e) => {
    e.stopPropagation();
    if (!user) return toast.error("Please login first");
    try {
      if (wishlist.includes(id)) {
        await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/wishlist/userid/${user.id}/productid/${id}`);
        setWishlist(prev => prev.filter(w => w !== id));
        toast.success("Removed from Wishlist");
      } else {
        await axios.post(`${process.env.REACT_APP_BASE_URL}/api/wishlist`, { userId: user.id, productId: id });
        setWishlist(prev => [...prev, id]);
        toast.success("Added to Wishlist");
      }
    } catch (error) { toast.error("Wishlist error"); }
  };

  // -- Helpers --
  const getUniqueBrands = () => [...new Set(products.map(p => p.brand))].filter(Boolean);
  const getCategoryCount = (name) => products.filter(p => p.category === name).length;

  if (loading) return <div className="pl-loading">Loading products...</div>;

  return (
    <div className="pl-page-container">
      <Toaster position="top-right" />

      {/* Mobile Filter Overlay */}
      <div
        className={`pl-sidebar-overlay ${showFilters ? 'active' : ''}`}
        onClick={() => setShowFilters(false)}
      ></div>

      {/* Header & Controls */}
      <div className="pl-header">
        <h1 className="pl-title">{selectedSubCategory || selectedCategory || 'All Products'}</h1>

        <div className="pl-controls-row">
          <div className="pl-filter-chips">
            {/* Mobile Filter Button */}
            <button
              className="pl-chip pl-mobile-filter-btn"
              onClick={() => setShowFilters(true)}
            >
              <i className="fas fa-filter"></i> Filters
            </button>
            <button
              className={`pl-chip ${sortOption === 'popular' ? 'active' : ''}`}
              onClick={() => setSortOption(sortOption === 'popular' ? '' : 'popular')}
            >
              Most Popular
            </button>
            <button
              className={`pl-chip ${sortOption === 'priceLowToHigh' ? 'active' : ''}`}
              onClick={() => setSortOption(sortOption === 'priceLowToHigh' ? '' : 'priceLowToHigh')}
            >
              Price: Low to High
            </button>

            {/* Brand Chips */}
            {getUniqueBrands().slice(0, 3).map(brand => (
              <button
                key={brand}
                className={`pl-chip ${selectedBrands.includes(brand) ? 'active' : ''}`}
                onClick={() => handleBrandToggle(brand)}
              >
                {brand}
              </button>
            ))}
          </div>

          <div className="pl-view-controls">
            <button className={`pl-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <i className="fas fa-th"></i> Grid
            </button>
            <button className={`pl-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
              <i className="fas fa-list"></i> List
            </button>
            <span className="pl-product-count-badge">{filteredProducts.length} Items</span>
          </div>
        </div>

        {/* Applied Filters */}
        {(selectedBrands.length > 0 || selectedRatings.length > 0 || selectedCategory) && (
          <div className="pl-applied-filters">
            <span>Applied:</span>
            {selectedCategory && (
              <span className="pl-applied-tag">
                {selectedCategory} <i className="fas fa-times" onClick={() => {
                  setSelectedCategory('');
                  setExpandedCategory('');
                  fetchProducts();
                }}></i>
              </span>
            )}
            {selectedBrands.map(b => (
              <span key={b} className="pl-applied-tag">
                {b} <i className="fas fa-times" onClick={() => handleBrandToggle(b)}></i>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pl-content-layout">
        {/* Sidebar */}
        <aside className={`pl-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="pl-sidebar-header-mobile">
            <h3>Filters</h3>
            <button className="pl-close-sidebar" onClick={() => setShowFilters(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="pl-sidebar-group">
            <h3 className="pl-sidebar-title">Categories</h3>
            <div className="pl-category-list">
              {categories.map(cat => (
                <div key={cat.name} className="pl-category-group">
                  <div
                    className={`pl-category-item ${selectedCategory === cat.name ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat.name)}
                  >
                    <span>{cat.name}</span>
                    <span className="count">{getCategoryCount(cat.name)}</span>
                  </div>

                  {/* Accordion Subcategories */}
                  {expandedCategory === cat.name && (
                    <div className="pl-subcategory-list">
                      {cat.subCategories.map(sub => (
                        <div
                          key={sub}
                          className={`pl-subcategory-item ${selectedSubCategory === sub ? 'active' : ''}`}
                          onClick={(e) => handleSubCategoryClick(sub, e)}
                        >
                          {sub}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pl-sidebar-group">
            <h3 className="pl-sidebar-title">Price Range</h3>
            <div className="pl-price-slider">
              <input
                type="range" min="0" max="100000" step="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
              />
              <div className="pl-price-values">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>
          </div>

          <div className="pl-sidebar-group">
            <h3 className="pl-sidebar-title">Brands</h3>
            {getUniqueBrands().map(brand => (
              <label key={brand} className="pl-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                />
                <span className="pl-custom-check"></span>
                {brand}
              </label>
            ))}
          </div>

          <div className="pl-sidebar-group">
            <h3 className="pl-sidebar-title">Rating</h3>
            {[5, 4, 3, 2, 1].map(r => (
              <label key={r} className="pl-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedRatings.includes(r)}
                  onChange={() => handleRatingToggle(r)}
                />
                <span className="pl-custom-check"></span>
                <div className="pl-stars">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star ${i < r ? 'filled' : 'empty'}`}></i>
                  ))}
                </div>
              </label>
            ))}
          </div>
          {/* Mobile Apply Button */}
          <button
            className="pl-buy-btn w-100 mt-3 d-lg-none"
            onClick={() => setShowFilters(false)}
          >
            Apply Filters
          </button>
        </aside>

        {/* Product Grid */}
        <main className={`pl-products-area ${viewMode}`}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div
                key={product.id}
                className="pl-product-card"
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="pl-card-image">
                  <img src={product.image} alt={product.name} />
                  {product.discount > 0 && (
                    <span className="pl-discount-tag">-{product.discount}%</span>
                  )}

                  {/* Overlay & Actions */}
                  <div className="pl-image-overlay">
                    <button className="pl-quick-view-btn" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${product.id}`);
                    }}>Quick View</button>
                  </div>

                  <button
                    className={`pl-wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                    onClick={(e) => toggleWishlist(product.id, e)}
                  >
                    <i className={wishlist.includes(product.id) ? "fas fa-heart" : "far fa-heart"}></i>
                  </button>
                </div>

                <div className="pl-card-details">
                  <h3 className="pl-card-title">{product.name}</h3>
                  <p className="pl-card-desc">{product.shortDescription || product.description}</p>

                  <div className="pl-card-rating">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < Math.floor(product.averageRating || 0) ? 'filled' : 'empty'}`}></i>
                    ))}
                  </div>

                  <div className="pl-card-bottom">
                    <div className="pl-prices">
                      <span className="pl-price-current">₹{(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                      {product.discount > 0 && (
                        <span className="pl-price-old">
                          ₹{product.price}
                        </span>
                      )}
                    </div>

                    {carted.some(item => item.productId === product.id) ? (
                      <button className="pl-buy-btn in-cart" onClick={(e) => {
                        e.stopPropagation();
                        navigate('/cart');
                      }}>In Cart</button>
                    ) : (
                      <button
                        className="pl-buy-btn"
                        disabled={!product.stock || product.stock < 1}
                        style={{ background: (!product.stock || product.stock < 1) ? '#ccc' : '', cursor: (!product.stock || product.stock < 1) ? 'not-allowed' : 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.stock > 0) {
                            // Direct checkout for this item
                            navigate(`/checkout/${product.id}`);
                          }
                        }}
                      >
                        {(!product.stock || product.stock < 1) ? 'Out of Stock' : 'Buy Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="pl-no-products">
              <h3>No products found</h3>
              <p>Try adjusting your filters.</p>
              <button className="pl-buy-btn" onClick={() => {
                setSelectedCategory('');
                setPriceRange([0, 100000]);
                setSelectedBrands([]);
                fetchProducts();
              }}>Reset Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListing;