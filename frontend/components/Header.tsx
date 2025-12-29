"use client";
import { useRef, useState } from "react";
import exifr from "exifr";
import { authService } from "@/services/auth.service";
import { photosService } from "@/services/photos.service";
import { Import, LogOut } from "lucide-react";

export default function Header({
  onPhotosUploaded,
}: {
  onPhotosUploaded?: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const signOut = async () => {
    await authService.signOut();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadStatus("Starting import...");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadStatus(`Importing ${file.name} ${i + 1}/${files.length}`);

      try {
        const gps = await exifr.gps(file);
        if (!gps || !gps.latitude || !gps.longitude) {
          console.warn(`Skipping ${file.name}: No GPS data`);
          continue;
        }

        const latitude = gps.latitude;
        const longitude = gps.longitude;

        const formData = new FormData();
        formData.append("image", file);

        const uploadRes = await fetch(
          `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) throw new Error("Upload failed");
        const result = await uploadRes.json();
        const url = result.data.url;

        await photosService.create({
          url,
          latitude,
          longitude,
        });
      } catch (error) {
        console.error(`Import failed for ${file.name}:`, error);
      }
    }

    setIsUploading(false);
    setUploadStatus("");
    onPhotosUploaded?.();
  };

  const importPhotos = () => {
    fileInputRef.current?.click();
  };
  return (
    <div className=" flex gap-2">
      <div className="bg-white hover:bg-red-50 rounded shadow">
        <div
          className="flex p-2 gap-2 items-center text-red-800 cursor-pointer"
          onClick={signOut}
        >
          <p className="hidden md:block">Log out</p>
          <LogOut />
        </div>
      </div>
      <div className="bg-white hover:bg-blue-50 rounded shadow">
        <div
          className="flex p-2 gap-2 items-center text-blue-800 cursor-pointer"
          onClick={importPhotos}
        >
          <p className="hidden md:block">Import photos</p>
          <p className="block md:hidden">Import</p>
          <Import />
        </div>
      </div>
      {isUploading && (
        <div className="bg-white p-2 rounded shadow flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <p className="text-sm font-medium text-black">{uploadStatus}</p>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
}
