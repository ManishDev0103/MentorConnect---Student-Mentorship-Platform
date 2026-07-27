import React, { useState, useEffect } from "react";
import "./OverviewContent.css";
import { adminDashboardService } from "../../../service/adminDashboardService";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const OverviewContent = ({
  chartData,
  activities,
  refreshTrigger,
  onNavigate,
}) => {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch each item individually with error handling
        let overviewData = null;
        let revenueData = null;

        try {
          const response = await adminDashboardService.getOverviewStats();
          console.log("Overview data received:", response);
          overviewData = response;
        } catch (err) {
          console.error("Error fetching overview:", err);
        }

        try {
          const response = await adminDashboardService.getMonthlyRevenue();
          console.log("Revenue data received:", response);
          revenueData = response;
        } catch (err) {
          console.error("Error fetching revenue data:", err);
        }

        // Only use real data if it was successfully fetched
        if (overviewData) {
          setStats(overviewData);
        }
        if (revenueData) {
          setRevenue(revenueData);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Use real data from API if available, otherwise use fallback
  const displayStats =
    stats !== null
      ? stats
      : {
          totalStudents: 580,
          studentGrowthPercent: 12,
          totalMentors: 50,
          mentorGrowthPercent: 8,
          activeSessions: 127,
          sessionGrowthPercent: 15,
          monthlyRevenue: 42500,
          revenueGrowthPercent: 23,
        };

  const formatCurrency = (value) => {
    if (value >= 1000) {
      return "₹" + (value / 1000).toFixed(1) + "K";
    }
    return "₹" + value.toFixed(0);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="page-title mb-1">Platform Overview</h2>
        <p className="page-subtitle">
          Monitor platform performance and key metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {/* Total Students */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small mb-1">Total Students</div>
                <h3 className="metric-value">{displayStats.totalStudents}</h3>
                <span className="badge-pill badge-success">
                  📈 +{displayStats.studentGrowthPercent?.toFixed(1)}%
                </span>
              </div>
              <div className="metric-icon bg-students">
                <span>👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Mentors */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small mb-1">Total Mentors</div>
                <h3 className="metric-value">{displayStats.totalMentors}</h3>
                <span className="badge-pill badge-success">
                  📈 +{displayStats.mentorGrowthPercent?.toFixed(1)}%
                </span>
              </div>
              <div className="metric-icon bg-mentors">
                <span>👤</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small mb-1">Active Sessions</div>
                <h3 className="metric-value">{displayStats.activeSessions}</h3>
                <span className="badge-pill badge-success">
                  📈 +{displayStats.sessionGrowthPercent?.toFixed(1)}%
                </span>
              </div>
              <div className="metric-icon bg-sessions">
                <span>📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-card h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small mb-1">Monthly Revenue</div>
                <h3 className="metric-value">
                  {formatCurrency(displayStats.monthlyRevenue)}
                </h3>
                <span className="badge-pill badge-success">
                  📈 +{displayStats.revenueGrowthPercent?.toFixed(1)}%
                </span>
              </div>
              <div className="metric-icon bg-revenue">
                <span>💲</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      {revenue && revenue.length > 0 && (
        <div className="row g-3 mt-3">
          <div className="col-12">
            <div className="custom-card">
              <h5 className="card-header-title mb-3">Monthly Revenue Trend</h5>
              <Bar
                data={{
                  labels: revenue.map((r) => r.month).reverse(),
                  datasets: [
                    {
                      label: "Revenue (₹)",
                      data: revenue.map((r) => r.revenue).reverse(),
                      backgroundColor: "rgba(34, 197, 94, 0.6)",
                      borderColor: "rgba(34, 197, 94, 1)",
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  aspectRatio: 3,
                  plugins: {
                    legend: {
                      display: true,
                      position: "top",
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          let label = context.dataset.label || "";
                          if (label) {
                            label += ": ";
                          }
                          if (context.parsed.y !== null) {
                            label += "₹" + context.parsed.y.toLocaleString();
                          }
                          return label;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return "₹" + value.toLocaleString();
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="row g-3 mt-3">
        <div className="col-12">
          <div className="custom-card d-flex justify-content-between align-items-center">
            <h5 className="card-header-title mb-0">Pending Verifications</h5>
            <button
              className="btn btn-link text-decoration-none p-0"
              onClick={() => onNavigate && onNavigate("verification")}
            >
              View All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
