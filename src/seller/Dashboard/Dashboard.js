import React, { useState, useEffect, useMemo } from 'react';
import './Dashboard.css';
import SellerProfile from '../Profile/SellerProfile';
import AddProductPage from './Addproduct/AddProductPage';
import CreateBrandPage from './CreateBrand/CreateBrandPage';
import ProductsList from './ProductList/ProductsList';
import OrdersList from './Orderlist/OrdersList';
import ReturnOrder from './Return/ReturnOrder';
import ComplaintsManagement from './Complaints/ComplaintsManagement';
import {
  FaSignOutAlt,
  FaBox,
  FaShoppingCart,
  FaChartLine,
  FaBell,
  FaUserCircle,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaUsers,
  FaPlus,
  FaTag,
  FaUndo

} from 'react-icons/fa';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Dashboard = ({ sellerToken, sellerData, onLogout }) => {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    activeProducts: 0,
    revenueToday: 0,
    revenueMonth: 0,
    pendingOrders: 0,
    recentOrders: [],
    lowStockAlerts: [],
    totalSales: 0,
    totalRevenue: 0,
    todayTotalOrder: 0,
    orderStatusCount: [],
    totalProducts: 0,
    countOfCustomer: 0,
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showCreateBrand, setShowCreateBrand] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showComplaints, setShowComplaints] = useState(false);
  const [showReturnOrders, setShowReturnOrders] = useState(false);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/seller/dashboard/seller`, {
          headers: {
            'Authorization': `Bearer ${sellerToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();

        // Sort monthly stats by date in ascending order
        const sortedMonthlyStats = data.monthlyStats
          .map(stat => ({
            date: stat.date,
            sales: parseInt(stat.totalSold)
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Transform API data to match our component state
        setDashboardData({
          totalOrders: data.TotalSales,
          activeProducts: data.TotalProducts,
          revenueToday: data.TodayTotalOrder,
          revenueMonth: data.TotalRevenue,
          pendingOrders: data.orderStatusCount.find(item => item.status === 'Pending')?.count || 0,
          recentOrders: [],
          lowStockAlerts: data.LowStockProducts,
          totalSales: data.TotalSales,
          totalRevenue: data.TotalRevenue,
          todayTotalOrder: data.TodayTotalOrder,
          orderStatusCount: data.orderStatusCount,
          totalProducts: data.TotalProducts,
          countOfCustomer: data.CountOfCustomer,
          monthlyStats: sortedMonthlyStats,
          totalReturns: data.totalReturns || 0 // ✅ Set totalReturns
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [sellerToken]);

  // Format date for better display on the chart - include day, month and year
  const formatMonthlyStats = useMemo(() => {
    return dashboardData.monthlyStats.map(stat => ({
      ...stat,
      // Format date to show as "DD MMM YY" (e.g., "15 Jan 23")
      formattedDate: new Date(stat.date).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      }),
      // Also keep the full date for tooltips
      fullDate: new Date(stat.date).toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }));
  }, [dashboardData.monthlyStats]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Custom tooltip for the line chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Find the full date from the data
      const dataPoint = formatMonthlyStats.find(item => item.formattedDate === label);
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{dataPoint ? dataPoint.fullDate : label}</p>
          <p className="tooltip-value">
            <span className="tooltip-value-name">Sales: </span>
            <span className="tooltip-value-number">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare data for order status pie chart
  const orderStatusData = dashboardData?.orderStatusCount?.map(item => ({
    name: item.status,
    value: Number(item.count) || 0
  })) || [];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      {showProfile ? (
        <SellerProfile
          sellerToken={sellerToken}
          onBackToDashboard={() => setShowProfile(false)}
        />
      ) : showCreateBrand ? (
        <CreateBrandPage
          sellerToken={sellerToken}
          onBackToDashboard={() => setShowCreateBrand(false)}
          onBrandCreated={() => {
            setShowCreateBrand(false);
            setShowAddProduct(true);
          }}
        />
      ) : showAddProduct ? (
        <AddProductPage
          sellerToken={sellerToken}
          onBackToDashboard={() => setShowAddProduct(false)}
        />
      ) : showProducts ? (
        <ProductsList
          sellerToken={sellerToken}
          onBackToDashboard={() => setShowProducts(false)}
        />
      ) : showOrders ? (
        <OrdersList
          sellerToken={sellerToken}
          onBackToDashboard={() => setShowOrders(false)}
        />
      ) : showComplaints ? (
        <ComplaintsManagement
          sellerToken={sellerToken}
          sellerId={sellerData.id} // Make sure you have seller ID in your sellerData
          onBackToDashboard={() => setShowComplaints(false)}
        />
      ) : showReturnOrders ? (
        <ReturnOrder
          onBackToDashboard={() => setShowReturnOrders(false)}
        />
      ) : (
        <div className="seller-dashboard">
          <header className="dashboard-header">
            <div className="header-left">
              <h1>Seller Dashboard</h1>
              <p>Welcome back, {sellerData?.name}</p>
            </div>
            <div className="header-right">
              <button className="btn-notification">
                <FaBell />
                <span className="notification-badge">3</span>
              </button>
              <div className="user-menu" role='button' onClick={() => setShowProfile(true)}>
                <FaUserCircle className="user-avatar" />
                <span className="user-name">{sellerData?.businessName}</span>
              </div>
              <button className="btn-logout" onClick={onLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </header>

          <div className="dashboard-content">
            {/* Brand and Product Options */}
            <div className="action-buttons-section">
              <button
                className="btn-create-brand"
                onClick={() => setShowCreateBrand(true)}
              >
                <FaTag /> Create Brand
              </button>
              <button
                className="btn-add-product"
                onClick={() => setShowAddProduct(true)}
              >
                <FaPlus /> Add Product
              </button>
              <button
                className="btn-view-complaints"
                onClick={() => setShowComplaints(true)}
              >
                <FaExclamationTriangle /> Manage Complaints
              </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div
                className="stat-card clickable"
                onClick={() => setShowOrders(true)}
              >
                <div className="stat-icon">
                  <FaShoppingCart />
                </div>
                <div className="stat-content">
                  <h3>Total Orders</h3>
                  <p className="stat-value">{dashboardData.totalOrders}</p>
                </div>
              </div>

              <div
                className="stat-card clickable"
                onClick={() => setShowProducts(true)}
              >
                <div className="stat-icon">
                  <FaBox />
                </div>
                <div className="stat-content">
                  <h3>Active Products</h3>
                  <p className="stat-value">{dashboardData.activeProducts}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaMoneyBillWave />
                </div>
                <div className="stat-content">
                  <h3>Revenue (Total)</h3>
                  <p className="stat-value">{formatCurrency(dashboardData.totalRevenue)}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaChartLine />
                </div>
                <div className="stat-content">
                  <h3>Orders (Today)</h3>
                  <p className="stat-value">{dashboardData.todayTotalOrder}</p>
                </div>
              </div>

              <div
                className="stat-card clickable"
                onClick={() => setShowReturnOrders(true)}
              >
                <div className="stat-icon">
                  <FaUndo />
                </div>
                <div className="stat-content">
                  <h3>Returned Orders</h3>
                  <p className="stat-value">{dashboardData.totalReturns}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-content">
                  <h3>Total Customers</h3>
                  <p className="stat-value">{dashboardData.countOfCustomer}</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
              <div className="chart-card">
                <h3>Monthly Sales Trend</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatMonthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="formattedDate"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                        name="Sales"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <h3>Order Status Distribution</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="dashboard-sections">
              {/* Low Stock Alerts */}
              <div className="section-card">
                <div className="section-header">
                  <h3>Low Stock Alerts</h3>
                  <button className="btn-view-all">View All</button>
                </div>
                <div className="alerts-list">
                  {dashboardData.lowStockAlerts && dashboardData.lowStockAlerts.length > 0 ? (
                    dashboardData.lowStockAlerts.map(product => (
                      <div key={product.id} className="alert-item">
                        <div className="alert-icon">
                          <FaExclamationTriangle />
                        </div>
                        <div className="alert-info">
                          <h4>{product.name}</h4>
                          <p>Only {product.stock} left in stock</p>
                        </div>
                        <button className="btn-restock">Restock</button>
                      </div>
                    ))
                  ) : (
                    <p className="no-alerts">No low stock alerts</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;