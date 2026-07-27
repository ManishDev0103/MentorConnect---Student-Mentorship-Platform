import { useState, useEffect } from "react";
import "./Earnings.css";
import "../../../styles/common.css";
import EarningsChart from "../../../Component/MentorComponents/EarningsChart/EarningsChart";
import {
  getEarningsSummary,
  getTransactionHistory,
} from "../../../service/mentorService";
import { handleApiError } from "../../../utils/toast";
import { getMentorId } from "../../../service/authService";

function Earnings() {
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    averagePerSession: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get mentor ID from localStorage (set during login)
  const mentorId = getMentorId();

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      console.log("Fetching earnings for mentorId:", mentorId);

      if (!mentorId) {
        console.error("No mentorId found");
        handleApiError(
          new Error("Mentor ID not found"),
          "Failed to load earnings data",
        );
        return;
      }

      const [summaryResponse, transactionsResponse] = await Promise.all([
        getEarningsSummary(mentorId),
        getTransactionHistory(mentorId),
      ]);

      console.log("Summary response:", summaryResponse);
      console.log("Transactions response:", transactionsResponse);

      if (summaryResponse.success) {
        setSummary({
          totalEarnings: summaryResponse.data.totalEarned || 0,
          monthlyEarnings: summaryResponse.data.thisMonthEarnings || 0,
          averagePerSession: summaryResponse.data.averagePerSession || 0,
        });
      }

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data || []);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      handleApiError(error, "Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="earnings-page">
      <div className="page-header">
        <h1 className="page-title">Earnings</h1>
        <p className="page-subtitle">Track your earnings and revenue</p>
      </div>

      {loading ? (
        <div className="loading-text">Loading earnings...</div>
      ) : (
        <>
          <div className="earnings-summary-cards">
            <div className="earnings-stat-card">
              <div className="earnings-stat-icon bg-green">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="earnings-stat-info">
                <span className="earnings-stat-label">Total Earned</span>
                <span className="earnings-stat-value">
                  {formatCurrency(summary.totalEarnings)}
                </span>
              </div>
            </div>

            <div className="earnings-stat-card">
              <div className="earnings-stat-icon bg-blue">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div className="earnings-stat-info">
                <span className="earnings-stat-label">This Month</span>
                <span className="earnings-stat-value">
                  {formatCurrency(summary.monthlyEarnings)}
                </span>
              </div>
            </div>

            <div className="earnings-stat-card">
              <div className="earnings-stat-icon bg-purple">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="earnings-stat-info">
                <span className="earnings-stat-label">Avg/Session</span>
                <span className="earnings-stat-value">
                  {formatCurrency(summary.averagePerSession)}
                </span>
              </div>
            </div>
          </div>

          <div className="earnings-chart-card">
            <h5 className="section-title">Earnings History</h5>
            <EarningsChart mentorId={mentorId} showBadge={false} />
          </div>

          <div className="transactions-section">
            <h5 className="section-title">Recent Transactions</h5>
            {transactions.length === 0 ? (
              <p className="text-muted">No transactions yet</p>
            ) : (
              <div className="transactions-list">
                {transactions.map((t, i) => (
                  <div className="transaction-item" key={i}>
                    <div className="transaction-info">
                      <div className="transaction-name">{t.studentName}</div>
                      <div className="transaction-details">
                        {t.description || "Session Payment"} •{" "}
                        {formatDate(t.transactionDate)}
                      </div>
                    </div>
                    <span className="transaction-amount">
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Earnings;
