"use client";
import { useRef } from "react";
import exifr from "exifr";
import Map from "@/components/Map";
import { authClient } from "@/lib/auth-client";
import { Import, LogOut } from "lucide-react";

export default function Home() {
  const { data: session } = authClient.useSession();

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
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const gps = await exifr.gps(file);
      const latitude = gps?.latitude || 0;
      const longitude = gps?.longitude || 0;

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

      await fetch("http://localhost:3001/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          latitude,
          longitude,
          description: "Imported photo",
        }),
        credentials: "include",
      });

      window.location.reload();
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import photo");
    }
  };

  const importPhotos = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="flex min-h-screen flex-col relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="bg-white rounded shadow">
          {session ? (
            <div
              className="flex p-2 gap-2 items-center text-black hover:text-red-500"
              onClick={signOut}
            >
              <p>{session.user.name}</p>
              <LogOut />
            </div>
          ) : (
            <div className="p-2" onClick={signIn}>
              <button className="text-blue-500 px-2 py-1 rounded">
                Sign In with Google
              </button>
            </div>
          )}
        </div>
        {session && (
          <div className="bg-white rounded shadow">
            <div
              className="flex p-2 gap-2 items-center text-black hover:text-blue-500"
              onClick={importPhotos}
            >
              <p>Import photos</p>
              <Import />
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <Map />
    </main>
  );
}
