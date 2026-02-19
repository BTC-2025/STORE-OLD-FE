import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [productResponse, cartResponse, wishlistResponse, reviewsResponse] = await Promise.allSettled([
          axios.get(`${process.env.REACT_APP_BASE_URL}/api/product/${id}`),
          user ? axios.get(`${process.env.REACT_APP_BASE_URL}/api/cart/userid/${user.id}`) : Promise.resolve({ data: [] }),
          user ? axios.get(`${process.env.REACT_APP_BASE_URL}/api/wishlist/userid/${user.id}`) : Promise.resolve({ data: [] }),
          axios.get(`${process.env.REACT_APP_BASE_URL}/api/review/product/${id}`)
        ]);

        if (productResponse.status === 'fulfilled') {
          setProduct(productResponse.value.data);
        } else {
          setError("Product not found");
        }

        if (cartResponse.status === 'fulfilled') setCartItems(cartResponse.value.data);
        if (wishlistResponse.status === 'fulfilled') setWishlistItems(wishlistResponse.value.data);

        if (reviewsResponse.status === 'fulfilled') {
          const data = reviewsResponse.value.data;
          setReviews(Array.isArray(data) ? data : data.reviews || []);
        }

      } catch (error) {
        console.error("Error loading details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id, user]);

  const isInCart = () => cartItems.some(item => item.productId === parseInt(id));
  const isInWishlist = () => wishlistItems.some(item => item.productId === parseInt(id));

  const handleQuantity = (val) => {
    if (val < 1) return;
    if (product && val > product.stock) return;
    setQuantity(val);
  };

  const addToCart = async () => {
    if (!user) {
      toast.error("Please login to shop");
      navigate('/login');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/cart/add`, {
        userId: user.id,
        productId: product.id,
        quantity: quantity,
      });
      toast.success("Added to Cart");
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/cart/userid/${user.id}`);
      setCartItems(res.data);
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const buyNow = async () => {
    // Navigate directly to checkout for this product
    navigate(`/checkout/${id}`);
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Login required");
      return;
    }
    try {
      if (isInWishlist()) {
        await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/wishlist/userid/${user.id}/productid/${id}`);
        setWishlistItems(prev => prev.filter(item => item.productId !== parseInt(id)));
        toast.success("Removed from Wishlist");
      } else {
        await axios.post(`${process.env.REACT_APP_BASE_URL}/api/wishlist`, { userId: user.id, productId: id });
        setWishlistItems(prev => [...prev, { productId: parseInt(id) }]);
        toast.success("Added to Wishlist");
      }
    } catch (err) {
      toast.error("Wishlist update failed");
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (error) return <div className="text-center py-5 text-danger">{error}</div>;
  if (!product) return <div className="text-center py-5">Product Not Found</div>;

  const images = product.images?.length > 0 ? product.images : [product.image];
  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="product-detail-page">
      <Toaster position="top-right" />

      {/* Breadcrumb */}
      <div className="pd-breadcrumb-container">
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <Link to="/products">Products</Link>
          <span className="separator">/</span>
          <span className="current">{product.name}</span>
        </div>
      </div>

      <div className="pd-container">
        {/* Left: Gallery */}
        <div className="pd-gallery">
          <div className="pd-thumbnails">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`pd-thumb-item ${selectedImage === idx ? 'active' : ''}`}
                onClick={() => setSelectedImage(idx)}
              >
                <img src={img} alt="" />
              </div>
            ))}
          </div>
          <div className="pd-main-image-wrapper">
            <img src={images[selectedImage]} alt={product.name} className="pd-main-image" />
            <button
              className={`pd-wishlist-btn ${isInWishlist() ? 'active' : ''}`}
              onClick={toggleWishlist}
            >
              <i className={`fas fa-heart`}></i>
            </button>
          </div>
        </div>

        {/* Right: Info */}
        <div className="pd-info-wrapper">
          <div className="pd-brand">{product.brand || 'Brand Name'}</div>
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating-row">
            <div className="pd-stars">
              {[...Array(5)].map((_, i) => (
                <i key={i} className={`fas fa-star ${i < Math.round(avgRating) ? 'filled' : 'empty'}`}></i>
              ))}
            </div>
            <span className="pd-review-count" onClick={() => document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' })}>
              {reviews.length} Reviews
            </span>
          </div>

          <div className="pd-price-row">
            <span className="pd-price">₹{(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
            {product.discount > 0 && (
              <>
                <span className="pd-original-price">₹{product.price}</span>
                <span className="pd-discount">{product.discount}% OFF</span>
              </>
            )}
          </div>

          <div className="pd-selectors">
            <div className="pd-selector-row">
              <span className="pd-selector-label">Quantity</span>
              <div className="pd-quantity-wrapper">
                <button className="pd-qty-btn" onClick={() => handleQuantity(quantity - 1)}>-</button>
                <span className="pd-qty-val">{quantity}</span>
                <button className="pd-qty-btn" onClick={() => handleQuantity(quantity + 1)}>+</button>
              </div>
            </div>
          </div>

          <div className="pd-actions">
            <button className="pd-btn-cart" onClick={addToCart}>
              {isInCart() ? 'In Cart' : 'Add to Cart'}
            </button>
            <button
              className="pd-btn-buy"
              onClick={buyNow}
              disabled={!product.stock || product.stock < 1}
              style={{ opacity: (!product.stock || product.stock < 1) ? 0.6 : 1, cursor: (!product.stock || product.stock < 1) ? 'not-allowed' : 'pointer' }}
            >
              {(!product.stock || product.stock < 1) ? 'Out of Stock' : 'Buy Now'}
            </button>
          </div>

          <div className="pd-features">
            <div className="pd-feature-item">
              <i className="fas fa-truck pd-feature-icon"></i>
              <div className="pd-feature-text">
                <h4>Free Shipping</h4>
                <p>On orders over ₹999</p>
              </div>
            </div>
            <div className="pd-feature-item">
              <i className="fas fa-shield-alt pd-feature-icon"></i>
              <div className="pd-feature-text">
                <h4>Secure Payment</h4>
                <p>100% protected payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Reviews */}
      <div className="pd-details-section">
        <div className="pd-tabs">
          <button className={`pd-tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
          <button className={`pd-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews ({reviews.length})</button>
        </div>

        <div className="pd-tab-content">
          {activeTab === 'description' && (
            <div className="pd-tab-panel">
              <p className="pd-description-text">
                {product.description || "No description available for this product."}
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="pd-tab-panel" id="reviews">
              <div className="pd-reviews-container">
                <div className="pd-rating-summary">
                  <div className="pd-big-rating">{avgRating}</div>
                  <div className="pd-stars">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < Math.round(avgRating) ? 'filled' : 'empty'}`}></i>
                    ))}
                  </div>
                  <div className="pd-total-reviews">Based on {reviews.length} reviews</div>
                </div>

                <div className="pd-review-list">
                  {reviews.length === 0 ? (
                    <p>No reviews yet. Be the first to write one!</p>
                  ) : reviews.map(review => (
                    <div key={review.id} className="pd-review-card">
                      <div className="pd-review-header">
                        <div className="pd-reviewer">
                          {review.user?.name || 'User'}
                          <span className="pd-verified-badge">Verified</span>
                        </div>
                        <span className="pd-review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="pd-stars mb-2">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fas fa-star ${i < review.rating ? 'filled' : 'empty'}`} style={{ fontSize: '12px' }}></i>
                        ))}
                      </div>
                      <p className="pd-review-body">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;