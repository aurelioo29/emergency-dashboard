"use client";

import { useState } from "react";
import useSocket from "@/hooks/useSocket";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

export default function LiveMap({ report }) {
  const [officerLocation, setOfficerLocation] = useState(null);

  useSocket({
    onLocation: (data) => {
      if (data.reportId === report.id) {
        setOfficerLocation(data);
      }
    },
  });

  return (
    <MapContainer
      center={[report.latitude, report.longitude]}
      zoom={15}
      className="h-[400px]"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* USER */}
      <Marker position={[report.latitude, report.longitude]} />

      {/* OFFICER */}
      {officerLocation && (
        <Marker
          position={[officerLocation.latitude, officerLocation.longitude]}
        />
      )}
    </MapContainer>
  );
}
