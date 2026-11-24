import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Globe,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimalCard, { AnimalCardSkeleton } from "@/components/AnimalCard";
import SectionHeading from "@/components/SectionHeading";
import { useAsync } from "@/hooks/useAsync";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CATEGORIES } from "@/lib/categories";
import { photoSize, searchAnimals } from "@/services/inaturalist";

const LandingPage = () => {
  useDocumentTitle();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const { data, loading } = useAsync(
    () => searchAnimals({ perPage: 11 }),
    []
  );
  const heroAnimals = data?.results.slice(0, 3) ?? [];
  const featured = data?.results.slice(3, 11) ?? [];

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/gallery?q=${encodeURIComponent(q)}` : "/gallery");
  };

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="container-page grid items-center gap-12 pt-12 pb-16 md:pt-20 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-moss">
            <Sparkles className="size-3.5" />
            Ensiklopedia visual satwa dunia
          </span>
          <h1 className="mt-5 text-4xl leading-[1.05] font-bold text-forest sm:text-5xl lg:text-6xl">
            Jelajahi keragaman <span className="text-clay">satwa</span> di
            planet kita.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Temukan ribuan spesies hewan — dari mamalia hutan hujan hingga
            serangga terkecil — lengkap dengan foto asli dan deskripsi dalam
            bahasa Indonesia.
          </p>

          <form
            onSubmit={onSearch}
            className="mt-8 flex max-w-lg items-center gap-2 rounded-full bg-card p-1.5 shadow-lg shadow-forest/5 ring-1 ring-border"
          >
            <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari hewan, mis. orangutan…"
              className="h-10 min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="lg">
              Cari
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>Populer:</span>
            {["Harimau", "Komodo", "Elang", "Penyu"].map((q) => (
              <Link
                key={q}
                to={`/gallery?q=${q.toLowerCase()}`}
                className="font-medium text-moss underline-offset-4 hover:underline"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        {/* Kolase foto */}
        <div className="grid h-[420px] grid-cols-2 grid-rows-2 gap-4 sm:h-[500px]">
          {[0, 1, 2].map((i) => {
            const taxon = heroAnimals[i];
            const cls =
              i === 0 ? "row-span-2" : "";
            if (!taxon?.default_photo) {
              return (
                <div
                  key={i}
                  className={`${cls} animate-pulse rounded-3xl bg-muted`}
                />
              );
            }
            return (
              <Link
                key={taxon.id}
                to={`/gallery/${taxon.id}`}
                className={`${cls} group relative overflow-hidden rounded-3xl`}
              >
                <img
                  src={photoSize(taxon.default_photo.medium_url, "large")}
                  alt={taxon.preferred_common_name ?? taxon.name}
                  className="size-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-forest capitalize backdrop-blur">
                  {taxon.preferred_common_name ?? taxon.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- Statistik ---------- */}
      <section className="container-page">
        <div className="grid gap-px overflow-hidden rounded-3xl bg-border ring-1 ring-border sm:grid-cols-3">
          {[
            {
              icon: Globe,
              value: data
                ? data.total_results.toLocaleString("id-ID")
                : "…",
              label: "spesies hewan tercatat",
            },
            {
              icon: Camera,
              value: "Jutaan",
              label: "foto dari pengamat di seluruh dunia",
            },
            {
              icon: BookOpen,
              value: String(CATEGORIES.length),
              label: "kelompok hewan untuk dijelajahi",
            },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4 bg-card p-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-moss">
                <s.icon className="size-6" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold text-forest">
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Kategori ---------- */}
      <section className="container-page mt-24">
        <SectionHeading
          eyebrow="Kategori"
          title="Mulai dari kelompok favoritmu"
          description="Setiap kelompok punya cerita evolusi dan keunikannya sendiri."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/gallery?kategori=${c.slug}`}
              className="group rounded-2xl bg-card p-5 ring-1 ring-border transition hover:-translate-y-1 hover:bg-forest hover:ring-forest"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-moss transition group-hover:bg-white/10 group-hover:text-leaf">
                <c.icon className="size-5" />
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-forest group-hover:text-sand">
                {c.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground group-hover:text-sand/70">
                {c.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Unggulan ---------- */}
      <section className="container-page mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Sorotan"
            title="Paling sering diamati"
            description="Hewan yang paling banyak dipotret oleh komunitas naturalis."
          />
          <Button asChild variant="outline">
            <Link to="/gallery">
              Lihat semua <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <AnimalCardSkeleton key={i} />
              ))
            : featured.map((t) => <AnimalCard key={t.id} taxon={t} />)}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="container-page mt-24">
        <div className="relative overflow-hidden rounded-3xl bg-forest px-8 py-14 text-sand md:px-14">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-moss/40 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-clay/20 blur-3xl" />
          <div className="relative max-w-xl">
            <h2 className="text-3xl font-bold md:text-4xl">
              Setiap spesies punya kisahnya.
            </h2>
            <p className="mt-4 text-sand/75">
              Buka Gallery dan telusuri klasifikasi, foto, serta deskripsi
              lengkap dari ribuan hewan.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-sand text-forest hover:bg-sand/90"
            >
              <Link to="/gallery">
                Mulai menjelajah <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
