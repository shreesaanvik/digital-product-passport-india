"use client";

import { Fragment, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { CLUSTERS } from "@/lib/data";

import "leaflet/dist/leaflet.css";

const FM_BLUE = "#1799b5";
const FM_BTN_BG = "#0081A1";
const FM_BTN_TEXT = "#006E8A";

export type LocationPin = {
  lat: number;
  lng: number;
  label: string;
};

type ClusterMapProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  matchedIds?: string[] | null;
};

type PinMapProps = {
  pin: LocationPin;
};

function FitSelection({ selectedId }: { selectedId: string | null }) {
  const map = useMap();
  const skipFirst = useRef(true);

  useEffect(() => {
    const c = CLUSTERS.find((x) => x.id === selectedId);
    if (!c) return;

    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }

    map.flyTo([c.lat, c.lng], 6, { duration: 0.45 });
  }, [map, selectedId]);

  return null;
}

function pinClasses(
  selectedId: string | null,
  clusterId: string,
  matchedIds: string[] | null | undefined,
) {
  const filtering = matchedIds != null;
  const isSelected = selectedId === clusterId;
  const isMatched = !filtering || matchedIds.includes(clusterId);

  if (isSelected) {
    return {
      pin: "fm-map-pin fm-map-pin--active",
      halo: "fm-map-pin-halo fm-map-pin-halo--active",
    };
  }
  if (filtering && isMatched) {
    return {
      pin: "fm-map-pin fm-map-pin--matched",
      halo: "fm-map-pin-halo fm-map-pin-halo--matched",
    };
  }
  if (filtering && !isMatched) {
    return {
      pin: "fm-map-pin fm-map-pin--dimmed",
      halo: "fm-map-pin-halo fm-map-pin-halo--dimmed",
    };
  }
  return {
    pin: "fm-map-pin fm-map-pin--idle",
    halo: "fm-map-pin-halo fm-map-pin-halo--idle",
  };
}

function MapSizeGuard() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let frame = 0;
    const update = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width < 1 || height < 1) return;
      const size = map.getSize();
      if (size.x === width && size.y === height) return;
      map.invalidateSize();
    };
    update();
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    });
    observer.observe(container);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [map]);

  return null;
}

function SinglePinMap({ pin }: { pin: LocationPin }) {
  return (
    <div
      className="relative z-0 isolate w-full max-w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-neu"
      role="region"
      aria-label={`Map of ${pin.label}`}
    >
      <MapContainer
        center={[pin.lat, pin.lng]}
        zoom={8}
        className="z-0 h-[200px] w-full max-w-full [&_.leaflet-bottom]:!z-[2] [&_.leaflet-control]:!z-[2] [&_.leaflet-control-attribution]:bg-white/90 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-pane]:!z-[1] [&_.leaflet-top]:!z-[2]"
        scrollWheelZoom={false}
        zoomSnap={0.25}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapSizeGuard />
        <CircleMarker
          center={[pin.lat, pin.lng]}
          radius={24}
          interactive={false}
          pathOptions={{
            className: "fm-map-pin-halo fm-map-pin-halo--active",
            color: FM_BLUE,
            weight: 1.5,
            fillColor: FM_BLUE,
            fillOpacity: 0.28,
          }}
        />
        <CircleMarker
          center={[pin.lat, pin.lng]}
          radius={11}
          interactive={false}
          pathOptions={{
            className: "fm-map-pin fm-map-pin--active",
            color: FM_BLUE,
            weight: 2.5,
            fillColor: FM_BTN_BG,
            fillOpacity: 0.95,
          }}
        />
      </MapContainer>
    </div>
  );
}

export function IndiaMap(props: ClusterMapProps | PinMapProps) {
  const bounds = useMemo(() => {
    const pts = CLUSTERS.map((c) => L.latLng(c.lat, c.lng));
    return L.latLngBounds(pts);
  }, []);

  if ("pin" in props) {
    return <SinglePinMap pin={props.pin} />;
  }
  const { selectedId, onSelect, matchedIds = null } = props;

  return (
    <div
      className="relative w-full max-h-[320px] min-h-[260px] rounded-2xl bg-slate-100 shadow-neu overflow-hidden border border-slate-200/80 z-0"
      role="application"
      aria-label="Map of India with heritage craft clusters. Tap a marker to select."
    >
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [28, 28], maxZoom: 6 }}
        className="h-[280px] w-full z-0 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:bg-white/90"
        scrollWheelZoom={false}
        zoomSnap={0.25}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitSelection selectedId={selectedId} />
        <MapSizeGuard />
        {CLUSTERS.map((c) => {
          const active = selectedId === c.id;
          const filtering = matchedIds != null;
          const isMatched = !filtering || matchedIds.includes(c.id);
          const isDimmed = filtering && !isMatched;
          const classes = pinClasses(selectedId, c.id, matchedIds);

          return (
            <Fragment key={c.id}>
              <CircleMarker
                center={[c.lat, c.lng]}
                radius={active ? 24 : isMatched && filtering ? 20 : 16}
                interactive={false}
                pathOptions={{
                  className: classes.halo,
                  color: active || (filtering && isMatched) ? FM_BLUE : FM_BTN_TEXT,
                  weight: active ? 1.5 : filtering && isMatched ? 1 : 0,
                  fillColor: active || (filtering && isMatched) ? FM_BLUE : FM_BTN_TEXT,
                  fillOpacity: isDimmed
                    ? 0.08
                    : active
                      ? 0.28
                      : filtering && isMatched
                        ? 0.22
                        : 0.18,
                }}
              />
              <CircleMarker
                center={[c.lat, c.lng]}
                radius={active ? 11 : filtering && isMatched ? 10 : 8}
                pathOptions={{
                  className: classes.pin,
                  color: active || (filtering && isMatched) ? FM_BLUE : FM_BTN_TEXT,
                  weight: active ? 2.5 : filtering && isMatched ? 2.25 : 2,
                  fillColor: active
                    ? FM_BTN_BG
                    : filtering && isMatched
                      ? FM_BLUE
                      : FM_BTN_TEXT,
                  fillOpacity: isDimmed
                    ? 0.25
                    : active
                      ? 0.95
                      : filtering && isMatched
                        ? 0.9
                        : 0.88,
                }}
                eventHandlers={{
                  click: () => onSelect(c.id),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -8]}
                  opacity={1}
                  className="fm-cluster-tooltip"
                >
                  <span className="block w-40">
                    <Image
                      src={c.image}
                      alt={c.imageAlt}
                      width={160}
                      height={80}
                      className="h-20 w-40 rounded object-cover"
                    />
                    <span className="mt-1 block text-center text-xs leading-snug">
                      {c.name}, {c.craft}
                    </span>
                  </span>
                </Tooltip>
              </CircleMarker>
            </Fragment>
          );
        })}
      </MapContainer>
      <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-xs text-fm-muted px-2 bg-white/85 backdrop-blur-sm py-1.5 border-t border-slate-100">
        OpenStreetMap · Tap a dot. Glowing blue is selected.
      </p>
    </div>
  );
}
