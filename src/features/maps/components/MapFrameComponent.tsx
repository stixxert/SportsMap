import { map, tileLayer, Map } from "leaflet";
import { useEffect, useRef, useState } from "react";

import "leaflet/dist/leaflet.css";

export default function MapFrameComponent() {
  const mapRef = useRef<HTMLDivElement>(null);

  const [mapState, setMapState] = useState<Map | undefined>(undefined);

  useEffect(() => {
    if (!mapRef.current) return;

    const _map = map(mapRef.current).setView([0, 0], 3);

    setMapState(_map);
  }, []);

  if (mapState) {
    tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapState);
  }

  return <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>;
}
