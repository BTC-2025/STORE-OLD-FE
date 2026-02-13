import React, { useState, useEffect } from 'react';
import {
  FaSignOutAlt,
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaChartLine,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaArrowLeft,
  FaUserCheck,
  FaUserSlash,
  FaTrash,
  FaEdit,
  FaEye,
  FaTimes,
  FaStore,
  FaUserTie,
  FaExclamationTriangle
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalSellers: 0,
    recentActivity: [],
    revenue: 0,
    growth: {
      users: 0,
      products: 0,
      orders: 0,
      sellers: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  // User Management State
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [, setUserActionLoading] = useState({}); // eslint-disable-next-line
  const [showUserConfirmDialog, setShowUserConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActionType, setUserActionType] = useState(''); // eslint-disable-next-line

  // Product Management State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [, setProductActionLoading] = useState({}); // eslint-disable-next-line
  const [showProductConfirmDialog, setShowProductConfirmDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [, setProductActionType] = useState(''); // eslint-disable-next-line

  // Seller Management State
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [sellerSearchTerm, setSellerSearchTerm] = useState('');
  const [, setSellerActionLoading] = useState({}); // eslint-disable-next-line
  const [showSellerConfirmDialog, setShowSellerConfirmDialog] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerActionType, setSellerActionType] = useState('');
  const [sellerRequests, setSellerRequests] = useState([]);
  const [showSellerRequests, setShowSellerRequests] = useState(false);
  const [, setSelectedRequest] = useState(null); // eslint-disable-next-line
  const [showRequestDetail, setShowRequestDetail] = useState(false);
  const [sellerDetail, setSellerDetail] = useState(null);

  // Complaints Management State
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [complaintSearchTerm, setComplaintSearchTerm] = useState('');
  const [complaintStatusFilter] = useState('all');
  const [complaintPriorityFilter] = useState('all');
  const [, setComplaintActionLoading] = useState({}); // eslint-disable-next-line
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintDetail, setShowComplaintDetail] = useState(false);
  const [showUpdateComplaintModal, setShowUpdateComplaintModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('Pending');
  const [updatePriority, setUpdatePriority] = useState('Medium');
  const [updateResolutionNote, setUpdateResolutionNote] = useState('');

  // Orders Management State
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');

  const filterUsers = React.useCallback(() => {
    if (!userSearchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = userSearchTerm.toLowerCase();
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phoneNumber.includes(term)
    );

    setFilteredUsers(filtered);
  }, [users, userSearchTerm]);

  const filterProducts = React.useCallback(() => {
    if (!productSearchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const term = productSearchTerm.toLowerCase();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.subcategory.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term)
    );

    setFilteredProducts(filtered);
  }, [products, productSearchTerm]);

  const filterSellers = React.useCallback(() => {
    if (!sellerSearchTerm.trim()) {
      setFilteredSellers(sellers);
      return;
    }

    const term = sellerSearchTerm.toLowerCase();
    const filtered = sellers.filter(seller =>
      seller.name.toLowerCase().includes(term) ||
      seller.email.toLowerCase().includes(term) ||
      seller.businessName.toLowerCase().includes(term) ||
      seller.businessType.toLowerCase().includes(term)
    );

    setFilteredSellers(filtered);
  }, [sellers, sellerSearchTerm]);

  const filterComplaints = React.useCallback(() => {
    let filtered = [...complaints];

    if (complaintSearchTerm.trim()) {
      const term = complaintSearchTerm.toLowerCase();
      filtered = filtered.filter(complaint =>
        complaint.complaintType.toLowerCase().includes(term) ||
        complaint.description.toLowerCase().includes(term) ||
        (complaint.raisedByUser && complaint.raisedByUser.name.toLowerCase().includes(term)) ||
        (complaint.raisedBySeller && complaint.raisedBySeller.name.toLowerCase().includes(term)) ||
        (complaint.againstUser && complaint.againstUser.name.toLowerCase().includes(term)) ||
        (complaint.againstSeller && complaint.againstSeller.name.toLowerCase().includes(term))
      );
    }

    if (complaintStatusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === complaintStatusFilter);
    }

    if (complaintPriorityFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === complaintPriorityFilter);
    }

    setFilteredComplaints(filtered);
  }, [complaints, complaintSearchTerm, complaintStatusFilter, complaintPriorityFilter]);

  const filterOrders = React.useCallback(() => {
    if (!orderSearchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const term = orderSearchTerm.toLowerCase();
    const filtered = orders.filter(order =>
      order.id.toString().includes(term) ||
      (order.user && order.user.name.toLowerCase().includes(term)) ||
      (order.user && order.user.email.toLowerCase().includes(term))
    );

    setFilteredOrders(filtered);
  }, [orders, orderSearchTerm]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (currentView === 'users') {
      fetchUsers();
    } else if (currentView === 'products') {
      fetchProducts();
    } else if (currentView === 'sellers') {
      fetchSellers();
    } else if (currentView === 'complaints') {
      fetchComplaints();
    } else if (currentView === 'orders') {
      fetchOrders();
    }
  }, [currentView]);

  useEffect(() => {
  }, [filterUsers]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  useEffect(() => {
    filterSellers();
  }, [filterSellers]);

  useEffect(() => {
    filterComplaints();
  }, [filterComplaints]);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/admin/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        setDashboardData({
          totalUsers: data.totalUsers || 0,
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          totalSellers: data.totalSellers || 0,
          recentActivity: data.recentActivity || [],
          revenue: data.revenue || 0,
          growth: data.growth || {
            users: 0,
            products: 0,
            orders: 0,
            sellers: 0
          }
        });
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/auth`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/product`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data)) {
        setProducts(data);
        setFilteredProducts(data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
    }
  };

  const fetchSellers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/admin/seller/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data) {
        const approvedSellers = data.data.filter(seller => seller.isActive);
        const sellerRequests = data.data.filter(seller => !seller.isActive);

        setSellers(approvedSellers);
        setFilteredSellers(approvedSellers);
        setSellerRequests(sellerRequests);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to fetch sellers. Please try again.');
    }
  };

  const fetchSellerDetail = async (sellerId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/seller/get/sellerid/${sellerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSellerDetail(data);
    } catch (err) {
      setError('Failed to fetch seller details. Please try again.');
    }
  };

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/complaint/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data) {
        setComplaints(data.data);
        setFilteredComplaints(data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to fetch complaints. Please try again.');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/order/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.orders) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
    }
  };

  const updateComplaintStatus = async (complaintId, updateData) => {
    setComplaintActionLoading(prev => ({ ...prev, [complaintId]: true }));

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/complaint/update/status/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        fetchComplaints();
        setShowUpdateComplaintModal(false);
        setShowComplaintDetail(false);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update complaint');
      }
    } catch (err) {
      setError(err.message || 'Failed to update complaint. Please try again.');
    } finally {
      setComplaintActionLoading(prev => ({ ...prev, [complaintId]: false }));
    }
  };

  const handleBlockSeller = async (sellerId) => {
    setSellerActionLoading(prev => ({ ...prev, [sellerId]: true }));

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/admin/${sellerId}/block`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isBlocked: true }),
        }
      );

      if (response.ok) {
        setSellers(prevSellers =>
          prevSellers.map(seller =>
            seller.id === sellerId ? { ...seller, isBlocked: true } : seller
          )
        );
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to block seller');
      }
    } catch (err) {
      setError(err.message || 'Failed to block seller. Please try again.');
    } finally {
      setSellerActionLoading(prev => ({ ...prev, [sellerId]: false }));
    }
  };

  const handleUnblockSeller = async (sellerId) => {
    setSellerActionLoading(prev => ({ ...prev, [sellerId]: true }));

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/admin/${sellerId}/block`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked: false }),
      });

      if (response.ok) {
        setSellers(prevSellers =>
          prevSellers.map(seller =>
            seller.id === sellerId ? { ...seller, isBlocked: false } : seller
          )
        );
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to unblock seller');
      }
    } catch (err) {
      setError(err.message || 'Failed to unblock seller. Please try again.');
    } finally {
      setSellerActionLoading(prev => ({ ...prev, [sellerId]: false }));
    }
  };

  const handleRemoveSeller = async (sellerId) => {
    setSellerActionLoading(prev => ({ ...prev, [sellerId]: true }));

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/seller/delete/${sellerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setSellers(prevSellers => prevSellers.filter(seller => seller.id !== sellerId));
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete seller');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete seller. Please try again.');
    } finally {
      setSellerActionLoading(prev => ({ ...prev, [sellerId]: false }));
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/admin/seller/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setSellerRequests(prev => prev.filter(req => req.id !== requestId));
        setShowRequestDetail(false);
        fetchSellers();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to accept seller request');
      }
    } catch (err) {
      setError(err.message || 'Failed to accept seller request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/seller/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setSellerRequests(prev => prev.filter(req => req.id !== requestId));
        setShowRequestDetail(false);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reject seller request');
      }
    } catch (err) {
      setError(err.message || 'Failed to reject seller request. Please try again.');
    }
  };



  const handleUserSearch = (e) => {
    setUserSearchTerm(e.target.value);
  };

  const handleProductSearch = (e) => {
    setProductSearchTerm(e.target.value);
  };

  const handleSellerSearch = (e) => {
    setSellerSearchTerm(e.target.value);
  };

  const handleComplaintSearch = (e) => {
    setComplaintSearchTerm(e.target.value);
  };

  const handleOrderSearch = (e) => {
    setOrderSearchTerm(e.target.value);
  };



  const handleBlockUser = async (userId) => {
    setUserActionLoading(prev => ({ ...prev, [userId]: true }));

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/admin/block/userid/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, isBlocked: true } : user
          )
        );
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to block user');
      }
    } catch (err) {
      setError(err.message || 'Failed to block user. Please try again.');
    } finally {
      setUserActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnblockUser = async (userId) => {
    setUserActionLoading(prev => ({ ...prev, [userId]: true }));

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/admin/unblock/userid/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, isBlocked: false } : user
          )
        );
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to unblock user');
      }
    } catch (err) {
      setError(err.message || 'Failed to unblock user. Please try again.');
    } finally {
      setUserActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteProduct = async (productId) => {
    setProductActionLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/product/productid/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete product');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete product. Please try again.');
    } finally {
      setProductActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const confirmUserAction = (user, type) => {
    setSelectedUser(user);
    setUserActionType(type);
    setShowUserConfirmDialog(true);
  };

  const confirmProductAction = (product, type) => {
    setSelectedProduct(product);
    setProductActionType(type);
    setShowProductConfirmDialog(true);
  };

  const confirmSellerAction = (seller, type) => {
    setSelectedSeller(seller);
    setSellerActionType(type);
    setShowSellerConfirmDialog(true);
  };

  const handleRemoveUser = async () => {
    if (!selectedUser) return;

    setUserActionLoading(prev => ({ ...prev, [selectedUser.id]: true }));
    setShowUserConfirmDialog(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to remove user. Please try again.');
    } finally {
      setUserActionLoading(prev => ({ ...prev, [selectedUser.id]: false }));
    }
  };

  const handleRemoveSellerConfirm = () => {
    if (!selectedSeller) return;
    handleRemoveSeller(selectedSeller.id);
    setShowSellerConfirmDialog(false);
  };

  const viewRequestDetails = async (request) => {
    setSelectedRequest(request);
    await fetchSellerDetail(request.id);
    setShowRequestDetail(true);
  };

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintDetail(true);
  };

  const openUpdateComplaintModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateStatus(complaint.status);
    setUpdatePriority(complaint.priority);
    setUpdateResolutionNote(complaint.resolutionNote || '');
    setShowUpdateComplaintModal(true);
  };

  const handleUpdateComplaint = () => {
    const adminId = 1;
    const updateData = {
      status: updateStatus,
      priority: updatePriority,
      resolvedBy: updateStatus === 'Resolved' ? adminId : null,
      resolutionNote: updateResolutionNote
    };

    updateComplaintStatus(selectedComplaint.id, updateData);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const StatCard = ({ title, value, icon, growth, color, onClick }) => (
    <div className={`advanced-stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="stat-card-header">
        <div className={`stat-icon ${color}`}>
          {icon}
        </div>
        <div className={`growth-indicator ${growth >= 0 ? 'positive' : 'negative'}`}>
          {growth > 0 ? `+${growth}%` : `${growth}%`}
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );

  const switchToUserManagement = () => {
    setCurrentView('users');
    setActiveTab('users');
  };

  const switchToProductManagement = () => {
    setCurrentView('products');
    setActiveTab('products');
  };

  const switchToSellerManagement = () => {
    setCurrentView('sellers');
    setActiveTab('sellers');
  };

  const switchToComplaintsManagement = () => {
    setCurrentView('complaints');
    setActiveTab('complaints');
  };

  const switchToOrderManagement = () => {
    setCurrentView('orders');
    setActiveTab('orders');
  };

  const switchToDashboard = () => {
    setCurrentView('dashboard');
    setActiveTab('overview');
  };

  if (loading && currentView === 'dashboard') {
    return (
      <div className="advanced-dashboard-loader">
        <div className="loader-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="advanced-dashboard-container">
      {/* Sidebar */}
      <aside className={`advanced-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">AdminPanel</h2>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === 'overview' ? 'active' : ''}>
              <a href="#overview" onClick={() => { setActiveTab('overview'); switchToDashboard(); }}>
                <FaChartLine className="nav-icon" />
                <span className="nav-text">Overview</span>
              </a>
            </li>
            <li className={activeTab === 'users' ? 'active' : ''}>
              <a href="#users" onClick={() => { setActiveTab('users'); switchToUserManagement(); }}>
                <FaUsers className="nav-icon" />
                <span className="nav-text">Users</span>
              </a>
            </li>
            <li className={activeTab === 'products' ? 'active' : ''}>
              <a href="#products" onClick={() => { setActiveTab('products'); switchToProductManagement(); }}>
                <FaBox className="nav-icon" />
                <span className="nav-text">Products</span>
              </a>
            </li>
            <li className={activeTab === 'sellers' ? 'active' : ''}>
              <a href="#sellers" onClick={() => { setActiveTab('sellers'); switchToSellerManagement(); }}>
                <FaStore className="nav-icon" />
                <span className="nav-text">Sellers</span>
              </a>
            </li>
            <li className={activeTab === 'orders' ? 'active' : ''}>
              <a href="#orders" onClick={() => { setActiveTab('orders'); switchToOrderManagement(); }}>
                <FaShoppingCart className="nav-icon" />
                <span className="nav-text">Orders</span>
              </a>
            </li>
            <li className={activeTab === 'complaints' ? 'active' : ''}>
              <a href="#complaints" onClick={() => { setActiveTab('complaints'); switchToComplaintsManagement(); }}>
                <FaExclamationTriangle className="nav-icon" />
                <span className="nav-text">Complaints</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={onLogout}>
            <FaSignOutAlt className="nav-icon" />
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="advanced-main-content">
        {/* Header */}
        <header className="advanced-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '≡' : '≡'}
          </button>

          <div className="header-search">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search global..." className="search-input" />
          </div>

          <div className="header-actions">
            <button className="header-btn notification-btn">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            <div className="user-profile">
              <FaUserCircle className="user-avatar" />
              <span className="user-name">Admin User</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {currentView === 'dashboard' ? (
          <div className="dashboard-content">
            <div className="content-header">
              <h1 className="page-title">Overview</h1>
              <p className="page-subtitle">Welcome back! Here's what's happening with your store today.</p>
            </div>

            {error && (
              <div className="advanced-error-alert">
                <span>{error}</span>
                <button onClick={() => setError('')}>×</button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
              <StatCard
                title="Total Users"
                value={dashboardData.totalUsers}
                icon={<FaUsers />}
                growth={dashboardData.growth?.users || 0}
                color="blue"
                onClick={switchToUserManagement}
              />
              <StatCard
                title="Total Products"
                value={dashboardData.totalProducts}
                icon={<FaBox />}
                growth={dashboardData.growth?.products || 0}
                color="green"
                onClick={switchToProductManagement}
              />
              <StatCard
                title="Total Orders"
                value={dashboardData.totalOrders}
                icon={<FaShoppingCart />}
                growth={dashboardData.growth?.orders || 0}
                color="purple"
              />
              <StatCard
                title="Total Sellers"
                value={dashboardData.totalSellers}
                icon={<FaStore />}
                growth={dashboardData.growth?.sellers || 0}
                color="orange"
                onClick={switchToSellerManagement}
              />
            </div>
          </div>
        ) : currentView === 'users' ? (
          // User Management View
          <div className="user-management-view">
            <div className="management-header">
              <div>
                <button className="back-button" onClick={switchToDashboard}>
                  <FaArrowLeft /> Back
                </button>
                <h1 className="page-title" style={{ marginTop: '1rem' }}>User Management</h1>
              </div>
              <div className="header-search" style={{ width: 'auto' }}>
                <div className="search-input-wrapper" style={{ position: 'relative' }}>
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={handleUserSearch}
                    className="search-input"
                  />
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="users-grid">
              {filteredUsers.length === 0 ? (
                <div className="no-users">No users found</div>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className="user-card">
                    <div className="info-group">
                      <div className="card-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="card-details">
                        <span className="card-title">{user.name}</span>
                        <span className="card-subtitle">{user.email}</span>
                        <span className="card-subtitle">{user.phoneNumber}</span>
                      </div>
                    </div>

                    <div className={`status-badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </div>

                    <div className="action-buttons">
                      {user.isBlocked ? (
                        <button
                          className="btn-icon"
                          onClick={() => handleUnblockUser(user.id)}
                          title="Unblock User"
                        >
                          <FaUserCheck />
                        </button>
                      ) : (
                        <button
                          className="btn-icon danger"
                          onClick={() => confirmUserAction(user, 'block')}
                          title="Block User"
                        >
                          <FaUserSlash />
                        </button>
                      )}

                      <button
                        className="btn-icon danger"
                        onClick={() => confirmUserAction(user, 'remove')}
                        title="Remove User"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* User Confirmation Dialog */}
            {showUserConfirmDialog && (
              <div className="modal-overlay">
                <div className="confirmation-dialog">
                  <div className="modal-header">
                    <h3>{userActionType === 'block' ? 'Block User' : 'Remove User'}</h3>
                  </div>
                  <div className="modals-body">
                    <p>
                      {userActionType === 'block'
                        ? `Are you sure you want to block ${selectedUser.name}? They will not be able to access their account.`
                        : `Are you sure you want to permanently remove ${selectedUser.name}? This action cannot be undone.`
                      }
                    </p>
                  </div>
                  <div className="modal-actions">
                    <button
                      className="dialog-btn cancel-btn"
                      onClick={() => setShowUserConfirmDialog(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className={`dialog-btn ${userActionType === 'block' ? 'confirm-block-btn' : 'confirm-remove-btn'}`}
                      onClick={userActionType === 'block' ?
                        () => handleBlockUser(selectedUser.id) :
                        handleRemoveUser
                      }
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : currentView === 'products' ? (
          // Product Management View
          <div className="product-management-view">
            <div className="management-header">
              <div>
                <button className="back-button" onClick={switchToDashboard}>
                  <FaArrowLeft /> Back
                </button>
                <h1 className="page-title" style={{ marginTop: '1rem' }}>Product Management</h1>
              </div>
              <div className="header-search" style={{ width: 'auto' }}>
                <div className="search-input-wrapper" style={{ position: 'relative' }}>
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={handleProductSearch}
                    className="search-input"
                  />
                </div>
              </div>
            </div>

            <div className="products-grid">
              {filteredProducts.length === 0 ? (
                <div className="no-products">No products found</div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="info-group">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-thumb"
                        onError={(e) => { e.target.src = '' }}
                      />
                      <div className="card-details">
                        <span className="card-title">{product.name}</span>
                        <span className="card-subtitle">SKU: {product.sku}</span>
                        <span className="card-subtitle">{formatPrice(product.price)} • Stock: {product.stock}</span>
                      </div>
                    </div>

                    <div className="status-badge" style={{ background: '#f3f4f6', color: '#4b5563' }}>
                      {product.category}
                    </div>

                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit">
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => confirmProductAction(product, 'delete')}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Product Confirmation Dialog */}
            {showProductConfirmDialog && (
              <div className="modal-overlay">
                <div className="confirmation-dialog">
                  <div className="modal-header">
                    <h3>Delete Product</h3>
                  </div>
                  <div className="modals-body">
                    <p>Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.</p>
                  </div>
                  <div className="modal-actions">
                    <button
                      className="dialog-btn cancel-btn"
                      onClick={() => setShowProductConfirmDialog(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="dialog-btn confirm-delete-btn"
                      onClick={() => handleDeleteProduct(selectedProduct.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : currentView === 'sellers' ? (
          // Seller Management View
          <div className="seller-management-view">
            <div className="management-header">
              <div>
                <button className="back-button" onClick={switchToDashboard}>
                  <FaArrowLeft /> Back
                </button>
                <h1 className="page-title" style={{ marginTop: '1rem' }}>Seller Management</h1>
              </div>
              <div className="seller-tabs">
                {/* Simplified Tabs using Buttons */}
                <button
                  style={{ marginRight: '1rem', background: !showSellerRequests ? '#e0e7ff' : 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', color: !showSellerRequests ? '#4f46e5' : '#64748b', cursor: 'pointer' }}
                  onClick={() => setShowSellerRequests(false)}
                >
                  <FaUserTie /> Approved Sellers
                </button>
                <button
                  style={{ background: showSellerRequests ? '#e0e7ff' : 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', color: showSellerRequests ? '#4f46e5' : '#64748b', cursor: 'pointer' }}
                  onClick={() => setShowSellerRequests(true)}
                >
                  <FaBell /> Requests ({sellerRequests.length})
                </button>
              </div>
            </div>

            {!showSellerRequests ? (
              <>
                <div className="header-search" style={{ marginBottom: '1rem', padding: 0 }}>
                  <div className="search-input-wrapper" style={{ position: 'relative' }}>
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search sellers..."
                      value={sellerSearchTerm}
                      onChange={handleSellerSearch}
                      className="search-input"
                    />
                  </div>
                </div>

                <div className="sellers-grid">
                  {filteredSellers.map(seller => (
                    <div key={seller.id} className="seller-card">
                      <div className="info-group">
                        <div className="card-avatar" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                          <FaStore />
                        </div>
                        <div className="card-details">
                          <span className="card-title">{seller.name}</span>
                          <span className="card-subtitle">{seller.businessName}</span>
                          <span className="card-subtitle">{seller.email}</span>
                        </div>
                      </div>

                      <div className={`status-badge ${seller.isBlocked ? 'blocked' : 'active'}`}>
                        {seller.isBlocked ? 'Blocked' : 'Active'}
                      </div>

                      <div className="action-buttons">
                        {seller.isBlocked ? (
                          <button className="btn-icon" onClick={() => handleUnblockSeller(seller.id)}>
                            <FaUserCheck />
                          </button>
                        ) : (
                          <button className="btn-icon danger" onClick={() => confirmSellerAction(seller, 'block')}>
                            <FaUserSlash />
                          </button>
                        )}
                        <button className="btn-icon danger" onClick={() => confirmSellerAction(seller, 'remove')}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="sellers-grid">
                {sellerRequests.length === 0 ? <div className="no-requests">No new requests</div> :
                  sellerRequests.map(request => (
                    <div key={request.id} className="request-card">
                      <div className="info-group">
                        <div className="card-avatar" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                          <FaUserTie />
                        </div>
                        <div className="card-details">
                          <span className="card-title">{request.name}</span>
                          <span className="card-subtitle">{request.businessName}</span>
                          <span className="card-subtitle">Applied: {formatDate(request.createdAt)}</span>
                        </div>
                      </div>
                      <button className="btn-icon" onClick={() => viewRequestDetails(request)} title="View Details">
                        <FaEye />
                      </button>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Seller Modals (Confirmation & Details) */}
            {showSellerConfirmDialog && (
              <div className="modal-overlay">
                <div className="confirmation-dialog">
                  <div className="modal-header">
                    <h3>{sellerActionType === 'block' ? 'Block Seller' : 'Remove Seller'}</h3>
                  </div>
                  <div className="modals-body">
                    <p>Are you sure?</p>
                  </div>
                  <div className="modal-actions">
                    <button className="dialog-btn cancel-btn" onClick={() => setShowSellerConfirmDialog(false)}>Cancel</button>
                    <button
                      className="dialog-btn confirm-btn"
                      onClick={sellerActionType === 'block' ? () => handleBlockSeller(selectedSeller.id) : handleRemoveSellerConfirm}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showRequestDetail && sellerDetail && (
              <div className="modal-overlay">
                <div className="request-detail-modal">
                  <div className="modal-header">
                    <h3>Seller Application</h3>
                    <button className="modal-close-btn" onClick={() => setShowRequestDetail(false)}><FaTimes /></button>
                  </div>
                  <div className="modals-body">
                    <div className="detail-grid">
                      <div className="detail-item"><span className="detail-label">Name:</span> <strong>{sellerDetail.name}</strong></div>
                      <div className="detail-item"><span className="detail-label">Email:</span> <strong>{sellerDetail.email}</strong></div>
                      <div className="detail-item"><span className="detail-label">Store:</span> <strong>{sellerDetail.businessName}</strong></div>
                      <div className="detail-item"><span className="detail-label">Type:</span> <strong>{sellerDetail.businessType}</strong></div>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="dialog-btn reject-btn" onClick={() => handleRejectRequest(sellerDetail.id)}>Reject</button>
                    <button className="dialog-btn accept-btn" onClick={() => handleAcceptRequest(sellerDetail.id)}>Approve</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : currentView === 'complaints' ? (
          // Complaints Management View
          <div className="complaints-management-view">
            <div className="management-header">
              <div>
                <button className="back-button" onClick={switchToDashboard}>
                  <FaArrowLeft /> Back
                </button>
                <h1 className="page-title" style={{ marginTop: '1rem' }}>Complaints</h1>
              </div>
              <div className="header-search" style={{ width: 'auto' }}>
                <div className="search-input-wrapper" style={{ position: 'relative' }}>
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={complaintSearchTerm}
                    onChange={handleComplaintSearch}
                    className="search-input"
                  />
                </div>
              </div>
            </div>

            <div className="complaints-grid">
              {filteredComplaints.map(complaint => (
                <div key={complaint.id} className="complaint-card">
                  <div className="info-group">
                    <div className="card-avatar" style={{ background: '#fee2e2', color: '#ef4444' }}>
                      <FaExclamationTriangle />
                    </div>
                    <div className="card-details">
                      <span className="card-title">{complaint.complaintType}</span>
                      <span className="card-subtitle">ID: #{complaint.id} • {formatDate(complaint.createdAt)}</span>
                      <span className="card-subtitle" style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {complaint.description}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span className={`status-badge ${complaint.status.toLowerCase().replace(' ', '-')}`}>
                      {complaint.status}
                    </span>
                    <span className={`status-badge ${complaint.priority.toLowerCase()}`} style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                      {complaint.priority}
                    </span>
                  </div>

                  <div className="action-buttons">
                    <button className="btn-icon" onClick={() => viewComplaintDetails(complaint)}>
                      <FaEye />
                    </button>
                    <button className="btn-icon" onClick={() => openUpdateComplaintModal(complaint)}>
                      <FaEdit />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Complaint Modals */}
            {showComplaintDetail && selectedComplaint && (
              <div className="modal-overlay">
                <div className="complaint-detail-modal">
                  <div className="modal-header">
                    <h3>Complaint Details #{selectedComplaint.id}</h3>
                    <button className="modal-close-btn" onClick={() => setShowComplaintDetail(false)}><FaTimes /></button>
                  </div>
                  <div className="modals-body">
                    <p><strong>Description:</strong> {selectedComplaint.description}</p>
                    <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><span className="detail-label">Status:</span> <strong>{selectedComplaint.status}</strong></div>
                      <div><span className="detail-label">Priority:</span> <strong>{selectedComplaint.priority}</strong></div>
                      <div><span className="detail-label">Type:</span> <strong>{selectedComplaint.complaintType}</strong></div>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="dialog-btn close-btn" onClick={() => setShowComplaintDetail(false)}>Close</button>
                    <button className="dialog-btn confirm-btn" onClick={() => { setShowComplaintDetail(false); openUpdateComplaintModal(selectedComplaint); }}>Update</button>
                  </div>
                </div>
              </div>
            )}

            {showUpdateComplaintModal && selectedComplaint && (
              <div className="modal-overlay">
                <div className="update-complaint-modal">
                  <div className="modal-header">
                    <h3>Update Complaint</h3>
                    <button className="modal-close-btn" onClick={() => setShowUpdateComplaintModal(false)}><FaTimes /></button>
                  </div>
                  <div className="modals-body">
                    <div className="form-group">
                      <label>Status</label>
                      <select style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Priority</label>
                      <select style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} value={updatePriority} onChange={(e) => setUpdatePriority(e.target.value)}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Resolution Notes</label>
                      <textarea
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        rows="4"
                        value={updateResolutionNote}
                        onChange={(e) => setUpdateResolutionNote(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="dialog-btn cancel-btn" onClick={() => setShowUpdateComplaintModal(false)}>Cancel</button>
                    <button className="dialog-btn confirm-btn" onClick={handleUpdateComplaint}>Save Update</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Orders Management View
          <div className="orders-management-view">
            <div className="management-header">
              <div>
                <button className="back-button" onClick={switchToDashboard}>
                  <FaArrowLeft /> Back
                </button>
                <h1 className="page-title" style={{ marginTop: '1rem' }}>Orders</h1>
              </div>
              <div className="header-search" style={{ width: 'auto' }}>
                <div className="search-input-wrapper" style={{ position: 'relative' }}>
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by Order ID or User..."
                    value={orderSearchTerm}
                    onChange={handleOrderSearch}
                    className="search-input"
                  />
                </div>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 500 }}>{order.user ? order.user.name : 'Guest'}</span>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{order.user ? order.user.email : '-'}</span>
                        </div>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{order.items ? order.items.length : 0} items</td>
                      <td style={{ fontWeight: 600 }}>{formatPrice(order.finalAmount)}</td>
                      <td>
                        <span className={`status-badge ${order.paymentMethod === 'Cash on Delivery' ? 'warning' : 'success'}`}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${order.paymentStatus === 'Paid' ? 'success' : order.paymentStatus === 'Pending' ? 'warning' : 'danger'}`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;