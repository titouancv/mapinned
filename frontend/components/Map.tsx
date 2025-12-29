"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { X } from "lucide-react";

type Photo = {
  id: string;
  url: string;
  description: string | null;
  latitude: number;
  longitude: number;
  user: {
    name: string;
    image: string | null;
  };
};

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
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

    photos.forEach((photo) => {
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

      new maplibregl.Marker({ element: el })
        .setLngLat([photo.longitude, photo.latitude])
        .addTo(map.current!);
    });
  }, [photos]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-full overflow-auto bg-white rounded-lg shadow-2xl flex flex-col md:flex-row">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 text-gray-400 text-4xl font-bold hover:text-gray-300"
            >
              <X />
            </button>
            <div className=" md:w-2/3 bg-black flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.description || "Photo"}
                className="max-h-[80vh] w-auto object-contain"
              />
            </div>
            <div className="md:w-1/3 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                {selectedPhoto.user.image ? (
                  <img
                    src={selectedPhoto.user.image}
                    alt={selectedPhoto.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                    {selectedPhoto.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-bold text-lg text-black">
                  {selectedPhoto.user.name}
                </span>
              </div>
              {selectedPhoto.description && (
                <p className="text-gray-700 mb-6">
                  {selectedPhoto.description}
                </p>
              )}
              {/* Placeholder for comments section */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                <p className="text-gray-500 text-sm">Comments coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
