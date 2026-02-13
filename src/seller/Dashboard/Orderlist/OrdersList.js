import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaFilter, FaBoxOpen, FaTimes } from 'react-icons/fa';
import './OrdersList.css';

const OrdersList = ({ sellerToken, onBackToDashboard }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('All');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/seller/ordereditems`, {
          headers: {
            'Authorization': `Bearer ${sellerToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);

        setLoading(false);
      }
    };

    fetchOrders();
  }, [sellerToken]);

  // Apply filter when filterStatus changes
  useEffect(() => {
    if (filterStatus === 'All') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(item => item.status === filterStatus));
    }
  }, [filterStatus, orders]);

  // Fetch order details when view is clicked
  const fetchOrderDetails = async (orderItemId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/order/orderitems/${orderItemId}`, {
        headers: {
          'Authorization': `Bearer ${sellerToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setSelectedOrder(data);
      setNewStatus(data.status); // Set initial status for the form
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);

    }
  };

  // Update order status
  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/order/update/orderitem/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sellerToken}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update the order in the local state
      const updatedOrders = orders.map(order =>
        order.id === selectedOrder.id ? { ...order, status: newStatus } : order
      );

      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      setUpdatingStatus(false);
      setShowModal(false);

      // Show success message (could be a toast in a real app)
      alert("Status Updated Successfully!");

    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const updateStatusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="ol-page">
      <div className="ol-container">
        {/* Header */}
        <header className="ol-header">
          <div className="ol-header-top">
            <button className="ol-back-btn" onClick={onBackToDashboard}>
              <FaArrowLeft /> Back
            </button>
            <div className="ol-actions">
              <div className="ol-filter-wrapper">
                <FaFilter className="ol-filter-icon" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="ol-status-filter"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="ol-title-section">
            <h1>Order Management</h1>
            <p className="ol-subtitle">Track and manage your customer orders</p>
          </div>
        </header>

        {/* Orders Table/List */}
        <div className="ol-content-card">
          {filteredOrders.length === 0 ? (
            <div className="ol-empty-state">
              <div className="ol-empty-icon"><FaBoxOpen /></div>
              <h3>No Orders Found</h3>
              <p>No orders match the selected filter status.</p>
            </div>
          ) : (
            <div className="ol-table-responsive">
              <table className="ol-table">
                <thead>
                  <tr>
                    <th>Order Item ID</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(item => (
                    <tr key={item.id} className="ol-table-row">
                      <td className="font-medium">#{item.id}</td>
                      <td>
                        <div className="ol-product-cell">
                          <div className="ol-product-info">
                            <span className="ol-product-name">{item.product?.name || 'Unknown Product'}</span>
                            <span className="ol-product-qty">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </td>
                      <td className="font-medium">{formatCurrency(item.totalPrice)}</td>
                      <td>
                        <span className={`ol-status-badge ${getStatusColor(item.status)}`}>
                          {item.status || 'Pending'}
                        </span>
                      </td>
                      <td className="ol-date-cell">{formatDate(item.createdAt)}</td>
                      <td className="text-right">
                        <button
                          className="ol-btn-view"
                          onClick={() => fetchOrderDetails(item.id)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="ol-modal-overlay">
          <div className="ol-modal">
            <div className="ol-modal-header">
              <div className="ol-modal-title">
                <FaBoxOpen className="text-indigo-600" />
                <h3>Order #{selectedOrder.id}</h3>
              </div>
              <button className="ol-modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="ol-modal-body">
              {/* Status Update Section */}
              <div className="ol-status-update-section">
                <label className="ol-label">Update Status</label>
                <div className="ol-status-control">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="ol-status-select"
                  >
                    {updateStatusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    className="ol-btn-update"
                    onClick={updateOrderStatus}
                    disabled={updatingStatus || newStatus === selectedOrder.status}
                  >
                    {updatingStatus ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>

              <hr className="ol-runner" />

              <div className="ol-details-grid">
                <div className="ol-detail-item">
                  <label>Product</label>
                  <p className="font-medium">{selectedOrder.product?.name}</p>
                </div>
                <div className="ol-detail-item">
                  <label>Quantity</label>
                  <p>{selectedOrder.quantity}</p>
                </div>
                <div className="ol-detail-item">
                  <label>Unit Price</label>
                  <p>{formatCurrency(selectedOrder.price)}</p>
                </div>
                <div className="ol-detail-item">
                  <label>Total Amount</label>
                  <p className="font-bold text-indigo-600">{formatCurrency(selectedOrder.totalPrice)}</p>
                </div>
                <div className="ol-detail-item">
                  <label>Order Date</label>
                  <p>{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="ol-detail-item">
                  <label>Current Status</label>
                  <span className={`ol-status-badge inline-flex ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="ol-modal-footer">
              <button className="ol-btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;