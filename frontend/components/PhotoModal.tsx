/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Pencil, Check, Sparkles } from "lucide-react";
import { Photo } from "./Map";
import { authClient } from "@/lib/auth-client";
import { analyzeImageWithGemma } from "@/lib/gemma";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    image: string | null;
  };
};

export default function PhotoModal({
  selectedPhoto,
  setSelectedPhoto,
  onPhotoUpdated,
}: {
  selectedPhoto: Photo;
  setSelectedPhoto: React.Dispatch<React.SetStateAction<Photo | null>>;
  onPhotoUpdated?: (photo: Photo) => void;
}) {
  const { data: session } = authClient.useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState(
    selectedPhoto.description || ""
  );

  useEffect(() => {
    setDescription(selectedPhoto.description || "");
    setIsEditing(false);
  }, [selectedPhoto]);

  useEffect(() => {
    const fetchPhotoDetails = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/photos/${selectedPhoto.id}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.comments) {
            setComments(data.comments);
          }
        }
      } catch (error) {
        console.error("Failed to fetch comments", error);
      }
    };

    fetchPhotoDetails();
  }, [selectedPhoto.id]);

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    setDescription("");
    try {
      await analyzeImageWithGemma(selectedPhoto.url, (chunk) => {
        setDescription((prev) => prev + chunk);
      });
    } catch (error) {
      console.error("Failed to generate description", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateDescription = async () => {
    if (!session) return;

    try {
      const res = await fetch(
        `http://localhost:3001/photos/${selectedPhoto.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description }),
          credentials: "include",
        }
      );

      if (res.ok) {
        const updatedPhoto = await res.json();
        const newPhoto = {
          ...selectedPhoto,
          description: updatedPhoto.description,
        };
        setSelectedPhoto(newPhoto);
        onPhotoUpdated?.(newPhoto);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update description", error);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoId: selectedPhoto.id,
          content: newComment,
        }),
        credentials: "include",
      });

      if (res.ok) {
        const comment = await res.json();
        const newCommentObj: Comment = {
          ...comment,
          user: {
            name: session.user.name,
            image: session.user.image,
          },
        };

        setComments([newCommentObj, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="relative max-h-full md:max-w-[80%] overflow-hidden bg-white rounded-lg shadow-2xl flex flex-col md:flex-row pointer-events-auto">
        <button
          onClick={() => setSelectedPhoto(null)}
          className="block md:hidden absolute top-2 right-2 z-10 text-gray-300 drop-shadow-md text-4xl font-bold"
        >
          <X />
        </button>

        <div className="md:flex-1 w-full bg-black flex items-center justify-center">
          <img
            src={selectedPhoto.url}
            alt={selectedPhoto.description || "Photo"}
            className="max-h-[80vh] w-full object-contain"
          />
        </div>

        <div className="md:w-[400px] w-full flex flex-col h-[80vh] md:h-auto">
          <div className="flex justify-end w-full p-2">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="hidden md:block text-gray-400 drop-shadow-md text-4xl font-bold hover:text-gray-300"
            >
              <X />
            </button>
          </div>
          <div className="p-2 border-b border-gray-100 relative group">
            {isEditing ? (
              <div className="flex gap-2 items-start">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full p-2 border rounded text-sm focus:outline-none ${
                    isGenerating
                      ? " animate-pulse text-violet-700"
                      : " text-gray-700"
                  }`}
                  rows={3}
                  placeholder={
                    isGenerating
                      ? " Generation in progress..."
                      : " Add a description..."
                  }
                />
                <div className="flex flex-col gap-1">
                  <button
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className={`p-1 text-violet-500 hover:bg-violet-50 rounded ${
                      isGenerating ? "animate-pulse" : ""
                    }`}
                  >
                    <Sparkles size={18} />
                  </button>
                  <button
                    onClick={handleUpdateDescription}
                    className="p-1 text-green-500 hover:bg-green-50 rounded"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setDescription(selectedPhoto.description || "");
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex w-full justify-between items-start">
                <div className="flex gap-2 items-start">
                  {selectedPhoto.description ? (
                    <p className="text-gray-700">{selectedPhoto.description}</p>
                  ) : (
                    <p className="text-gray-400 italic">
                      No description available.
                    </p>
                  )}
                </div>
                {session?.user?.id === selectedPhoto.userId && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-gray-600 hover:text-gray-300"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-400 text-center text-sm">
                No comments yet.
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  {comment.user?.image ? (
                    <img
                      src={comment.user.image}
                      alt={comment.user.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0">
                      {comment.user?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-black">
                      {comment.user?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handlePostComment} className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(
                    e.target.scrollHeight,
                    72
                  )}px`;
                }}
                placeholder="Add a comment..."
                rows={1}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-blue-800 text-black resize-none overflow-hidden"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!newComment.trim() || isLoading}
                className="p-2 text-blue-800 hover:text-blue-500 disabled:text-gray-300"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
