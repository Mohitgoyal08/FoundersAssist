export default function Loader({ size = "md", text = "" }) {
  const sizes = { sm: "w-4 h-4", md: "w-7 h-7", lg: "w-10 h-10" };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-2 animate-spin-slow`}
        style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
      />
      {text && <p className="text-sm" style={{ color: "var(--text-muted)" }}>{text}</p>}
    </div>
  );
}