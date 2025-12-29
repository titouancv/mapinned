"use client";
import { useState } from "react";
import Map from "@/components/Map";
import { authService } from "@/services/auth.service";
import Login from "@/components/Login";
import Header from "@/components/Header";

export default function Home() {
  const { data: session, isPending } = authService.useSession();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 🟡 Chargement de la session
  if (isPending) {
    return <HomeSkeleton />;
  }

  // 🔴 Non connecté
  if (!session) {
    return <Login />;
  }

  // 🟢 Connecté
  return (
    <main className="flex min-h-screen flex-col relative">
      <div className="absolute top-4 left-4 z-10">
        <Header
          onPhotosUploaded={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </div>
      <Map refreshTrigger={refreshTrigger} />
    </main>
  );
}

function HomeSkeleton() {
  return (
    <main className="flex min-h-screen flex-col relative animate-pulse bg-gray-100">
      {/* Header skeleton */}
      <div className="absolute top-4 left-4 z-10">
        <div className="h-10 w-44 rounded-md bg-gray-300" />
      </div>

      {/* Map skeleton */}
      <div className="flex-1 m-4 rounded-xl bg-gray-300" />
    </main>
  );
}
