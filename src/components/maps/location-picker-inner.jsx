"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Input, Button, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      onPick({
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
      });
    },
  });

  return null;
}

function RecenterMap({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      !Number.isNaN(latitude) &&
      !Number.isNaN(longitude)
    ) {
      map.setView([latitude, longitude], map.getZoom());
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function LocationPickerInner({
  latitude,
  longitude,
  onChange,
  height = 320,
}) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);

  const safeLatitude =
    typeof latitude === "number" && !Number.isNaN(latitude) ? latitude : -6.2;

  const safeLongitude =
    typeof longitude === "number" && !Number.isNaN(longitude)
      ? longitude
      : 106.816666;

  const position = useMemo(
    () => [safeLatitude, safeLongitude],
    [safeLatitude, safeLongitude],
  );

  const handleSearch = async () => {
    const keyword = search.trim();

    if (!keyword) {
      message.warning("Please enter an address or place name");
      return;
    }

    try {
      setSearching(true);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(keyword)}&limit=5`,
      );

      if (!res.ok) {
        throw new Error("Failed to search location");
      }

      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);

      if (!data?.length) {
        message.info("No location found");
      }
    } catch (error) {
      message.error(error.message || "Failed to search address");
    } finally {
      setSearching(false);
    }
  };

  const handlePickResult = (item) => {
    const lat = Number(Number(item.lat).toFixed(6));
    const lng = Number(Number(item.lon).toFixed(6));

    onChange?.({
      latitude: lat,
      longitude: lng,
    });

    setResults([]);
    setSearch(item.display_name || "");
  };

  const handleMarkerDragEnd = (event) => {
    const marker = event.target;
    const newPosition = marker.getLatLng();

    onChange?.({
      latitude: Number(newPosition.lat.toFixed(6)),
      longitude: Number(newPosition.lng.toFixed(6)),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Search address or place name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Button
          type="default"
          icon={<SearchOutlined />}
          loading={searching}
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {results.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="max-h-64 overflow-y-auto">
            {results.map((item, index) => (
              <button
                key={`${item.place_id || item.osm_id || index}`}
                type="button"
                className="block w-full border-b border-slate-100 px-3 py-3 text-left hover:bg-slate-50 last:border-b-0"
                onClick={() => handlePickResult(item)}
              >
                <p className="m-0 text-sm text-slate-700">
                  {item.display_name}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom
          style={{ height: `${height}px`, width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap latitude={safeLatitude} longitude={safeLongitude} />

          <MapClickHandler
            onPick={({ latitude: lat, longitude: lng }) => {
              onChange?.({
                latitude: lat,
                longitude: lng,
              });
            }}
          />

          <Marker
            position={position}
            draggable
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          >
            <Popup>
              Latitude: {safeLatitude}
              <br />
              Longitude: {safeLongitude}
            </Popup>
          </Marker>
        </MapContainer>

        <div className="bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Search an address, click on the map, or drag the marker to set
          latitude and longitude.
        </div>
      </div>
    </div>
  );
}
