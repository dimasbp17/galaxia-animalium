import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  ChevronRight,
  Eye,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimalCard, { AnimalCardSkeleton } from "@/components/AnimalCard";
import { useAsync } from "@/hooks/useAsync";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import {
  getAnimalById,
  photoSize,
  searchAnimals,
} from "@/services/inaturalist";
import { findWikiSummary } from "@/services/wikipedia";
import type { Taxon } from "@/types/animal";

const RANK_LABEL: Record<string, string> = {
  kingdom: "Kerajaan",
  phylum: "Filum",
  class: "Kelas",
  order: "Ordo",
  family: "Famili",
  genus: "Genus",
};

const AnimalDetailPage = () => {
  const { id } = useParams();

  const { data, loading, error } = useAsync(async () => {
    const taxon = await getAnimalById(Number(id));
    if (!taxon) return null;
    // Kalau Wikipedia gagal, halaman tetap tampil tanpa deskripsi.
    const wiki = await findWikiSummary([
      taxon.preferred_common_name,
      taxon.name,
    ]).catch(() => null);
    return { taxon, wiki };
  }, [id]);

  const title = data?.taxon.preferred_common_name ?? data?.taxon.name;
  useDocumentTitle(title ? capitalize(title) : undefined);

  if (loading) return <DetailSkeleton />;

  if (error || !data) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <h1 className="text-3xl font-bold text-forest">
          {error ? "Gagal memuat data" : "Hewan tidak ditemukan"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {error ?? "Spesies yang kamu cari tidak tersedia."}
        </p>
        <Button asChild className="mt-6">
          <Link to="/gallery">Kembali ke Gallery</Link>
        </Button>
      </div>
    );
  }

  const { taxon, wiki } = data;
  const name = taxon.preferred_common_name ?? taxon.name;
  const classification = (taxon.ancestors ?? []).filter(
    (a) => a.rank in RANK_LABEL
  );
  const category = CATEGORIES.find((c) =>
    (taxon.ancestors ?? []).some((a) => a.id === c.taxonId)
  );
  const family = classification.find((a) => a.rank === "family");

  return (
    <>
      <div className="container-page pt-8">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link to="/gallery" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-4" /> Gallery
          </Link>
          {category && (
            <>
              <ChevronRight className="size-4" />
              <Link
                to={`/gallery?kategori=${category.slug}`}
                className="hover:text-foreground"
              >
                {category.label}
              </Link>
            </>
          )}
          <ChevronRight className="size-4" />
          <span className="text-foreground capitalize">{name}</span>
        </nav>
      </div>

      <section className="container-page mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        <PhotoGallery taxon={taxon} />

        <div className="lg:pt-2">
          {category && (
            <Link
              to={`/gallery?kategori=${category.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-moss"
            >
              <category.icon className="size-3.5" />
              {category.label}
            </Link>
          )}
          <h1 className="mt-4 text-4xl font-bold text-forest capitalize md:text-5xl">
            {name}
          </h1>
          <p className="mt-2 text-xl text-muted-foreground italic">
            {taxon.name}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat
              icon={Eye}
              value={taxon.observations_count.toLocaleString("id-ID")}
              label="observasi"
            />
            <Stat
              icon={Camera}
              value={String(taxon.taxon_photos?.length ?? 0)}
              label="foto pilihan"
            />
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-forest">Tentang hewan ini</h2>
            {wiki ? (
              <>
                <p className="mt-3 leading-relaxed text-foreground/85">
                  {wiki.extract}
                </p>
                <a
                  href={wiki.content_urls.desktop.page}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-moss hover:underline"
                >
                  Baca selengkapnya di Wikipedia
                  <ArrowUpRight className="size-4" />
                </a>
              </>
            ) : (
              <p className="mt-3 text-muted-foreground">
                Deskripsi Wikipedia berbahasa Indonesia belum tersedia untuk
                spesies ini.
              </p>
            )}
          </div>

          {classification.length > 0 && (
            <div className="mt-8 rounded-2xl bg-card p-5 ring-1 ring-border">
              <h2 className="text-xl font-bold text-forest">Klasifikasi</h2>
              <ol className="mt-4 space-y-0">
                {classification.map((a, i) => (
                  <li key={a.id} className="relative flex gap-4 pb-3 last:pb-0">
                    {i < classification.length - 1 && (
                      <span className="absolute top-3 left-[5px] h-full w-px bg-border" />
                    )}
                    <span className="relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-moss bg-card" />
                    <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3">
                      <span className="text-sm text-muted-foreground">
                        {RANK_LABEL[a.rank]}
                      </span>
                      <span className="text-sm font-medium">
                        {a.name}
                        {a.preferred_common_name && (
                          <span className="font-normal text-muted-foreground capitalize">
                            {" "}
                            · {a.preferred_common_name}
                          </span>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <Button asChild variant="outline" className="mt-6">
            <a
              href={`https://www.inaturalist.org/taxa/${taxon.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Lihat di iNaturalist <ArrowUpRight />
            </a>
          </Button>
        </div>
      </section>

      {family && (
        <RelatedAnimals familyId={family.id} familyName={family.name} excludeId={taxon.id} />
      )}
    </>
  );
};

/* ---------------- Sub-komponen ---------------- */

const PhotoGallery = ({ taxon }: { taxon: Taxon }) => {
  const photos = (taxon.taxon_photos ?? []).map((tp) => tp.photo).slice(0, 6);
  if (photos.length === 0 && taxon.default_photo) photos.push(taxon.default_photo);
  const [active, setActive] = useState(0);
  const main = photos[active];

  if (!main) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-muted text-muted-foreground">
        <ImageOff className="size-10" />
      </div>
    );
  }

  return (
    <div>
      <figure className="overflow-hidden rounded-3xl bg-muted">
        <img
          src={photoSize(main.medium_url, "large")}
          alt={taxon.preferred_common_name ?? taxon.name}
          className="aspect-[4/3] w-full object-cover"
        />
      </figure>
      <p className="mt-2 text-xs text-muted-foreground">{main.attribution}</p>

      {photos.length > 1 && (
        <div className="mt-4 grid grid-cols-6 gap-2">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "overflow-hidden rounded-xl ring-2 transition",
                i === active
                  ? "ring-moss"
                  : "opacity-70 ring-transparent hover:opacity-100"
              )}
              aria-label={`Foto ${i + 1}`}
            >
              <img
                src={p.square_url}
                alt=""
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const RelatedAnimals = ({
  familyId,
  familyName,
  excludeId,
}: {
  familyId: number;
  familyName: string;
  excludeId: number;
}) => {
  const { data, loading } = useAsync(
    () => searchAnimals({ taxonId: familyId, perPage: 5 }),
    [familyId]
  );
  const related = (data?.results ?? [])
    .filter((t) => t.id !== excludeId)
    .slice(0, 4);

  if (!loading && related.length === 0) return null;

  return (
    <section className="container-page mt-20">
      <p className="text-sm font-semibold tracking-wider text-clay uppercase">
        Satu keluarga
      </p>
      <h2 className="mt-2 text-3xl font-bold text-forest">
        Kerabat dari famili {familyName}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <AnimalCardSkeleton key={i} />)
          : related.map((t) => <AnimalCard key={t.id} taxon={t} />)}
      </div>
    </section>
  );
};

const Stat = ({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Eye;
  value: string;
  label: string;
}) => (
  <div className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
    <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-moss">
      <Icon className="size-5" />
    </span>
    <div>
      <p className="font-display text-xl font-bold text-forest">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

const DetailSkeleton = () => (
  <div className="container-page grid animate-pulse gap-10 pt-14 lg:grid-cols-[1.15fr_1fr]">
    <div className="aspect-[4/3] rounded-3xl bg-muted" />
    <div className="space-y-4">
      <div className="h-6 w-24 rounded-full bg-muted" />
      <div className="h-12 w-3/4 rounded-xl bg-muted" />
      <div className="h-6 w-1/2 rounded-xl bg-muted" />
      <div className="h-40 rounded-2xl bg-muted" />
    </div>
  </div>
);

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default AnimalDetailPage;
