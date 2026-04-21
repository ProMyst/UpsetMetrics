type EyebrowColor = "stone" | "ink" | "graphite" | "brass" | "claret";

const COLOR_CLASSES: Record<EyebrowColor, string> = {
  stone: "text-stone",
  ink: "text-ink",
  graphite: "text-graphite",
  brass: "text-brass",
  claret: "text-claret",
};

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  color?: EyebrowColor;
}

export default function Eyebrow({
  children,
  className,
  color = "stone",
}: EyebrowProps) {
  return (
    <span className={`text-eyebrow ${COLOR_CLASSES[color]} ${className ?? ""}`}>
      {children}
    </span>
  );
}
