import {
  Bird,
  Bug,
  Droplets,
  Fish,
  PawPrint,
  Shell,
  Turtle,
  Worm,
  type LucideIcon,
} from "lucide-react";

export interface AnimalCategory {
  slug: string;
  label: string;
  description: string;
  /** ID taxon di iNaturalist */
  taxonId: number;
  icon: LucideIcon;
}

export const ALL_ANIMALS_TAXON_ID = 1; // Animalia

export const CATEGORIES: AnimalCategory[] = [
  {
    slug: "mamalia",
    label: "Mamalia",
    description: "Berambut, menyusui, berdarah panas",
    taxonId: 40151,
    icon: PawPrint,
  },
  {
    slug: "burung",
    label: "Burung",
    description: "Berbulu, bersayap, bertelur",
    taxonId: 3,
    icon: Bird,
  },
  {
    slug: "reptil",
    label: "Reptil",
    description: "Bersisik dan berdarah dingin",
    taxonId: 26036,
    icon: Turtle,
  },
  {
    slug: "amfibi",
    label: "Amfibi",
    description: "Hidup di dua alam",
    taxonId: 20978,
    icon: Droplets,
  },
  {
    slug: "ikan",
    label: "Ikan",
    description: "Ikan bersirip kipas",
    taxonId: 47178,
    icon: Fish,
  },
  {
    slug: "serangga",
    label: "Serangga",
    description: "Berkaki enam, kelompok terbesar",
    taxonId: 47158,
    icon: Bug,
  },
  {
    slug: "moluska",
    label: "Moluska",
    description: "Siput, kerang, dan gurita",
    taxonId: 47115,
    icon: Shell,
  },
  {
    slug: "arakhnida",
    label: "Arakhnida",
    description: "Laba-laba, kalajengking, tungau",
    taxonId: 47119,
    icon: Worm,
  },
];

export function getCategory(slug: string | null | undefined) {
  return CATEGORIES.find((c) => c.slug === slug);
}
