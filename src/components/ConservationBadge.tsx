import { getIucnCategory } from "@/lib/conservation";
import { cn } from "@/lib/utils";
import type { ConservationStatus } from "@/types/animal";

interface ConservationBadgeProps {
  status: ConservationStatus | null | undefined;
  /** "compact" = hanya kode (mis. EN), untuk kartu. */
  variant?: "compact" | "full";
  className?: string;
}

const ConservationBadge = ({
  status,
  variant = "full",
  className,
}: ConservationBadgeProps) => {
  const category = getIucnCategory(status);
  if (!category) return null;

  return (
    <span
      title={`Status IUCN: ${category.label} (${category.code})`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        variant === "compact" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        category.className,
        className
      )}
    >
      <span className="font-bold">{category.code}</span>
      {variant === "full" && <span>{category.label}</span>}
    </span>
  );
};

export default ConservationBadge;
