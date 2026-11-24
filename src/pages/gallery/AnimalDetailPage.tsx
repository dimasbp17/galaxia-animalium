import { lazy, Suspense, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Eye,
  ImageOff,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimalCard, { AnimalCardSkeleton } from "@/components/AnimalCard";
import ConservationBadge from "@/components/ConservationBadge";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CATEGORIES } from "@/lib/categories";
import { getGlobalStatus, getIucnCategory, getPlaceStatus } from "@/lib/conservation";
import {
  animalQuery,
  animalsQuery,
  observationSummaryQuery,
  wikiQuery,
} from "@/lib/queries";
import { INDONESIA } from "@/lib/regions";
import { cn } from "@/lib/utils";
import { photoSize } from "@/services/inaturalist";
import type { Taxon } from "@/types/animal";

// Leaflet cukup besar — hanya diunduh saat halaman detail dibuka
const DistributionMap = lazy(() => import("@/components/DistributionMap"));

const RANK_LABEL: Record<string, string> = {
  kingdom: "Kerajaan",
  phylum: "Filum",
  class: "Kelas",
  order: "Ordo",
  family: "Famili",
  genus: "Genus",
};

const AnimalDetailPage = () => {
  const id = Number(useParams().id);
  const { data: taxon, isPending, isError, error } = useQuery(animalQuery(id));

  const name = taxon ? (taxon.preferred_common_name ?? taxon.name) : undefined;
  useDocumentTitle(name ? capitalize(name) : undefined);

  if (isPending) return <DetailSkeleton />;

  if (isError || !taxon) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <h1 className="text-3xl font-bold text-forest">
          {isError ? "Gagal memuat data" : "Hewan tidak ditemukan"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isError ? error.message : "Spesies yang kamu cari tidak tersedia."}
        </p>
        <Button asChild className="mt-6">
          <Link to="/gallery">Kembali ke Gallery</Link>
        </Button>
      </div>
    );
  }

  // `key` → state galeri foto di-reset saat pindah ke hewan lain
  return <AnimalDetail key={taxon.id} taxon={taxon} />;
};

const AnimalDetail = ({ taxon }: { taxon: Taxon }) => {
  const name = taxon.preferred_common_name ?? taxon.name;
  const { data: wiki, isPending: wikiPending } = useQuery(
    wikiQuery([taxon.preferred_common_name, taxon.name])
  );
  const { data: summary } = useQuery(observationSummaryQuery(taxon.id));

  const classification = (taxon.ancestors ?? []).filter((a) => a.rank in RANK_LABEL);
  const category = CATEGORIES.find((c) =>
    (taxon.ancestors ?? []).some((a) => a.id === c.taxonId)
  );
  const family = classification.find((a) => a.rank === "family");
  const globalStatus = getGlobalStatus(taxon);
  const indonesiaStatus = getPlaceStatus(taxon, INDONESIA.placeId);

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
              <Link to={`/gallery?kategori=${category.slug}`} className="hover:text-foreground">
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
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <Link
                to={`/gallery?kategori=${category.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-moss"
              >
                <category.icon className="size-3.5" />
                {category.label}
              </Link>
            )}
            <ConservationBadge status={globalStatus} />
            {!!summary?.indonesiaCount && (
              <Link
                to="/gallery?wilayah=indonesia"
                className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1 text-xs font-semibold text-sand"
              >
                <MapPin className="size-3.5" />
                Tercatat di Indonesia
              </Link>
            )}
          </div>

          <h1 className="mt-4 text-4xl font-bold text-forest capitalize md:text-5xl">{name}</h1>
          <p className="mt-2 text-xl text-muted-foreground italic">{taxon.name}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat
              icon={Eye}
              value={taxon.observations_count.toLocaleString("id-ID")}
              label="observasi di dunia"
            />
            <Stat
              icon={MapPin}
              value={summary ? summary.indonesiaCount.toLocaleString("id-ID") : "…"}
              label="observasi di Indonesia"
            />
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-forest">Tentang hewan ini</h2>
            {wikiPending ? (
              <div className="mt-3 space-y-2">
                <div className="h-4 animate-pulse rounded bg-muted" />
                <div className="h-4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            ) : wiki ? (
              <>
                <p className="mt-3 leading-relaxed text-foreground/85">{wiki.extract}</p>
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
                Deskripsi Wikipedia berbahasa Indonesia belum tersedia untuk spesies ini.
              </p>
            )}
          </div>

          {classification.length > 0 && (
            <div className="mt-8 rounded-2xl bg-card p-5 ring-1 ring-border">
              <h2 className="text-xl font-bold text-forest">Klasifikasi</h2>
              <ol className="mt-4">
                {classification.map((a, i) => (
                  <li key={a.id} className="relative flex gap-4 pb-3 last:pb-0">
                    {i < classification.length - 1 && (
                      <span className="absolute top-3 left-[5px] h-full w-px bg-border" />
                    )}
                    <span className="relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-moss bg-card" />
                    <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3">
                      <span className="text-sm text-muted-foreground">{RANK_LABEL[a.rank]}</span>
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
            <a href={`https://www.inaturalist.org/taxa/${taxon.id}`} target="_blank" rel="noreferrer">
              Lihat di iNaturalist <ArrowUpRight />
            </a>
          </Button>
        </div>
      </section>

      {/* ---------- Status konservasi ---------- */}
      <ConservationSection globalStatus={globalStatus} indonesiaStatus={indonesiaStatus} />

      {/* ---------- Peta sebaran ---------- */}
      <section className="container-page mt-20">
        <p className="text-sm font-semibold tracking-wider text-clay uppercase">Sebaran</p>
        <h2 className="mt-2 text-3xl font-bold text-forest">Di mana hewan ini ditemukan?</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Setiap kotak menunjukkan area tempat {name} pernah diamati di alam liar
          (bukan di kebun binatang). Perbesar peta untuk
          melihat titik observasi satu per satu.
        </p>
        <div className="mt-8">
          {summary ? (
            <Suspense fallback={<MapSkeleton />}>
              <DistributionMap taxonId={taxon.id} bounds={summary.bounds} />
            </Suspense>
          ) : (
            <MapSkeleton />
          )}
        </div>
      </section>

      {family && (
        <RelatedAnimals familyId={family.id} familyName={family.name} excludeId={taxon.id} />
      )}
    </>
  );
};

