"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  city?: string;
}

interface Comment {
  id: number;
  content: string;
  userId: number;
  restaurantId: number;
  user: User;
  createdAt: string;
  rate?: number;
  title?: string;
}

export function RestaurantComments({ restaurantId }: { restaurantId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const data = await api.fetch(`/comments/restaurant/${restaurantId}`);
        setComments(data);
      } catch (err) {
        setError("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [restaurantId, refresh]);

  useEffect(() => {
    // Try to get user info if logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      api.auth.me().then(setUser).catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.fetch("/comments", {
        method: "POST",
        body: JSON.stringify({
          restaurantId,
          content,
          rate: rating,
        }),
      });
      setContent("");
      setRating(5);
      setRefresh((r) => r + 1);
    } catch (err) {
      alert("Failed to submit comment. Please log in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10">
      {/* Add Comment Form */}
      <div className="mb-8">
        {user ? (
          <form onSubmit={handleSubmit} className="bg-card rounded-lg p-4 shadow-sm border mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">Votre note :</span>
              {[1,2,3,4,5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star className={`h-5 w-5 ${star <= rating ? 'text-green-600 fill-green-600' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Partagez votre expérience..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="mb-2"
              rows={3}
              maxLength={500}
              required
            />
            <Button type="submit" disabled={submitting || !content.trim()}>
              {submitting ? "Envoi..." : "Ajouter un avis"}
            </Button>
          </form>
        ) : (
          <div className="bg-card rounded-lg p-4 shadow-sm border mb-4 text-center text-muted-foreground">
            <span>Connectez-vous pour laisser un avis.</span>
          </div>
        )}
      </div>
      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <span>Chargement des avis...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-muted-foreground text-center">Aucun avis pour ce restaurant.</div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 bg-card rounded-lg p-4 shadow-sm border">
              {/* Left: User info */}
              <div className="flex flex-col items-center min-w-[90px]">
                <Avatar className="w-14 h-14 mb-2">
                  {comment.user?.avatarUrl ? (
                    <AvatarImage src={comment.user.avatarUrl} alt={comment.user.firstName} />
                  ) : (
                    <AvatarFallback>
                      {`${comment.user?.firstName?.[0] || ''}${comment.user?.lastName?.[0] || ''}`.toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="font-semibold text-sm text-foreground">{comment.user?.firstName} {comment.user?.lastName?.[0]}.</div>
                <div className="text-xs text-muted-foreground">{comment.user?.city || ''}</div>
              </div>
              {/* Right: Comment content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {/* Rating */}
                  {comment.rate && (
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${star <= (comment.rate || 0) ? 'text-green-600 fill-green-600' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(comment.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="text-foreground whitespace-pre-line mb-1">{comment.content}</div>
                <div className="text-xs text-muted-foreground mt-2">Cet avis est l'opinion subjective d'un membre de RestoLover et non de l'avis de RestoLover.</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 