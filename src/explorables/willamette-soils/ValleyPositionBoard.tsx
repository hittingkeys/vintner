import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import {
  EXTENT_UNCERTAINTY,
  MAP_ATTRIBUTION_CAPTION,
  PIN_DATUM_CAPTION,
  TYPE_LOCATION_PINS,
  WILLAKENZIE_SPLIT_CAPTION,
  formatDms,
  landformAtLonLat,
  landformForPin,
  selectLandform,
  typeLocationLonLat,
  type LandformId,
  type ValleySelection,
} from "./geography";
import { JORY, LAURELWOOD, WILLAKENZIE, type SeriesId } from "./model";
import {
  SERIES_EXTENTS,
  WILLAMETTE_VIEW,
} from "./series-extent";

const EXTENT_STYLE: Record<
  SeriesId,
  { fill: string; className: string }
> = {
  jory: { fill: "#c48a7a", className: "extent-jory" },
  willakenzie: { fill: "#c4a07a", className: "extent-willakenzie" },
  laurelwood: { fill: "#b4aea6", className: "extent-laurelwood" },
};

const ESRI_WORLD_TOPO =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";

const ESRI_ATTRIBUTION =
  "Tiles © Esri — Esri, USGS, NOAA, and the GIS User Community";

function seriesForLandform(id: LandformId): SeriesId | null {
  if (id === "surrounding-foothills") return "jory";
  if (id === "western-margin-hills" || id === "eastern-southern-margins") {
    return "willakenzie";
  }
  if (id === "northwest-margin-hills") return "laurelwood";
  return null;
}

function extentStyle(seriesId: SeriesId, selected: boolean): L.PathOptions {
  return {
    className: EXTENT_STYLE[seriesId].className,
    color: "#3d3832",
    weight: selected ? 2.5 : 1,
    fillColor: EXTENT_STYLE[seriesId].fill,
    fillOpacity: selected ? 0.72 : 0.42,
    opacity: 1,
  };
}

const PIN_NAME: Record<SeriesId, string> = {
  jory: JORY.name,
  willakenzie: WILLAKENZIE.name,
  laurelwood: LAURELWOOD.name,
};

/** F8: series name on the type-location pin, not a legend. Not a map overlay. */
function pinHtml(seriesId: SeriesId, selected: boolean): string {
  return `<span class="type-pin-mark"><span class="type-pin-btn" data-pin="${seriesId}" data-selected="${selected ? "true" : "false"}"></span><span class="type-pin-name">${PIN_NAME[seriesId]}</span></span>`;
}

