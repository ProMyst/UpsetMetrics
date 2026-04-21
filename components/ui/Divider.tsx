interface DividerProps {
  className?: string;
  withLines?: boolean;
}

export default function Divider({ className, withLines = true }: DividerProps) {
  return (
    <div
      className={`flex items-center gap-6 ${className ?? ""}`}
      role="separator"
      aria-orientation="horizontal"
    >
      {withLines && <div className="hairline flex-1" />}
      <span
        style={{
          color: "var(--color-brass)",
          fontSize: "0.875rem",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        ✦
      </span>
      {withLines && <div className="hairline flex-1" />}
    </div>
  );
}
