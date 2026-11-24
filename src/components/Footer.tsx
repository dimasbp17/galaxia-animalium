import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-24 bg-forest text-sand">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-sand text-forest">
              <PawPrint className="size-5" />
            </span>
            <span className="font-display text-lg font-bold">
              Galaxia Animalium
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand/70">
            Ensiklopedia visual hewan dari seluruh dunia — dibangun di atas data
            terbuka dari komunitas naturalis dan Wikipedia.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Jelajahi</p>
          <ul className="mt-3 space-y-2 text-sm text-sand/70">
            <li>
              <Link to="/" className="hover:text-sand">
                Beranda
              </Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-sand">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-sand">
                Tentang
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Sumber Data</p>
          <ul className="mt-3 space-y-2 text-sm text-sand/70">
            <li>
              <a
                href="https://www.inaturalist.org"
                target="_blank"
                rel="noreferrer"
                className="hover:text-sand"
              >
                iNaturalist
              </a>
            </li>
            <li>
              <a
                href="https://id.wikipedia.org"
                target="_blank"
                rel="noreferrer"
                className="hover:text-sand"
              >
                Wikipedia Indonesia
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-sand/10">
        <p className="container-page py-6 text-xs text-sand/50">
          © {new Date().getFullYear()} Galaxia Animalium. Foto milik masing-masing
          pengamat di iNaturalist sesuai lisensi yang tertera.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
