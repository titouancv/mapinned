import { Photo } from "@/components/Map";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const photosService = {
  getAll: async (): Promise<Photo[]> => {
    const res = await fetch(`${API_URL}/photos`);
    if (!res.ok) throw new Error("Failed to fetch photos");
    return res.json();
  },

  getOne: async (id: string) => {
    const res = await fetch(`${API_URL}/photos/${id}`);
    if (!res.ok) throw new Error("Failed to fetch photo details");
    return res.json();
  },

  create: async (data: {
    url: string;
    latitude: number;
    longitude: number;
  }) => {
    const res = await fetch(`${API_URL}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to create photo");
    return res.json();
  },

  updateDescription: async (id: string, description: string) => {
    const res = await fetch(`${API_URL}/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to update description");
    return res.json();
  },

  addComment: async (photoId: string, content: string) => {
    const res = await fetch(`${API_URL}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, content }),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to add comment");
    return res.json();
  },
};
