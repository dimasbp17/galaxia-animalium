import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ErrorPage from "./pages/ErrorPage";
import PageLoader from "./components/PageLoader";

/** Muat halaman secara lazy → tiap halaman jadi chunk JS terpisah. */
const page = (load: () => Promise<{ default: ComponentType }>) => () =>
  load().then((m) => ({ Component: m.default }));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    // Cadangan terakhir kalau layout sendiri error
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        // Error di halaman tampil di dalam layout (navbar & footer tetap ada)
        errorElement: <ErrorPage />,
        children: [
          { index: true, lazy: page(() => import("./pages/landing/LandingPage")) },
          { path: "about", lazy: page(() => import("./pages/about/AboutMe")) },
          { path: "gallery", lazy: page(() => import("./pages/gallery/GalleryPage")) },
          {
            path: "gallery/:id",
            lazy: page(() => import("./pages/gallery/AnimalDetailPage")),
          },
          { path: "*", lazy: page(() => import("./pages/NotFoundPage")) },
        ],
      },
    ],
  },
]);
