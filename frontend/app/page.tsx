'use client';
import Map from "@/components/Map";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { data: session } = authClient.useSession();

  const signIn = async () => {
      await authClient.signIn.social({
          provider: "google"
      })
  }

  const signOut = async () => {
      await authClient.signOut()
  }

  return (
    <main className="flex min-h-screen flex-col relative">
      <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded shadow">
          {session ? (
              <div className="flex gap-2 items-center">
                  <p>Hello {session.user.name}</p>
                  <button onClick={signOut} className="bg-red-500 text-white px-2 py-1 rounded">Sign Out</button>
              </div>
          ) : (
              <button onClick={signIn} className="bg-blue-500 text-white px-2 py-1 rounded">Sign In with Google</button>
          )}
      </div>
      <Map />
    </main>
  );
}