export function ValleyPositionBoard({
  selection,
  onChooseLandform,
  onChoosePin,
}: {
  selection: ValleySelection;
  onChooseLandform: (id: LandformId) => void;
  onChoosePin: (seriesId: SeriesId) => void;
}) {
  const geo = selection === "unselected" ? null : selectLandform(selection);
  const selectedLandform = selection === "unselected" ? null : selection;
  const selectedSeries = selectedLandform
    ? seriesForLandform(selectedLandform)
    : null;

  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Partial<Record<SeriesId, L.GeoJSON>>>({});
  const pinsRef = useRef<Partial<Record<SeriesId, L.Marker>>>({});
  const onChooseLandformRef = useRef(onChooseLandform);
  const onChoosePinRef = useRef(onChoosePin);
  onChooseLandformRef.current = onChooseLandform;
  onChoosePinRef.current = onChoosePin;

  useEffect(() => {
    const el = mapEl.current;
    if (!el) return;

    const bounds = L.latLngBounds(
      [WILLAMETTE_VIEW.south, WILLAMETTE_VIEW.west],
      [WILLAMETTE_VIEW.north, WILLAMETTE_VIEW.east],
    );
    const map = L.map(el, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    })
      .setView([44.825, -123.0], 8)
      .fitBounds(bounds, { padding: [8, 8], maxZoom: 9 });

    L.tileLayer(ESRI_WORLD_TOPO, {
      attribution: ESRI_ATTRIBUTION,
      maxZoom: 16,
    }).addTo(map);

    const layerOrder: SeriesId[] = ["jory", "willakenzie", "laurelwood"];
    for (const seriesId of layerOrder) {
      const layer = L.geoJSON(SERIES_EXTENTS[seriesId] as Parameters<typeof L.geoJSON>[0], {
        style: () => extentStyle(seriesId, false),
        onEachFeature: (_feature, featureLayer) => {
          featureLayer.on("add", () => {
            const path = (featureLayer as L.Path).getElement();
            path?.setAttribute("data-extent", seriesId);
          });
        },
      }).addTo(map);
      layersRef.current[seriesId] = layer;
    }

    for (const pin of TYPE_LOCATION_PINS) {
      const { lat, lon } = typeLocationLonLat(pin.location);
      const label = `${pin.location.county} County type location — ${pin.seriesId}`;
      const marker = L.marker([lat, lon], {
        icon: L.divIcon({
          className: "type-pin",
          html: pinHtml(pin.seriesId, false),
          iconSize: [92, 20],
          iconAnchor: [8, 10],
        }),
        keyboard: true,
        title: label,
        alt: label,
        zIndexOffset: 400,
      }).addTo(map);
      const markerEl = marker.getElement();
      if (markerEl) L.DomEvent.disableClickPropagation(markerEl);
      marker.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        onChoosePinRef.current(pin.seriesId);
      });
      pinsRef.current[pin.seriesId] = marker;
    }

    map.on("click", (event: L.LeafletMouseEvent) => {
      const landform = landformAtLonLat(event.latlng.lng, event.latlng.lat);
      if (landform) onChooseLandformRef.current(landform);
    });

    function onProbe(event: Event) {
      const detail = (event as CustomEvent<{ lon: number; lat: number }>).detail;
      if (detail == null) return;
      const landform = landformAtLonLat(detail.lon, detail.lat);
      if (landform) onChooseLandformRef.current(landform);
    }
    function onDomClick(event: Event) {
      const target = event.target as HTMLElement | null;
      const pinEl = target?.closest?.("[data-pin]");
      if (!pinEl) return;
      event.stopPropagation();
      const seriesId = pinEl.getAttribute("data-pin");
      if (
        seriesId === "jory" ||
        seriesId === "willakenzie" ||
        seriesId === "laurelwood"
      ) {
        onChoosePinRef.current(seriesId);
      }
    }
    el.addEventListener("valley-map-lonlat", onProbe);
    el.addEventListener("click", onDomClick);

    mapRef.current = map;
    return () => {
      el.removeEventListener("valley-map-lonlat", onProbe);
      el.removeEventListener("click", onDomClick);
      map.remove();
      mapRef.current = null;
      layersRef.current = {};
      pinsRef.current = {};
    };
  }, []);

  useEffect(() => {
    for (const seriesId of ["jory", "willakenzie", "laurelwood"] as const) {
      layersRef.current[seriesId]?.setStyle(
        extentStyle(seriesId, selectedSeries === seriesId),
      );
    }
    for (const pin of TYPE_LOCATION_PINS) {
      const marker = pinsRef.current[pin.seriesId];
      if (!marker) continue;
      const pinSelected =
        selectedSeries === pin.seriesId &&
        selectedLandform === landformForPin(pin.seriesId);
      marker.setIcon(
        L.divIcon({
          className: "type-pin",
          html: pinHtml(pin.seriesId, pinSelected),
          iconSize: [92, 20],
          iconAnchor: [8, 10],
        }),
      );
      const markerEl = marker.getElement();
      if (markerEl) L.DomEvent.disableClickPropagation(markerEl);
    }
  }, [selectedLandform, selectedSeries]);

  return (
    <div className="valley-board" data-geography-state={selection}>
      <div className="valley-map-wrap">
        <div
          ref={mapEl}
          className="valley-map"
          data-valley-map="true"
          role="application"
          aria-label="Willamette Valley map. SoilWeb generalized series extents and OSD type-location pins. Pan, zoom, or click an extent or pin."
        />
        <p className="valley-caption">{MAP_ATTRIBUTION_CAPTION}</p>
        <p className="valley-caption">{PIN_DATUM_CAPTION}</p>
      </div>

      <aside className="valley-readout" aria-live="polite">
        <p className="valley-uncertainty">{EXTENT_UNCERTAINTY}</p>
        <p className="valley-uncertainty">{WILLAKENZIE_SPLIT_CAPTION}</p>
        {geo == null ? (
          <div className="valley-payload" data-readout="unselected">
            <p>
              <strong>Where:</strong> click a colored extent or a type-location
              pin. All three extents stay visible. Click the Willamette trough
              where none of the three hit for the valley floor.
            </p>
            <p>
              Same three named soils sit on different landforms because that is
              where their parent materials are.
            </p>
          </div>
        ) : geo.state === "floor" ? (
          <div className="valley-payload" data-readout="floor">
            <p>
              <strong>Where:</strong> {geo.where}
            </p>
            <p>
              <strong>Series:</strong> none of these three. Jory, Willakenzie,
              and Laurelwood are hillside soils.
            </p>
            <p>
              <strong>Parent material:</strong> {geo.parentMaterial}
            </p>
            <p data-osu-contrast="true">{geo.osuHillsideVsFloor}</p>
          </div>
        ) : (
          <div
            className="valley-payload"
            data-readout={geo.seriesId}
            data-landform={geo.landformId}
          >
            <p>
              <strong>Series:</strong> {geo.seriesName}
            </p>
            <p>
              <strong>Where:</strong> {geo.where}
            </p>
            <p>
              <strong>Parent material:</strong> {geo.parentMaterial}
            </p>
            {geo.formations ? (
              <p>
                <strong>Formation:</strong> {geo.formations.join(" and ")}
              </p>
            ) : null}
            {geo.elevationFt ? (
              <p>
                <strong>Elevation:</strong> {geo.elevationFt.min}–
                {geo.elevationFt.max} ft (OSD)
              </p>
            ) : null}
            {geo.typeLocation ? (
              <p>
                <strong>Type location:</strong> {geo.typeLocation.county}{" "}
                County, {geo.typeLocation.state}.{" "}
                {formatDms(geo.typeLocation.lat)},{" "}
                {formatDms(geo.typeLocation.lon)} ({geo.typeLocation.datum}).
              </p>
            ) : null}
            {geo.distribution ? (
              <p>
                <strong>Distribution:</strong> {geo.distribution}
              </p>
            ) : null}
            {geo.umpquaCaption ? (
              <p data-umpqua-caption="true">{geo.umpquaCaption}</p>
            ) : null}
            {geo.willakenzieAssociatedJory ? (
              <p data-associated-jory="true">{geo.willakenzieAssociatedJory}</p>
            ) : null}
          </div>
        )}
      </aside>
    </div>
  );
}
