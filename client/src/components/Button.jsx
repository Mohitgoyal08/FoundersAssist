export default function Button({
  children, onClick, type = "button", variant = "primary",
  loading = false, disabled = false, className = "", icon = null,
}) {
  const base = "inline-flex items-center gap-2 font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "btn-primary",
    ghost:   "btn-ghost",
    danger:  "px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
    success: "px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin-slow" />
      ) : icon}
      {children}
    </button>
  );
}