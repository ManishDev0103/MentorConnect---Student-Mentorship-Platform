import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "./EarningsChart.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getMonthlyEarnings } from "../../../service/mentorService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function EarningsChart({ mentorId = 1, showBadge = true }) {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: "#0d9488",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mentorId) {
      fetchMonthlyEarnings();
    }
  }, [mentorId]);

  const fetchMonthlyEarnings = async () => {
    try {
      setLoading(true);
      const response = await getMonthlyEarnings(mentorId);

      if (response.success && response.data) {
        const months = response.data.map((item) => item.month);
        const earnings = response.data.map((item) => item.earnings);

        setChartData({
          labels: months,
          datasets: [
            {
              data: earnings,
              backgroundColor: "#0d9488",
              borderRadius: 6,
              barThickness: 40,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Failed to load monthly earnings:", error);
      // Use default data on error
      setChartData({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: "#0d9488",
            borderRadius: 6,
            barThickness: 40,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "white",
        titleColor: "#374151",
        bodyColor: "#0d9488",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `₹${context.raw.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#9ca3af",
        },
      },
      y: {
        grid: {
          color: "#f3f4f6",
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#9ca3af",
          callback: function (value) {
            // Only show whole numbers
            if (value % 1 === 0) {
              return "₹" + value.toLocaleString("en-IN");
            }
            return "";
          },
          stepSize: 1000, // Minimum step of ₹1000
          precision: 0,
        },
        min: 0,
        suggestedMax: 5000, // Suggest minimum scale of ₹5000
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="earnings-chart-wrapper">
      {showBadge && <span className="chart-badge">Last 6 Months</span>}
      <div className="earnings-chart-container">
        {loading ? (
          <div className="chart-loading">Loading chart...</div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}

export default EarningsChart;
