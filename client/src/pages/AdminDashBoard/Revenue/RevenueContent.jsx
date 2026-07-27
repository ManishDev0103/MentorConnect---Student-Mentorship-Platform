import React, { useState, useEffect } from "react";
import "./RevenueContent.css";
import { adminDashboardService } from "../../../service/adminDashboardService";

const RevenueContent = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      let revenueStats = null;
      let monthlyRevenue = [];

      try {
        revenueStats = await adminDashboardService.getRevenueStats();
      } catch (err) {
        console.error("Error fetching revenue stats:", err);
      }

      try {
        monthlyRevenue = await adminDashboardService.getMonthlyRevenue();
      } catch (err) {
        console.error("Error fetching monthly revenue:", err);
      }

      setStats(revenueStats);
      setRevenueData(monthlyRevenue || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const displayStats = stats || {
    totalRevenue: 216500,
    revenueGrowthPercent: 23,
    thisMonthRevenue: 42500,
    monthlyGrowthPercent: 6,
    avgTransaction: 200,
    totalTransactions: 1083,
  };

  const formatCurrency = (value) => {
    if (value >= 1000) {
      return "₹" + (value / 1000).toFixed(1) + "K";
    }
    return "₹" + value.toFixed(0);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="page-title mb-1">Revenue</h2>
        <p className="page-subtitle">Track revenue and financial metrics</p>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="revenue-card h-100">
            <div className="revenue-stat-title">Total Revenue</div>
            <div className="revenue-stat-value">
              {formatCurrency(displayStats.totalRevenue)}
            </div>
            <span className="revenue-growth">
              +{displayStats.revenueGrowthPercent?.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="revenue-card h-100">
            <div className="revenue-stat-title">This Month</div>
            <div className="revenue-stat-value">
              {formatCurrency(displayStats.thisMonthRevenue)}
            </div>
            <span className="revenue-growth">
              +{displayStats.monthlyGrowthPercent?.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="revenue-card h-100">
            <div className="revenue-stat-title">Avg. Transaction</div>
            <div className="revenue-stat-value">
              {formatCurrency(displayStats.avgTransaction)}
            </div>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="revenue-card h-100">
            <div className="revenue-stat-title">Total Transactions</div>
            <div className="revenue-stat-value">
              {displayStats.totalTransactions.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="revenue-table-card">
        <h5 className="card-header-title mb-3">Monthly Revenue</h5>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Transactions</th>
                <th>Avg. per Transaction</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((item, index) => (
                <tr key={index}>
                  <td className="fw-semibold">{item.month}</td>
                  <td className="text-teal fw-semibold">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td>{item.transactions}</td>
                  <td>
                    {formatCurrency(
                      item.transactions > 0
                        ? item.revenue / item.transactions
                        : 0,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueContent;
