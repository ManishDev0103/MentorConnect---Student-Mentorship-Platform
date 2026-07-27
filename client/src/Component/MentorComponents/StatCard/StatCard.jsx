import "./StatCard.css";

export default function StatCard({ title, value, icon, iconBg }) {
  return (
    <div className="col-lg-3 col-md-6 mb-3">
      <div className="stat-card">
        <div className="stat-content">
          <div className="stat-info">
            <div className="stat-title">{title}</div>
            <div className="stat-value">{value}</div>
          </div>
          <div className={`stat-icon ${iconBg || 'bg-teal'}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
