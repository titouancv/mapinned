"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import PhotoModal from "./PhotoModal";

export type Photo = {
  id: string;
  url: string;
  description: string | null;
  latitude: number;
  longitude: number;
  userId: string;
  user: {
    name: string;
    image: string | null;
  };
};

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [lng] = useState(0);
  const [lat] = useState(0);
  const [zoom] = useState(2);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        name: "Monochrome",
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "osm-raster",
            type: "raster",
            source: "osm",
            paint: {
              "raster-saturation": -1, // rend tout en monochrome
              "raster-brightness-min": 0.2,
            },
          },
        ],
      },
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
  }, [lng, lat, zoom]);

  useEffect(() => {
    fetch("http://localhost:3001/photos")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPhotos(data);
        } else {
          console.error("Expected array of photos, got:", data);
          setPhotos([]);
        }
      })
      .catch((err) => console.error("Failed to fetch photos:", err));
  }, []);

  useEffect(() => {
    if (!map.current) return;
    if (!Array.isArray(photos)) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();

    photos.forEach((photo) => {
      bounds.extend([photo.longitude, photo.latitude]);

      const el = document.createElement("div");
      el.className = "relative group cursor-pointer";

      const img = document.createElement("div");
      img.className =
        "w-10 h-8 rounded-sm border-4 border-white shadow-lg bg-cover bg-center";
      img.style.backgroundImage = `url(${photo.url})`;

      const pointer = document.createElement("div");
      pointer.className =
        "absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white";

      el.appendChild(img);
      el.appendChild(pointer);

      el.addEventListener("click", () => {
        setSelectedPhoto(photo);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([photo.longitude, photo.latitude])
        .addTo(map.current!);
      markersRef.current.push(marker);
    });

    if (photos.length > 0) {
      map.current.fitBounds(bounds, { padding: 100, maxZoom: 12 });
    }
  }, [photos]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />

      {selectedPhoto && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          />
          <PhotoModal
            selectedPhoto={selectedPhoto}
            onPhotoUpdated={(updatedPhoto) => {
              setPhotos((prev) =>
                prev.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p))
              );
            }}
            setSelectedPhoto={setSelectedPhoto}
          />
        </>
      )}
    </div>
  );
}