/* ---------------- Sub-komponen ---------------- */

const ConservationSection = ({
  globalStatus,
  indonesiaStatus,
}: {
  globalStatus: ReturnType<typeof getGlobalStatus>;
  indonesiaStatus: ReturnType<typeof getPlaceStatus>;
}) => {
  const global = getIucnCategory(globalStatus);
  if (!global && !indonesiaStatus) return null;

  return (
    <section className="container-page mt-20">
      <div className="rounded-3xl bg-card p-7 ring-1 ring-border md:p-10">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-moss">
            <ShieldAlert className="size-5" />
          </span>
          <h2 className="text-2xl font-bold text-forest">Status konservasi</h2>
        </div>

        {global && (
          <>
            <IucnScale activeCode={global.code} />
            <p className="mt-4 text-sm text-muted-foreground">
              Menurut <strong className="text-foreground">Daftar Merah IUCN</strong>, spesies ini
              berstatus <strong className="text-foreground">{global.label}</strong> ({global.code}).
            </p>
          </>
        )}

        {indonesiaStatus && (
          <p className="mt-3 text-sm text-muted-foreground">
            Status di Indonesia
            {indonesiaStatus.authority && <> menurut {indonesiaStatus.authority}</>}:{" "}
            <strong className="text-foreground">
              {getIucnCategory(indonesiaStatus)?.label ??
                indonesiaStatus.status_name ??
                indonesiaStatus.status}
            </strong>
          </p>
        )}
      </div>
    </section>
  );
};

const IUCN_SCALE = [
  { code: "LC", color: "bg-emerald-500" },
  { code: "NT", color: "bg-lime-500" },
  { code: "VU", color: "bg-amber-500" },
  { code: "EN", color: "bg-orange-500" },
  { code: "CR", color: "bg-red-600" },
  { code: "EW", color: "bg-purple-700" },
  { code: "EX", color: "bg-stone-900" },
];

/** Skala IUCN dari Risiko Rendah sampai Punah, dengan status aktif disorot. */
const IucnScale = ({ activeCode }: { activeCode: string }) => (
  <div className="mt-6 overflow-x-auto">
    <div className="flex min-w-[420px] gap-1.5">
      {IUCN_SCALE.map((s) => {
        const active = s.code === activeCode;
        return (
          <div key={s.code} className="flex-1 text-center">
            <div
              className={cn(
                "h-2.5 rounded-full transition",
                s.color,
                active ? "opacity-100" : "opacity-20"
              )}
            />
            <p
              className={cn(
                "mt-2 text-xs",
                active ? "font-bold text-foreground" : "text-muted-foreground"
              )}
            >
              {s.code}
            </p>
          </div>
        );
      })}
    </div>
    {activeCode === "DD" && (
      <p className="mt-2 text-xs text-muted-foreground">
        Kurang Data (DD) — belum cukup informasi untuk menilai risikonya.
      </p>
    )}
  </div>
);

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
                i === active ? "ring-moss" : "opacity-70 ring-transparent hover:opacity-100"
              )}
              aria-label={`Foto ${i + 1}`}
            >
              <img src={p.square_url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
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
  const { data, isPending } = useQuery(animalsQuery({ taxonId: familyId }, 5));
  const related = (data?.results ?? []).filter((t) => t.id !== excludeId).slice(0, 4);

  if (!isPending && related.length === 0) return null;

  return (
    <section className="container-page mt-20">
      <p className="text-sm font-semibold tracking-wider text-clay uppercase">Satu keluarga</p>
      <h2 className="mt-2 text-3xl font-bold text-forest">Kerabat dari famili {familyName}</h2>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {isPending
          ? Array.from({ length: 4 }).map((_, i) => <AnimalCardSkeleton key={i} />)
          : related.map((t) => <AnimalCard key={t.id} taxon={t} />)}
      </div>
    </section>
  );
};

const Stat = ({ icon: Icon, value, label }: { icon: typeof Eye; value: string; label: string }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-moss">
      <Icon className="size-5" />
    </span>
    <div>
      <p className="font-display text-xl font-bold text-forest">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

const MapSkeleton = () => (
  <div className="h-[380px] animate-pulse rounded-3xl bg-muted md:h-[460px]" />
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
