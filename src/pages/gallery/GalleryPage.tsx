import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Globe, LoaderCircle, MapPin, Search, SearchX, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimalCard, { AnimalCardSkeleton } from "@/components/AnimalCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useInView } from "@/hooks/useInView";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { animalsInfiniteQuery } from "@/lib/queries";
import { getRegion, INDONESIA } from "@/lib/regions";
import { cn } from "@/lib/utils";
import type { Taxon } from "@/types/animal";

const PER_PAGE = 24;

/** Parameter URL: ?q=…&kategori=mamalia&wilayah=indonesia&status=terancam */
interface GalleryParams {
  q?: string;
  kategori?: string;
  wilayah?: string;
  status?: string;
}

const GalleryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const current: GalleryParams = {
    q: searchParams.get("q") ?? undefined,
    kategori: searchParams.get("kategori") ?? undefined,
    wilayah: searchParams.get("wilayah") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  };
  const query = current.q ?? "";
  const category = getCategory(current.kategori);
  const region = getRegion(current.wilayah);
  const threatened = current.status === "terancam";

  const [input, setInput] = useState(query);
  // Sinkronkan input kalau query berubah dari luar (mis. tombol back)
  useEffect(() => setInput(query), [query]);

  const titleParts = [
    category?.label ?? (region ? "Satwa" : "Semua Hewan"),
    region && `di ${region.label}`,
  ].filter(Boolean);
  const title = titleParts.join(" ");
  useDocumentTitle(`${title}${threatened ? " (terancam)" : ""} — Gallery`);

  const filters = useMemo(
    () => ({
      query,
      taxonId: category?.taxonId,
      placeId: region?.placeId,
      threatened,
    }),
    [query, category?.taxonId, region?.placeId, threatened]
  );

  const {
    data,
    isPending,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery(animalsInfiniteQuery(filters, PER_PAGE));

  // Gabungkan semua halaman & buang duplikat (bisa muncul antar halaman)
  const animals = useMemo(() => {
    const seen = new Set<number>();
    const list: Taxon[] = [];
    for (const page of data?.pages ?? []) {
      for (const t of page.results) {
        if (!seen.has(t.id)) {
          seen.add(t.id);
          list.push(t);
        }
      }
    }
    return list;
  }, [data]);
  const total = data?.pages[0]?.total_results ?? 0;

  // Infinite scroll: muat halaman berikutnya saat sentinel mendekati viewport
  const { ref: sentinelRef, inView } = useInView<HTMLDivElement>("600px");
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const update = (patch: Partial<GalleryParams>) => {
    const next = { ...current, ...patch };
    const params: Record<string, string> = {};
    for (const [k, v] of Object.entries(next)) if (v) params[k] = v;
    setSearchParams(params);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    update({ q: input.trim() || undefined });
  };

  return (
    <>
      {/* ---------- Header ---------- */}
      <section className="border-b border-border bg-card">
        <div className="container-page py-12 md:py-16">
          <p className="text-sm font-semibold tracking-wider text-clay uppercase">
            Gallery
          </p>
          <h1 className="mt-2 text-4xl font-bold text-forest md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {category ? `${category.description}. ` : ""}
            {region
              ? `Spesies yang pernah diamati di ${region.label}, diurutkan dari yang paling sering ditemui.`
              : "Spesies dari seluruh dunia, diurutkan dari yang paling sering diamati."}
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-8 flex max-w-xl items-center gap-2 rounded-full bg-background p-1.5 ring-1 ring-border focus-within:ring-2 focus-within:ring-moss"
          >
            <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cari nama hewan atau nama ilmiah…"
              className="h-10 min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
            {input && (
              <button
                type="button"
                onClick={() => {
                  setInput("");
                  update({ q: undefined });
                }}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
                aria-label="Hapus pencarian"
              >
                <X className="size-4" />
              </button>
            )}
            <Button type="submit" size="lg">
              Cari
            </Button>
          </form>

          {/* Wilayah & status */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full bg-background p-1 ring-1 ring-border">
              <SegmentButton
                active={!region}
                onClick={() => update({ wilayah: undefined })}
              >
                <Globe className="size-4" /> Dunia
              </SegmentButton>
              <SegmentButton
                active={region?.slug === INDONESIA.slug}
                onClick={() => update({ wilayah: INDONESIA.slug })}
              >
                <MapPin className="size-4" /> Indonesia
              </SegmentButton>
            </div>

            <button
              type="button"
              onClick={() => update({ status: threatened ? undefined : "terancam" })}
              aria-pressed={threatened}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 transition-colors",
                threatened
                  ? "bg-orange-100 text-orange-800 ring-orange-300"
                  : "bg-background text-foreground/70 ring-border hover:text-foreground"
              )}
              title="Status IUCN Hampir Terancam, Rentan, Genting, atau Kritis"
            >
              <ShieldAlert className="size-4" />
              Hanya satwa terancam
            </button>
          </div>
        </div>
      </section>

      {/* ---------- Filter kategori ---------- */}
      <div className="sticky top-16 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div className="container-page flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          <CategoryChip active={!category} onClick={() => update({ kategori: undefined })}>
            Semua
          </CategoryChip>
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.slug}
              active={category?.slug === c.slug}
              onClick={() => update({ kategori: c.slug })}
            >
              <c.icon className="size-4" />
              {c.label}
            </CategoryChip>
          ))}
        </div>
      </div>

      {/* ---------- Hasil ---------- */}
      <section className="container-page pt-8">
        {data && (
          <p className="mb-5 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {total.toLocaleString("id-ID")}
            </span>{" "}
            spesies ditemukan
            {query && (
              <>
                {" "}
                untuk “<span className="font-semibold text-foreground">{query}</span>”
              </>
            )}
          </p>
        )}

        {isError && !data && (
          <div className="rounded-2xl bg-destructive/10 p-6 text-destructive">
            Gagal memuat data: {error.message}
          </div>
        )}

        {isPending && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <AnimalCardSkeleton key={i} />
            ))}
          </div>
        )}

        {data && animals.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-moss">
              <SearchX className="size-7" />
            </span>
            <h2 className="mt-5 text-2xl font-bold text-forest">Tidak ada hasil</h2>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Coba kata kunci lain, gunakan nama ilmiah, atau longgarkan filter
              kategori, wilayah, dan status.
            </p>
          </div>
        )}

        {animals.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {animals.map((taxon) => (
              <AnimalCard key={taxon.id} taxon={taxon} />
            ))}
            {isFetchingNextPage &&
              Array.from({ length: 4 }).map((_, i) => <AnimalCardSkeleton key={`s${i}`} />)}
          </div>
        )}

        {/* Sentinel infinite scroll — selalu dirender supaya observer menempel */}
        <div ref={sentinelRef} aria-hidden className="h-px" />

        {data && (
          <div className="mt-10 flex justify-center">
            {isFetchNextPageError ? (
              <Button variant="outline" onClick={() => fetchNextPage()}>
                Gagal memuat — coba lagi
              </Button>
            ) : isFetchingNextPage ? (
              <LoaderCircle className="size-6 animate-spin text-moss" />
            ) : hasNextPage ? (
              <Button variant="outline" onClick={() => fetchNextPage()}>
                Muat lebih banyak
              </Button>
            ) : (
              animals.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Semua {animals.length.toLocaleString("id-ID")} spesies sudah ditampilkan.
                </p>
              )
            )}
          </div>
        )}
      </section>
    </>
  );
};

const SegmentButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
      active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"
    )}
  >
    {children}
  </button>
);

const CategoryChip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-primary text-primary-foreground"
        : "bg-card text-foreground/70 ring-1 ring-border hover:text-foreground"
    )}
  >
    {children}
  </button>
);

export default GalleryPage;
