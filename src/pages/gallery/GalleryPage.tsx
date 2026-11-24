import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimalCard, { AnimalCardSkeleton } from "@/components/AnimalCard";
import { useAsync } from "@/hooks/useAsync";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { searchAnimals } from "@/services/inaturalist";

const PER_PAGE = 24;
/** iNaturalist membatasi paginasi sampai 10.000 hasil. */
const MAX_RESULTS = 10000;

const GalleryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const category = getCategory(searchParams.get("kategori"));
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const [input, setInput] = useState(query);

  useDocumentTitle(category ? `${category.label} — Gallery` : "Gallery");

  // Sinkronkan input kalau query berubah dari luar (mis. tombol back)
  useEffect(() => setInput(query), [query]);

  const { data, loading, error } = useAsync(
    () =>
      searchAnimals({
        query,
        taxonId: category?.taxonId,
        page,
        perPage: PER_PAGE,
      }),
    [query, category?.taxonId, page]
  );

  const totalPages = data
    ? Math.ceil(Math.min(data.total_results, MAX_RESULTS) / PER_PAGE)
    : 1;

  const updateParams = (next: {
    q?: string;
    kategori?: string;
    page?: number;
  }) => {
    const params: Record<string, string> = {};
    if (next.q) params.q = next.q;
    if (next.kategori) params.kategori = next.kategori;
    if (next.page && next.page > 1) params.page = String(next.page);
    setSearchParams(params);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateParams({ q: input.trim(), kategori: category?.slug });
  };

  const goToPage = (p: number) => {
    updateParams({ q: query, kategori: category?.slug, page: p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* ---------- Header ---------- */}
      <section className="border-b border-border bg-card">
        <div className="container-page py-12 md:py-16">
          <p className="text-sm font-semibold tracking-wider text-clay uppercase">
            Gallery
          </p>
          <h1 className="mt-2 text-4xl font-bold text-forest md:text-5xl">
            {category ? category.label : "Semua Hewan"}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {category
              ? `${category.description}. Diurutkan dari yang paling sering diamati.`
              : "Telusuri spesies hewan dari seluruh dunia, diurutkan dari yang paling sering diamati."}
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
                  updateParams({ kategori: category?.slug });
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
        </div>
      </section>

      {/* ---------- Filter kategori ---------- */}
      <div className="sticky top-16 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div className="container-page flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          <CategoryChip
            active={!category}
            onClick={() => updateParams({ q: query })}
          >
            Semua
          </CategoryChip>
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.slug}
              active={category?.slug === c.slug}
              onClick={() => updateParams({ q: query, kategori: c.slug })}
            >
              <c.icon className="size-4" />
              {c.label}
            </CategoryChip>
          ))}
        </div>
      </div>

      {/* ---------- Hasil ---------- */}
      <section className="container-page pt-8">
        {data && !loading && (
          <p className="mb-5 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {data.total_results.toLocaleString("id-ID")}
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

        {error && !loading && (
          <div className="rounded-2xl bg-destructive/10 p-6 text-destructive">
            Gagal memuat data: {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <AnimalCardSkeleton key={i} />
            ))}
          </div>
        )}

        {data && !loading && data.results.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-moss">
              <SearchX className="size-7" />
            </span>
            <h2 className="mt-5 text-2xl font-bold text-forest">
              Tidak ada hasil
            </h2>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Coba kata kunci lain, gunakan nama ilmiah, atau pilih kategori
              “Semua”.
            </p>
          </div>
        )}

        {data && !loading && data.results.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.results.map((taxon) => (
              <AnimalCard key={taxon.id} taxon={taxon} />
            ))}
          </div>
        )}

        {data && !loading && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-32 text-center text-sm text-muted-foreground">
              Halaman{" "}
              <span className="font-semibold text-foreground">{page}</span> dari{" "}
              {totalPages.toLocaleString("id-ID")}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight />
            </Button>
          </div>
        )}
      </section>
    </>
  );
};

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
