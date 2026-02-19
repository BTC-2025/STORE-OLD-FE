import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

/**
 * ProductCard Component
 * Modern product card with hover effects, wishlist functionality, and rating display
 * 
 * @param {object} product - Product data
 * @param {function} onAddToCart - Add to cart callback
 * @param {function} onToggleWishlist - Toggle wishlist callback
 * @param {boolean} isInWishlist - Whether product is in wishlist
 * @param {boolean} isInCart - Whether product is in cart
 */
const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  isInCart = false
}) => {
  const { id, name, price, image, discount, averageRating, stock } = product;

  // Calculate discount price
  const discountedPrice = discount > 0
    ? (price * (1 - discount / 100)).toFixed(2)
    : price.toFixed(2);

  // Check if out of stock
  const outOfStock = stock === 0;

  return (
    <div className={`product-card ${outOfStock ? 'out-of-stock' : ''}`}>
      {/* Product Image */}
      <Link to={`/products/${id}`} className="product-card-image-link">
        <div className="product-card-image-wrapper">
          <img
            src={image || 'https://via.placeholder.com/300'}
            alt={name}
            className="product-card-image"
            loading="lazy"
          />

          {/* Badges */}
          {discount > 0 && (
            <span className="product-badge product-badge-discount">
              {discount}% OFF
            </span>
          )}
          {outOfStock && (
            <span className="product-badge product-badge-stock">
              Out of Stock
            </span>
          )}

          {/* Overlay Actions */}
          {!outOfStock && (
            <div className="product-card-overlay">
              <button
                className="btn-overlay btn-overlay-primary"
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart && onAddToCart(product);
                }}
                disabled={isInCart}
              >
                <i className={`fas ${isInCart ? 'fa-check' : 'fa-shopping-cart'}`}></i>
                {isInCart ? 'In Cart' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="product-card-body">
        <Link to={`/products/${id}`} className="product-card-title-link">
          <h3 className="product-card-title">{name}</h3>
        </Link>

        {/* Rating */}
        {averageRating !== undefined && averageRating !== null && (
          <div className="product-card-rating">
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`fas fa-star ${i < Math.floor(averageRating) ? 'star-filled' : 'star-empty'}`}
                ></i>
              ))}
            </div>
            <span className="rating-value">{Number(averageRating).toFixed(1)}</span>
          </div>
        )}

        {/* Price */}
        <div className="product-card-price">
          <span className="price-current">₹{discountedPrice}</span>
          {discount > 0 && (
            <>
              <span className="price-original">₹{price.toFixed(2)}</span>
              <span className="price-save">Save ₹{(price - discountedPrice).toFixed(2)}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="product-card-actions">
          <button
            className={`btn-wishlist ${isInWishlist ? 'active' : ''}`}
            onClick={() => onToggleWishlist && onToggleWishlist(product)}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <i className={`${isInWishlist ? 'fas' : 'far'} fa-heart`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
