"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json", // Basic style
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
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
           <img src="${photo.url}" alt="${
          photo.description || "Photo"
        }" class="w-32 h-32 object-cover rounded mb-2" />
           <p class="text-sm font-bold">${photo.user.name}</p>
           ${
             photo.description
               ? `<p class="text-xs">${photo.description}</p>`
               : ""
           }
         </div>`
      );

      new maplibregl.Marker()
        .setLngLat([photo.longitude, photo.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [photos]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
}
