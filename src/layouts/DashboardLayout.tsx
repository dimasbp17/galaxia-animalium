import { Outlet, ScrollRestoration, useNavigation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const DashboardLayout = () => {
  // "loading" saat chunk halaman berikutnya sedang diunduh
  const isNavigating = useNavigation().state === "loading";

  return (
    <div className="flex min-h-svh flex-col">
      {isNavigating && (
        <div className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-moss/20">
          <div className="h-full w-1/3 animate-[nav-progress_1s_ease-in-out_infinite] bg-moss" />
        </div>
      )}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Kembalikan posisi scroll saat back/forward, ke atas saat pindah halaman */}
      <ScrollRestoration />
    </div>
  );
};

export default DashboardLayout;
