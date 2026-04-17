"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  async () => (await import("react-leaflet")).MapContainer,
  { ssr: false },
);

const TileLayer = dynamic(
  async () => (await import("react-leaflet")).TileLayer,
  { ssr: false },
);

const Marker = dynamic(async () => (await import("react-leaflet")).Marker, {
  ssr: false,
});

const Popup = dynamic(async () => (await import("react-leaflet")).Popup, {
  ssr: false,
});

function createIcon() {
  if (typeof window === "undefined") return null;

  const L = require("leaflet");

  return L.divIcon({
    className: "custom-report-marker",
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #2563eb;
        border: 4px solid white;
        border-radius: 999px;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function ReportLocationMap({
  latitude,
  longitude,
  addressSnapshot,
}) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  const isValid =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  const markerIcon = useMemo(() => createIcon(), []);

  if (!isValid) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        Lokasi tidak tersedia atau koordinat tidak valid.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="h-[360px] w-full">
        <MapContainer
          center={[lat, lng]}
          zoom={16}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[lat, lng]} icon={markerIcon}>
            <Popup>
              <div className="space-y-1">
                <p className="m-0 text-sm font-semibold text-slate-800">
                  Titik Laporan
                </p>
                <p className="m-0 text-xs text-slate-500">
                  {addressSnapshot || "Alamat tidak tersedia"}
                </p>
                <p className="m-0 text-xs text-slate-500">
                  {lat}, {lng}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
