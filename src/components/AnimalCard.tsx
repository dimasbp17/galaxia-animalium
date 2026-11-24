import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { photoSize } from "@/services/inaturalist";
import type { Taxon } from "@/types/animal";

interface AnimalCardProps {
  taxon: Taxon;
  className?: string;
}

const AnimalCard = ({ taxon, className }: AnimalCardProps) => {
  const name = taxon.preferred_common_name ?? taxon.name;

  return (
    <Link
      to={`/gallery/${taxon.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-muted ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10",
        className
      )}
    >
      <div className="aspect-[4/5] overflow-hidden">
        {taxon.default_photo ? (
          <img
            src={photoSize(taxon.default_photo.medium_url, "medium")}
            alt={name}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-12 text-white">
        <p className="font-display text-lg font-semibold leading-tight capitalize">
          {name}
        </p>
        <p className="mt-0.5 truncate text-sm italic text-white/75">
          {taxon.name}
        </p>
      </div>
    </Link>
  );
};

export const AnimalCardSkeleton = () => (
  <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
);

export default AnimalCard;
