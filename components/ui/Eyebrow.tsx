interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export default function Eyebrow({
  children,
  className,
  color = "stone",
}: EyebrowProps) {
  return (
    <span
      className={`text-eyebrow text-${color} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
