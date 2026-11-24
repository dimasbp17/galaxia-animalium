import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotFoundPage from "./NotFoundPage";

/**
 * Error boundary untuk route. Menangkap error saat render halaman,
 * termasuk gagal memuat chunk JS (mis. setelah deploy versi baru).
 */
const ErrorPage = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  const message =
    error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText}`
        : "Terjadi kesalahan yang tidak diketahui.";

  if (import.meta.env.DEV) console.error(error);

  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-8" />
      </span>
      <h1 className="mt-6 text-3xl font-bold text-forest">
        Waduh, ada yang tidak beres
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Halaman ini gagal dimuat. Coba muat ulang — kalau masih terjadi, kembali
        lagi nanti.
      </p>
      {import.meta.env.DEV && (
        <pre className="mt-6 max-w-full overflow-x-auto rounded-xl bg-muted p-4 text-left text-xs text-muted-foreground">
          {message}
        </pre>
      )}
      <div className="mt-8 flex gap-3">
        <Button onClick={() => window.location.reload()}>
          <RotateCcw /> Muat ulang
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
