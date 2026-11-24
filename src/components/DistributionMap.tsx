import "leaflet/dist/leaflet.css";
import type { LatLngBoundsExpression } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import { observationTileUrl } from "@/services/inaturalist";
import type { ObservationBounds } from "@/types/animal";

interface DistributionMapProps {
  taxonId: number;
  bounds: ObservationBounds | null;
}

/** Zoom ≤ 7 tampil sebagai kotak (grid), zoom ≥ 8 sebagai titik observasi. */
const GRID_MAX_ZOOM = 7;
const OVERLAY_COLOR = "#c8693c";

function toLeafletBounds(b: ObservationBounds | null): LatLngBoundsExpression | undefined {
  if (!b) return undefined;
  // Lewati kotak yang melintasi garis tanggal internasional atau berupa satu titik
  if (b.swlng > b.nelng || (b.swlat === b.nelat && b.swlng === b.nelng)) {
    return undefined;
  }
  return [
    [b.swlat, b.swlng],
    [b.nelat, b.nelng],
  ];
}

const DistributionMap = ({ taxonId, bounds }: DistributionMapProps) => {
  const leafletBounds = toLeafletBounds(bounds);

  return (
    // `isolate` supaya layer Leaflet (z-index 400+) tidak menutupi navbar
    <div className="isolate overflow-hidden rounded-3xl ring-1 ring-border">
      <MapContainer
        {...(leafletBounds
          ? { bounds: leafletBounds, boundsOptions: { padding: [24, 24], maxZoom: 6 } }
          : { center: [bounds?.swlat ?? 0, bounds?.swlng ?? 115], zoom: bounds ? 5 : 2 })}
        minZoom={2}
        maxZoom={13}
        scrollWheelZoom={false}
        worldCopyJump
        className="h-[380px] w-full bg-[#aad3df] md:h-[460px]"
      >
        {/* Peta dasar OpenStreetMap — tanpa API key, wajib cantumkan atribusi */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          className="map-basemap"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <TileLayer
          url={observationTileUrl("grid", taxonId, OVERLAY_COLOR)}
          maxZoom={GRID_MAX_ZOOM}
          opacity={0.95}
          attribution='Observasi &copy; <a href="https://www.inaturalist.org">iNaturalist</a>'
        />
        <TileLayer
          url={observationTileUrl("points", taxonId, OVERLAY_COLOR)}
          minZoom={GRID_MAX_ZOOM + 1}
        />
      </MapContainer>
    </div>
  );
};

export default DistributionMap;
