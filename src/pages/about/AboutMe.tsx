import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  Heart,
  Layers,
  Search,
  Telescope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/SectionHeading";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const steps = [
  {
    icon: Search,
    title: "Cari atau pilih kategori",
    text: "Ketik nama hewan dalam bahasa Indonesia, nama ilmiah, atau mulai dari kelompok seperti mamalia dan burung.",
  },
  {
    icon: Camera,
    title: "Lihat foto asli",
    text: "Setiap foto adalah hasil pengamatan nyata dari naturalis di seluruh dunia, lengkap dengan atribusi pemotretnya.",
  },
  {
    icon: BookOpen,
    title: "Pelajari lebih dalam",
    text: "Baca deskripsi, telusuri klasifikasi dari kerajaan hingga genus, dan temukan kerabat satu famili.",
  },
];

const sources = [
  {
    name: "iNaturalist",
    url: "https://www.inaturalist.org",
    text: "Jaringan sains warga dari California Academy of Sciences dan National Geographic Society. Sumber data spesies, taksonomi, nama umum, dan foto.",
  },
  {
    name: "Wikipedia Indonesia",
    url: "https://id.wikipedia.org",
    text: "Ensiklopedia bebas berbahasa Indonesia. Sumber ringkasan deskripsi tiap hewan.",
  },
];

const AboutMe = () => {
  useDocumentTitle("Tentang");

  return (
    <>
      {/* ---------- Intro ---------- */}
      <section className="container-page grid gap-12 pt-12 pb-8 md:pt-20 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold tracking-wider text-clay uppercase">
            Tentang
          </p>
          <h1 className="mt-3 text-4xl leading-[1.1] font-bold text-forest md:text-5xl">
            Satu galaksi, jutaan bentuk kehidupan.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Galaxia Animalium</strong> —
            “galaksi para hewan” — adalah ensiklopedia visual yang mengajak
            siapa saja mengenal keragaman satwa di bumi dengan cara yang
            sederhana dan menyenangkan.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Alih-alih menyimpan data sendiri, situs ini merangkai data terbuka
            yang terus diperbarui oleh komunitas ilmuwan dan naturalis, lalu
            menyajikannya dalam bahasa Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Telescope, label: "Eksplorasi", text: "Jelajahi tanpa batas" },
            { icon: Layers, label: "Taksonomi", text: "Klasifikasi lengkap" },
            { icon: Camera, label: "Foto asli", text: "Dari pengamatan nyata" },
            { icon: Heart, label: "Terbuka", text: "Data bebas & gratis" },
          ].map((f) => (
            <div key={f.label} className="rounded-2xl bg-card p-5 ring-1 ring-border">
              <f.icon className="size-6 text-moss" />
              <p className="mt-3 font-display font-semibold text-forest">{f.label}</p>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Cara pakai ---------- */}
      <section className="container-page mt-20">
        <SectionHeading eyebrow="Cara pakai" title="Tiga langkah menjelajah" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-3xl bg-card p-7 ring-1 ring-border">
              <span className="absolute top-6 right-7 font-display text-5xl font-bold text-secondary">
                0{i + 1}
              </span>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-forest text-sand">
                <s.icon className="size-6" />
              </span>
              <h3 className="mt-6 text-xl font-bold text-forest">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Sumber data ---------- */}
      <section className="container-page mt-20">
        <SectionHeading
          eyebrow="Sumber data"
          title="Berdiri di atas data terbuka"
          description="Terima kasih kepada komunitas yang membuat pengetahuan ini bebas diakses."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {sources.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-3xl bg-card p-7 ring-1 ring-border transition hover:ring-moss"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-forest">{s.name}</h3>
                <ArrowUpRight className="size-5 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-moss" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {s.text}
              </p>
            </a>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Hak cipta setiap foto tetap milik pemotretnya; lisensi dan atribusi
          ditampilkan di halaman detail masing-masing hewan.
        </p>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="container-page mt-20 text-center">
        <h2 className="text-3xl font-bold text-forest">Siap menjelajah?</h2>
        <Button asChild size="lg" className="mt-6">
          <Link to="/gallery">
            Buka Gallery <ArrowRight />
          </Link>
        </Button>
      </section>
    </>
  );
};

export default AboutMe;
