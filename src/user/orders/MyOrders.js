import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyOrders.css";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expanded form states
  const [expandedAction, setExpandedAction] = useState({ type: null, itemId: null });
  // type: 'review', 'return', 'complaint'

  // Form inputs
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [complaintData, setComplaintData] = useState({
    complaintType: "",
    description: ""
  });

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  const complaintTypes = ['Fraud', 'Defective Product', 'Wrong Item', 'Late Delivery', 'Poor Quality', 'Missing Item', 'Other'];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/order/userid/${userId}`
        );
        // Sort by date descending if not already
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchOrders();
  }, [userId]);

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure want to cancel this order?")) return;

    try {
      // Optimistic UI Update Step 1: Immediately mark as cancelled locally
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.id === orderId) {
          // Update order status
          const updatedOrder = {
            ...order,
            status: 'Cancelled',
            paymentStatus: (order.paymentMethod === 'Cashfree' || order.paymentMethod === 'Online') ? 'Refund Initiated' : order.paymentStatus
          };
          // Update all items status for visual consistency
          updatedOrder.items = order.items.map(item => ({ ...item, status: 'Cancelled' }));
          return updatedOrder;
        }
        return order;
      }));

      // Call API
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/order/orderid/${orderId}/cancel`
      );

      // Success feedback (optional, maybe toast)
      // alert("Order cancelled Successfully"); 

    } catch (err) {
      console.error("Error in cancelling order", err);
      alert("Failed to cancel order. Please refresh and try again.");
      // Revert optimism if needed (complex, usually reload is enough on error)
      window.location.reload();
    }
  };

  const resetForms = () => {
    setRating(0);
    setComment("");
    setReturnReason("");
    setComplaintData({ complaintType: "", description: "" });
    setExpandedAction({ type: null, itemId: null });
  };

  const handleReviewSubmit = async (productId) => {
    if (!rating || !comment) return alert("Please provide both rating and comment.");
    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/review`, { productId, userId, rating, comment });
      alert("Review submitted successfully!");
      resetForms();
    } catch (err) {
      console.error("Error submitting review", err);
      alert("Failed to submit review.");
    }
  };

  const handleReturnSubmit = async (orderId, itemId) => {
    if (!returnReason) return alert("Please provide a reason for return.");
    try {
      // Optimistic UI Update: Add a pending return to the item
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map(item => {
              if (item.id === itemId) {
                return {
                  ...item,
                  returns: [{ status: 'Pending', reason: returnReason, createdAt: new Date().toISOString() }]
                };
              }
              return item;
            })
          };
        }
        return order;
      }));

      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/return/create`, { orderId, userId, reason: returnReason, orderItemId: itemId });
      alert("Return request submitted successfully!");
      resetForms();
    } catch (err) {
      console.error("Error submitting return request", err);
      alert("Failed to submit return.");
      // On error, a simple reload is often safest to restore state
      window.location.reload();
    }
  };

  const handleComplaintSubmit = async (orderItem) => {
    if (!complaintData.complaintType || !complaintData.description) return alert("Please fill in all complaint fields");
    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/complaint/create/usertoseller`, {
        raisedByUserId: parseInt(userId),
        againstSellerId: parseInt(orderItem.product.sellerId),
        orderId: parseInt(orderItem.orderId),
        productId: parseInt(orderItem.product.id),
        complaintType: complaintData.complaintType,
        description: complaintData.description
      });
      alert("Complaint submitted successfully!");
      resetForms();
    } catch (err) {
      console.error("Error submitting complaint", err);
      alert("Failed to submit complaint.");
    }
  };

  const isOrderCancelled = (order, item) => {
    return order.status === 'Cancelled' || item.status === 'Cancelled';
  };

  const isOnlinePaymentBase = (method) => {
    // Normalize method check
    if (!method) return false;
    const m = method.toLowerCase();
    return m === 'cashfree' || m === 'online' || m === 'card' || m === 'upi';
  };

  // Helper to determine if we show the "Refund Status" button
  const showRefundStatus = (order) => {
    const isCancelled = order.status === 'Cancelled' || order.paymentStatus === 'Refund Initiated' || order.paymentStatus === 'Refunded';
    const isOnline = isOnlinePaymentBase(order.paymentMethod); // Assuming 'Cashfree' or 'Online'
    return isCancelled && isOnline;
  };

  if (loading) {
    return (
      <div className="my-orders-container">
        <div className="loading-spinner-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <div className="my-orders-header">
        <h1>My Orders</h1>
        <p>Track your orders, returns, and history</p>
      </div>

      <div className="orders-grid">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Looks like you haven't placed any orders.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className={`order-group-card ${order.status === 'Cancelled' ? 'order-cancelled-group' : ''}`}>
              <div className="order-group-header">
                <div className="order-meta">
                  <span className="order-id">Order #{order.id}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="order-subtotal">Order Total: ₹{order.finalAmount}</div>

                {/* Order Level Status Badge */}
                {order.status === 'Cancelled' && (
                  <div className="order-cancelled-badge">Cancelled</div>
                )}
                {/* Refund Status Badge (if applicable) */}
                {showRefundStatus(order) && (
                  <div className="refund-status-badge">
                    {order.paymentStatus === 'Refunded' ? 'Refund Processed' : 'Refund Initiated'}
                  </div>
                )}
              </div>

              <div className="order-items-list">
                {order.items.map((item) => {
                  const isCancelled = isOrderCancelled(order, item);
                  const hasReturn = item.returns && item.returns.length > 0;
                  const returnStatus = hasReturn ? item.returns[item.returns.length - 1].status : null;
                  const showActions = !isCancelled && item.status === 'Delivered' && !hasReturn;
                  const showCancel = !isCancelled && item.status !== 'Delivered' && !hasReturn;

                  // Determine blurred state: Cancelled items are blurred, but the overlay sits on top
                  // Actually, we blur the content, keep actions/badges visible
                  return (
                    <div key={item.id} className={`order-item-card ${isCancelled ? 'item-cancelled' : ''}`}>

                      {/* Using a wrapper to blur content easily */}
                      <div className="item-content-wrapper">
                        <div className="item-image">
                          <img src={item.product.image} alt={item.product.name} />
                        </div>
                        <div className="item-details">
                          <h3>{item.product.name}</h3>
                          <p className="item-seller">Seller: {item.product.sellerId}</p>
                          <div className="item-price-qty">
                            <span>Qty: {item.quantity}</span>
                            <span className="price">₹{item.totalPrice}</span>
                          </div>
                          <div className={`status-badge status-${item.status.toLowerCase()}`}>
                            {item.status}
                          </div>
                          {hasReturn && (
                            <div className={`return-status-badge return-status-${returnStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                              Return: {returnStatus}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cancelled Overlay/Message */}
                      {isCancelled && (
                        <div className="cancelled-overlay">
                          <span>Order Cancelled</span>
                          {showRefundStatus(order) && (
                            <button className="refund-status-btn">
                              {order.paymentStatus === 'Refunded' ? 'Refunded' : 'Refund Status'}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Actions Toolbar */}
                      {!isCancelled && (
                        <div className="item-actions">
                          {showCancel && (
                            <button className="btn-cancel-order" onClick={() => deleteOrder(order.id)}>
                              Cancel Order
                            </button>
                          )}

                          {showActions && (
                            <>
                              <button
                                className="btn-action btn-review"
                                onClick={() => setExpandedAction(prev => prev.itemId === item.id && prev.type === 'review' ? { type: null, itemId: null } : { type: 'review', itemId: item.id })}
                              >
                                {expandedAction.itemId === item.id && expandedAction.type === 'review' ? 'Close' : 'Review'}
                              </button>
                              <button
                                className="btn-action btn-return"
                                onClick={() => setExpandedAction(prev => prev.itemId === item.id && prev.type === 'return' ? { type: null, itemId: null } : { type: 'return', itemId: item.id })}
                              >
                                {expandedAction.itemId === item.id && expandedAction.type === 'return' ? 'Close' : 'Return'}
                              </button>
                              <button
                                className="btn-action btn-complaint"
                                onClick={() => setExpandedAction(prev => prev.itemId === item.id && prev.type === 'complaint' ? { type: null, itemId: null } : { type: 'complaint', itemId: item.id })}
                              >
                                {expandedAction.itemId === item.id && expandedAction.type === 'complaint' ? 'Close' : 'Complaint'}
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Inline Forms */}
                      {expandedAction.itemId === item.id && (
                        <div className="action-form-container">
                          {expandedAction.type === 'review' && (
                            <div className="form-content">
                              <h4>Write a Review</h4>
                              <div className="star-rating">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span
                                    key={star}
                                    className={`star ${star <= rating ? 'filled' : ''}`}
                                    onClick={() => setRating(star)}
                                  >★</span>
                                ))}
                              </div>
                              <textarea placeholder="Your review..." value={comment} onChange={e => setComment(e.target.value)} />
                              <button onClick={() => handleReviewSubmit(item.product.id)}>Submit</button>
                            </div>
                          )}
                          {expandedAction.type === 'return' && (
                            <div className="form-content">
                              <h4>Return Request</h4>
                              <textarea placeholder="Reason for return..." value={returnReason} onChange={e => setReturnReason(e.target.value)} />
                              <button onClick={() => handleReturnSubmit(order.id, item.id)}>Submit Return</button>
                            </div>
                          )}
                          {expandedAction.type === 'complaint' && (
                            <div className="form-content">
                              <h4>File Complaint</h4>
                              <select value={complaintData.complaintType} onChange={e => setComplaintData({ ...complaintData, complaintType: e.target.value })}>
                                <option value="">Select Type</option>
                                {complaintTypes.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <textarea placeholder="Description..." value={complaintData.description} onChange={e => setComplaintData({ ...complaintData, description: e.target.value })} />
                              <button onClick={() => handleComplaintSubmit(item)}>Submit Complaint</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyOrders;