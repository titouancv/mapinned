"use client";
import { useRef, useState } from "react";
import exifr from "exifr";
import Map from "@/components/Map";
import { authClient } from "@/lib/auth-client";
import { Import, LogOut } from "lucide-react";

export default function Home() {
  const { data: session } = authClient.useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const signIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "http://localhost:3000",
    });
  };

  const signOut = async () => {
    await authClient.signOut();
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

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            latitude,
            longitude,
          }),
          credentials: "include",
        });
      } catch (error) {
        console.error(`Import failed for ${file.name}:`, error);
      }
    }

    setIsUploading(false);
    setUploadStatus("");
    window.location.reload();
  };

  const importPhotos = () => {
    fileInputRef.current?.click();
  };

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-lg">
          {/* Header */}
          <div className="p-6 text-center">
            <h1 className="text-3xl font-bold text-blue-800">mapinned</h1>
            <p className="mt-2 text-sm text-gray-600">
              Mapinned is a web application that allows users to upload photos,
              automatically extract their GPS location, and display them on an
              interactive map. Users can view photos, add descriptions (manually
              or AI-generated), and comment on them.
            </p>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <button
              onClick={signIn}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.6 20.4H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.6z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.6 16.2 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.4 35.1 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.4 39.7 16.2 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.4H42V20H24v8h11.3c-1.2 3.1-3.4 5.5-6 7.1l.1-.1 6.3 5.3C35.3 40.1 44 34 44 24c0-1.3-.1-2.7-.4-3.6z"
                />
              </svg>
              Continuer avec Google
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
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
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />

      <Map />
    </main>
  );
}
