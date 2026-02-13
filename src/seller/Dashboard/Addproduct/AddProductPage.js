import React, { useState, useEffect, useCallback } from 'react';
import { FaArrowLeft, FaUpload, FaTag, FaBoxOpen, FaImage, FaListUl, FaCheck } from 'react-icons/fa';
import './AddProductPage.css';

const AddProductPage = ({ sellerToken, onBackToDashboard }) => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [loading, setLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    image: '',
    price: '',
    stock: '',
    sku: '',
    category: '',
    subcategory: '',
    isAvailable: true,
    isFeatured: false,
    createdBy: '',
    discount: 0
  });

  const getSellerIdFromToken = useCallback(() => {
    try {
      const tokenPayload = sellerToken.split('.')[1];
      const decodedPayload = atob(tokenPayload);
      const payloadObj = JSON.parse(decodedPayload);
      return payloadObj.id || payloadObj.sellerId;
    } catch (error) {
      console.error('Error extracting seller ID from token:', error);
      return null;
    }
  }, [sellerToken]);

  const fetchBrands = useCallback(async () => {
    try {
      const sellerId = getSellerIdFromToken();
      if (!sellerId) {
        throw new Error('Could not determine seller ID');
      }

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/seller/brands/seller/${sellerId}`, {
        headers: {
          'Authorization': `Bearer ${sellerToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }

      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      // alert('Failed to load brands. Please try again.');
    }
  }, [sellerToken, getSellerIdFromToken]);



  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);



  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taglineArray = newProduct.tagline[0]
        ? newProduct.tagline[0].split(',').map(tag => tag.trim())
        : [];

      const productData = [{
        name: newProduct.name,
        slug: newProduct.slug || newProduct.name.toLowerCase().replace(/\s+/g, '-'),
        shortDescription: newProduct.shortDescription,
        description: newProduct.description,
        image: newProduct.image,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        sku: newProduct.sku,
        category: newProduct.category,
        subcategory: newProduct.subcategory,
        brandId: parseInt(selectedBrand),
        isAvailable: newProduct.isAvailable,
        isFeatured: newProduct.isFeatured,
        createdBy: newProduct.createdBy || 'Seller',
        tagline: taglineArray,
        discount: parseFloat(newProduct.discount) || 0
      }];

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/seller/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      onBackToDashboard();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  // Helper change handler
  const handleChange = (field, value) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  if (!brands.length && !loading) { // Simple empty state if no brands
    // (In real app, might want to check loading status of brands fetch first)
  }

  return (
    <div className="ap-page">
      <div className="ap-container">
        {/* Header */}
        <div className="ap-header">
          <button className="ap-back-link" onClick={onBackToDashboard}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="ap-header-content">
            <div>
              <h1 className="ap-title">Add New Product</h1>
              <p className="ap-subtitle">Fill in the details to list your product</p>
            </div>
            <div className="ap-header-actions">
              <button className="ap-btn-secondary" onClick={onBackToDashboard}>Cancel</button>
              <button className="ap-btn-primary" onClick={handleAddProduct} disabled={loading}>
                {loading ? 'Saving...' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>

        {brands.length === 0 ? (
          <div className="ap-empty-state">
            <div className="ap-empty-icon"><FaTag /></div>
            <h3>No Brands Found</h3>
            <p>You need to create a brand before adding products.</p>
            <button className="ap-btn-primary" onClick={onBackToDashboard}>Go to Brands</button>
          </div>
        ) : (
          <form className="ap-grid" onSubmit={handleAddProduct}>
            {/* Left Column */}
            <div className="ap-col-main">
              {/* General Info Card */}
              <div className="ap-card">
                <div className="ap-card-header">
                  <FaBoxOpen className="ap-card-icon" />
                  <h3>General Information</h3>
                </div>
                <div className="ap-card-body">
                  <div className="ap-form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      className="ap-input"
                      placeholder="e.g. Wireless Noise Cancelling Headphones"
                      value={newProduct.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="ap-form-group">
                    <label>Short Description *</label>
                    <textarea
                      className="ap-input"
                      rows="2"
                      placeholder="Brief overview for listing pages..."
                      value={newProduct.shortDescription}
                      onChange={(e) => handleChange('shortDescription', e.target.value)}
                      required
                    />
                  </div>
                  <div className="ap-form-group">
                    <label>Full Description *</label>
                    <textarea
                      className="ap-input"
                      rows="6"
                      placeholder="Detailed product specifications, features, etc."
                      value={newProduct.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory Card */}
              <div className="ap-card">
                <div className="ap-card-header">
                  <FaListUl className="ap-card-icon" />
                  <h3>Pricing & Inventory</h3>
                </div>
                <div className="ap-card-body">
                  <div className="ap-row-2">
                    <div className="ap-form-group">
                      <label>Base Price ($) *</label>
                      <input
                        type="number"
                        className="ap-input"
                        placeholder="0.00"
                        value={newProduct.price}
                        onChange={(e) => handleChange('price', e.target.value)}
                        required
                      />
                    </div>
                    <div className="ap-form-group">
                      <label>Discount (%)</label>
                      <input
                        type="number"
                        className="ap-input"
                        placeholder="0"
                        value={newProduct.discount}
                        onChange={(e) => handleChange('discount', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ap-row-2">
                    <div className="ap-form-group">
                      <label>Stock Quantity *</label>
                      <input
                        type="number"
                        className="ap-input"
                        placeholder="0"
                        value={newProduct.stock}
                        onChange={(e) => handleChange('stock', e.target.value)}
                        required
                      />
                    </div>
                    <div className="ap-form-group">
                      <label>SKU</label>
                      <input
                        type="text"
                        className="ap-input"
                        placeholder="Stock Keeping Unit"
                        value={newProduct.sku}
                        onChange={(e) => handleChange('sku', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="ap-col-sidebar">
              {/* Organization Card */}
              <div className="ap-card">
                <div className="ap-card-header">
                  <FaTag className="ap-card-icon" />
                  <h3>Organization</h3>
                </div>
                <div className="ap-card-body">
                  <div className="ap-form-group">
                    <label>Brand *</label>
                    <select
                      className="ap-select"
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      required
                    >
                      <option value="">Select Brand</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ap-form-group">
                    <label>Category *</label>
                    <input
                      type="text"
                      className="ap-input"
                      placeholder="e.g. Electronics"
                      value={newProduct.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      required
                    />
                  </div>

                  <div className="ap-form-group">
                    <label>Subcategory</label>
                    <input
                      type="text"
                      className="ap-input"
                      placeholder="e.g. Audio"
                      value={newProduct.subcategory}
                      onChange={(e) => handleChange('subcategory', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Media Card */}
              <div className="ap-card">
                <div className="ap-card-header">
                  <FaImage className="ap-card-icon" />
                  <h3>Product Media</h3>
                </div>
                <div className="ap-card-body">
                  <div className="ap-form-group">
                    <label>Image URL *</label>
                    <div className="ap-url-input-wrapper">
                      <input
                        type="url"
                        className="ap-input"
                        placeholder="https://..."
                        value={newProduct.image}
                        onChange={(e) => handleChange('image', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="ap-image-preview-area">
                    {newProduct.image ? (
                      <img src={newProduct.image} alt="Preview" className="ap-preview-img" onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                      <div className="ap-preview-placeholder">
                        <FaUpload />
                        <small>Preview will appear here</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Visibility Card */}
              <div className="ap-card">
                <div className="ap-card-header">
                  <FaCheck className="ap-card-icon" />
                  <h3>Visibility</h3>
                </div>
                <div className="ap-card-body">
                  <label className="ap-toggle-row">
                    <span>Available for Purchase</span>
                    <input
                      type="checkbox"
                      checked={newProduct.isAvailable}
                      onChange={(e) => handleChange('isAvailable', e.target.checked)}
                    />
                  </label>
                  <hr className="ap-divider" />
                  <label className="ap-toggle-row">
                    <span>Feature Product</span>
                    <input
                      type="checkbox"
                      checked={newProduct.isFeatured}
                      onChange={(e) => handleChange('isFeatured', e.target.checked)}
                    />
                  </label>
                </div>
              </div>

            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddProductPage;