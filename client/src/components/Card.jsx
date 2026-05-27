export default function Card({ children, className = "", hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`card ${hover ? "stat-card" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
