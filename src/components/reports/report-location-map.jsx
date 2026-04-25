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

function createMarkerIcon(color) {
  if (typeof window === "undefined") return null;

  const L = require("leaflet");

  return L.divIcon({
    className: "custom-report-marker",
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: ${color};
        border: 4px solid white;
        border-radius: 999px;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);
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
  officerLocation,
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

  const reportIcon = useMemo(() => createMarkerIcon("#2563eb"), []);
  const officerIcon = useMemo(() => createMarkerIcon("#16a34a"), []);

  const officerLat = Number(officerLocation?.latitude);
  const officerLng = Number(officerLocation?.longitude);

  const hasOfficerLocation =
    Number.isFinite(officerLat) &&
    Number.isFinite(officerLng) &&
    officerLat >= -90 &&
    officerLat <= 90 &&
    officerLng >= -180 &&
    officerLng <= 180;

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

          <Marker position={[lat, lng]} icon={reportIcon}>
            <Popup>
              <div className="space-y-1">
                <p className="m-0 text-sm font-semibold text-slate-800">
                  Report Location
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

          {hasOfficerLocation ? (
            <Marker position={[officerLat, officerLng]} icon={officerIcon}>
              <Popup>
                <div className="space-y-1">
                  <p className="m-0 text-sm font-semibold text-slate-800">
                    Officer Live Location
                  </p>
                  <p className="m-0 text-xs text-slate-500">
                    {officerLat}, {officerLng}
                  </p>
                </div>
              </Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </div>
    </div>
  );
}
