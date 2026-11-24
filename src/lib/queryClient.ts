import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data spesies jarang berubah — simpan 10 menit sebelum dianggap basi.
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      // Hemat kuota API iNaturalist (~60 request/menit).
      refetchOnWindowFocus: false,
    },
  },
});
