import { heatLayer, HeatLayer } from "leaflet";

export default function GetHeatLayer(): HeatLayer {
  const heat = heatLayer([], {});

  return heat;
}
