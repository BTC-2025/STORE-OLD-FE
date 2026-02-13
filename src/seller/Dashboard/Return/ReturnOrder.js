import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaUndo,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from "react-icons/fa";
import "./ReturnOrder.css";

const COMPLAINT_TYPES = [
  "Fraud",
  "Counterfeit",
  "Payment",
  "Harassment",
  "PolicyViolation",
  "Other",
];

const ReturnOrder = ({ onBackToDashboard }) => {
  const [returnItems, setReturnItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [complaintType, setComplaintType] = useState("Fraud");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const sellerData = JSON.parse(localStorage.getItem("sellerData"));
    if (!sellerData || !sellerData.id) {
      console.error("Seller ID not found in localStorage");
      setLoading(false);
      return;
    }

    const fetchReturns = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/return/sellerid/${sellerData.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch return items");
        }

        const data = await response.json();
        setReturnItems(data.returnItems || []);
      } catch (err) {
        console.error("Error fetching return items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

  const handleRaiseComplaint = (item) => {
    setSelectedItem(item);
    setComplaintType("Fraud");
    setDescription("");
    setShowComplaintForm(true);
  };

  const submitComplaint = async () => {
    if (!selectedItem) return;

    const sellerData = JSON.parse(localStorage.getItem("sellerData"));

    // Structure payload based on the return item data
    // selectedItem is the Return object including OrderItem and Product
    const payload = {
      raisedBySellerId: sellerData.id,
      againstUserId: selectedItem.userId,
      orderId: selectedItem.orderItem?.orderId,
      productId: selectedItem.orderItem?.productId,
      complaintType,
      description,
    };

    try {
      setSubmitting(true);
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/complaint/create/sellertouser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert("Complaint raised successfully!");
        setShowComplaintForm(false);
      } else {
        alert(result.message || "Failed to raise complaint.");
      }
    } catch (error) {
      console.error("Error raising complaint:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="ro-badge ro-pending"><FaClock /> Pending</span>;
      case "Approved":
        return <span className="ro-badge ro-approved"><FaCheckCircle /> Approved</span>;
      case "Rejected":
        return <span className="ro-badge ro-rejected"><FaTimesCircle /> Rejected</span>;
      case "Completed":
        return <span className="ro-badge ro-completed"><FaCheckCircle /> Completed</span>;
      default:
        return <span className="ro-badge ro-default">{status}</span>;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="ro-loading">
        <div className="loading-spinner"></div>
        <p>Loading returns...</p>
      </div>
    );
  }

  return (
    <div className="ro-page">
      <div className="ro-container">
        <header className="ro-header">
          <button className="ro-back-btn" onClick={onBackToDashboard}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="ro-title-section">
            <h1>Returned Orders</h1>
            <p className="ro-subtitle">Manage customer returns and disputes</p>
          </div>
        </header>

        <div className="ro-content-card">
          {returnItems.length === 0 ? (
            <div className="ro-empty-state">
              <div className="ro-empty-icon"><FaUndo /></div>
              <h3>No Returns Found</h3>
              <p>You don't have any returned orders yet.</p>
            </div>
          ) : (
            <div className="ro-table-responsive">
              <table className="ro-table">
                <thead>
                  <tr>
                    <th>Return ID</th>
                    <th>Product</th>
                    <th>Reason</th>
                    <th>Refund Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returnItems.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium">#{item.id}</td>
                      <td>
                        <div className="ro-product-info">
                          <span className="ro-product-name">{item.orderItem?.product?.name || "Unknown Product"}</span>
                          <span className="ro-order-ref">Order #{item.orderItem?.order?.id}</span>
                        </div>
                      </td>
                      <td className="ro-reason-cell">
                        <p title={item.reason}>{item.reason?.substring(0, 50)}{item.reason?.length > 50 ? '...' : ''}</p>
                      </td>
                      <td className="font-medium">
                        {item.orderItem ? formatCurrency(item.orderItem.totalPrice) : 'N/A'}
                      </td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td className="ro-date-cell">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="text-right">
                        <button
                          className="ro-btn-complaint"
                          onClick={() => handleRaiseComplaint(item)}
                          title="Raise Complaint"
                        >
                          <FaExclamationCircle /> Dispute
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

      {/* Complaint Modal */}
      {showComplaintForm && (
        <div className="ro-modal-overlay">
          <div className="ro-modal">
            <div className="ro-modal-header">
              <h3>Raise Complaint</h3>
              <button className="ro-modal-close" onClick={() => setShowComplaintForm(false)}>×</button>
            </div>
            <div className="ro-modal-body">
              <div className="ro-form-group">
                <label>Complaint Type</label>
                <select
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className="ro-select"
                >
                  {COMPLAINT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ro-form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue with this return..."
                  className="ro-textarea"
                />
              </div>
            </div>
            <div className="ro-modal-footer">
              <button className="ro-btn-secondary" onClick={() => setShowComplaintForm(false)}>
                Cancel
              </button>
              <button
                className="ro-btn-primary"
                onClick={submitComplaint}
                disabled={submitting || !description}
              >
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnOrder;