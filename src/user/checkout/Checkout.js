import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { load } from '@cashfreepayments/cashfree-js';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
  const [product, setProduct] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState(''); // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null); // Applied coupon details
  const [discountAmount, setDiscountAmount] = useState(0);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);
  const paymentSessionIdRef = React.useRef(null); // Track payment session to prevent duplicates

  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    label: 'Home'
  });

  const [paymentMethod, setPaymentMethod] = useState("Cashfree"); // Default to Online

  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  // Load Cashfree SDK
  const [cashfree, setCashfree] = useState(null);
  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        const cashfreeInstance = await load({ mode: "sandbox" });
        setCashfree(cashfreeInstance);
      } catch (error) {
        console.error("Cashfree failed to load", error);
      }
    };
    initializeCashfree();
  }, []);

  // Fetch product details & reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BASE_URL}/api/product/${id}`),
          axios.get(`${process.env.REACT_APP_BASE_URL}/api/review/product/${id}`)
        ]);
        setProduct(productRes.data);
        // reviews removed
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Fetch addresses
  useEffect(() => {
    if (user) {
      axios.get(`${process.env.REACT_APP_BASE_URL}/api/address/${user.id}`)
        .then(res => {
          setAddresses(res.data);
          if (res.data.length > 0) setSelectedAddress(res.data[0].id);
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  // Handle Coupon Verification
  const handleApplyCoupon = async () => {
    if (!couponCode) return toast.error("Please enter a coupon code");

    setVerifyingCoupon(true);
    try {
      const unitPrice = product.price - (product.price * (product.discount / 100));
      const totalAmount = unitPrice * quantity;

      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/coupon/verify`, {
        code: couponCode,
        amount: totalAmount
      });

      if (response.data.valid) {
        setAppliedCoupon(response.data);
        setDiscountAmount(response.data.discount);
        toast.success(response.data.message);
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        toast.error("Invalid Coupon");
      }
    } catch (error) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      toast.error(error.response?.data?.message || "Failed to verify coupon");
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    toast.success("Coupon removed");
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === "Cashfree" && !cashfree) return toast.error("Payment system loading, please wait...");
    if (!selectedAddress) return toast.error("Please select a shipping address");

    try {
      // 1. Create Order (Buy Now)
      const orderData = {
        userId: user.id,
        productId: product.id,
        quantity: quantity,
        addressId: selectedAddress,
        couponCode: appliedCoupon ? couponCode : null, // Pass coupon code
        paymentMethod: paymentMethod, // Use selected method
        shippingAddress: addresses.find(a => a.id === selectedAddress) // Use loose equality for safety
      };

      const orderResponse = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/order/buy-now`,
        orderData
      );

      // Handle Cashfree Online Payment (Temp Order)
      if (orderResponse.data.tempOrder) {
        // Check if we already have a session for this order to prevent duplicates
        if (paymentSessionIdRef.current) {
          await cashfree.checkout({
            paymentSessionId: paymentSessionIdRef.current,
            redirectTarget: "_self"
          });
          return;
        }

        const paymentResponse = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/api/payment/create`,
          {
            ...orderResponse.data.tempOrder,
            addressId: selectedAddress // Ensure addressId is passed
          }
        );

        if (paymentResponse.data.payment_session_id) {
          paymentSessionIdRef.current = paymentResponse.data.payment_session_id; // Store session ID
          // Start Cashfree Checkout
          await cashfree.checkout({
            paymentSessionId: paymentResponse.data.payment_session_id,
            redirectTarget: "_self"
          });
        } else {
          toast.error("Failed to initiate payment session");
        }
      }
      // Handle COD / Wallet (Immediate Order Creation)
      else if (orderResponse.status === 201 && orderResponse.data.orderId) {
        toast.success("Order Placed Successfully!");
        navigate(`/order-success?orderId=${orderResponse.data.orderId}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.response && error.response.data) {
        console.error("Server Error Details:", error.response.data);
      }
      toast.error(error.response?.data?.error || "Failed to place order");
    }
  };

  // ... (Address handlers: handleNewAddressChange, handleAddAddress - simplified for brevity logic remains mostly same)


  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/address`, { ...newAddress, userId: user.id });
      setAddresses([...addresses, res.data]);
      setSelectedAddress(res.data.id);
      setShowAddressForm(false);
      setNewAddress({ street: '', city: '', state: '', postalCode: '', country: 'India', label: 'Home' });
      toast.success("Address added");
    } catch (error) { toast.error("Failed to add address"); }
  };

  if (loading) return <div className="checkout-loading-container"><div className="checkout-spinner"></div><p>Loading...</p></div>;

  // Calculations
  const unitPrice = product.price - (product.price * (product.discount / 100));
  const itemTotal = unitPrice * quantity;
  const deliveryCharge = itemTotal > 500 ? 0 : 40; // Example delivery logic
  const tax = (itemTotal - discountAmount) * 0.18; // 18% GST example
  const finalTotal = itemTotal - discountAmount + deliveryCharge + tax;

  return (
    <div className="checkout-container">
      <div className="checkout-content mt-3">
        {/* Left Column */}
        <div className="checkout-left">
          {/* Product Details */}
          <div className="elegant-card">
            <div className="cards-header elegant-header"><h2>Product Details</h2></div>
            <div className="card-body">
              <div className="product-display">
                <div className="products-image-container">
                  <img src={product.image} alt={product.name} className="product-image" />
                  {product.discount > 0 && <div className="discounts-badge">-{product.discount}%</div>}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <div className="price-details">
                    <span className="final-price">₹{unitPrice.toFixed(2)}</span>
                    {product.discount > 0 && <span className="original-price">₹{product.price}</span>}
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="quantity-selector mt-3">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button className="quantity-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}><i className="fas fa-minus"></i></button>
                  <input type="number" readOnly value={quantity} className="quantity-input" />
                  <button className="quantity-btn" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}><i className="fas fa-plus"></i></button>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="elegant-card mt-3">
            <div className="cards-header elegant-header">
              <h2>Shipping Address</h2>
              <button className="icon-button" onClick={() => setShowAddressForm(!showAddressForm)}>
                <i className={`fas ${showAddressForm ? 'fa-times' : 'fa-plus'}`}></i> {showAddressForm ? 'Cancel' : 'Add New'}
              </button>
            </div>
            <div className="card-body">
              {!showAddressForm ? (
                addresses.length > 0 ? (
                  <div className="address-list">
                    {addresses.map(addr => (
                      <div key={addr.id} className={`address-item ${selectedAddress === addr.id ? 'selected' : ''}`} onClick={() => setSelectedAddress(addr.id)}>
                        <input type="radio" checked={selectedAddress === addr.id} readOnly />
                        <div className="address-details ms-2">
                          <strong>{addr.label}</strong>
                          <p>{addr.street}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="no-addresses">No addresses found. Please add one.</p>
              ) : (
                <form onSubmit={handleAddAddress} className="address-form">
                  {/* Simplified Form Fields */}
                  <input className="form-control mb-2" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} required />
                  <div className="d-flex gap-2">
                    <input className="form-control mb-2" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                    <input className="form-control mb-2" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                  </div>
                  <div className="d-flex gap-2">
                    <input className="form-control mb-2" placeholder="Postal Code" value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} required />
                    <select className="form-control mb-2" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}>
                      <option>Home</option><option>Work</option><option>Other</option>
                    </select>
                  </div>
                  <button type="submit" className="save-address-btn w-100">Save Address</button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Payment */}
        <div className="checkout-right">
          <div className="elegant-card order-summary">
            <div className="cards-header elegant-header"><h2>Order Summary</h2></div>
            <div className="card-body">
              {/* Price Breakdown */}
              <div className="summary-row"><span>Item Total</span><span>₹{itemTotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>Delivery</span><span className={deliveryCharge === 0 ? 'text-success' : ''}>{deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}</span></div>
              <div className="summary-row"><span>Tax (18% GST)</span><span>₹{tax.toFixed(2)}</span></div>

              {/* Coupon Section */}
              <div className="coupon-section mt-3 mb-3">
                {!appliedCoupon ? (
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="coupon-input"
                    />
                    <button className="apply-coupon-btn" onClick={handleApplyCoupon} disabled={verifyingCoupon}>
                      {verifyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="coupon-applied">
                    <span>Code: <strong>{couponCode}</strong> applied</span>
                    <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>&times;</button>
                  </div>
                )}
              </div>

              {appliedCoupon && (
                <div className="summary-row discount">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-total">
                <span>Total Payable</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>

              {/* Payment Method Selection */}
              <div className="payment-method-selection mt-4">
                <h4>Select Payment Method</h4>
                <div className="payment-options">
                  <div className={`payment-option ${paymentMethod === 'Cashfree' ? 'selected' : ''}`} onClick={() => setPaymentMethod('Cashfree')}>
                    <input type="radio" checked={paymentMethod === 'Cashfree'} readOnly />
                    <span className="ms-2"><i className="fas fa-credit-card me-2"></i>Pay Online (Card/UPI/NetBanking)</span>
                  </div>
                  <div className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`} onClick={() => setPaymentMethod('COD')}>
                    <input type="radio" checked={paymentMethod === 'COD'} readOnly />
                    <span className="ms-2"><i className="fas fa-money-bill-wave me-2"></i>Cash on Delivery</span>
                  </div>
                </div>
              </div>

              <div className="payment-method-info mt-3">
                {paymentMethod === 'Cashfree' ? (
                  <p><i className="fas fa-lock"></i> Secured by Cashfree Payments</p>
                ) : (
                  <p><i className="fas fa-truck"></i> Pay cash upon delivery</p>
                )}
              </div>

              {product && product.stock < 1 ? (
                <div className="alert alert-danger mt-3">Out of Stock</div>
              ) : (
                <button className="place-order-btn mt-3" onClick={handlePlaceOrder} disabled={!selectedAddress || (product && product.stock < quantity)}>
                  {paymentMethod === 'COD' ? 'Place Order' : `Proceed to Pay ₹${finalTotal.toFixed(2)}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;