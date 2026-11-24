import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const NotFoundPage = () => {
  useDocumentTitle("Halaman tidak ditemukan");

  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-moss">
        <Compass className="size-8" />
      </span>
      <p className="mt-6 font-display text-6xl font-bold text-forest">404</p>
      <h1 className="mt-2 text-2xl font-bold text-forest">
        Sepertinya kamu tersesat di hutan
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Halaman yang kamu cari tidak ada. Yuk kembali ke jalur yang benar.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link to="/">Ke Beranda</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/gallery">Buka Gallery</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
