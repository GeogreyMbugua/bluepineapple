'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type Review = {
  id: string;
  guestName: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: string;
  experienceId?: string | null;
  user: {
    firstName: string | null;
    lastName: string | null;
  } | null;
};

type ExperienceOption = {
  id: string;
  name: string;
};

type ReviewsResponse = {
  data: {
    reviews: Review[];
    averageRating: number;
    totalCount: number;
  };
};

const avatarSrc = '/assets/crew.webp';

const EXPERIENCES: ExperienceOption[] = [
  { id: '1d171d13-a243-47ea-a0d6-a5959e06ab1e', name: 'Fort Jesus Historical Boat Tour' },
  { id: '676d5470-8674-4182-9ce5-ac607afc083b', name: 'Creek Safaris & Mangrove Exploration' },
  { id: 'b902de07-9702-4491-8fe3-87ab7a067b6b', name: 'Sunset Sailing' },
  { id: '8130b48a-365e-46cf-a9e7-e70f4c98b215', name: 'Snorkelling Reef Experience' },
  { id: '8167618b-3ae8-4b13-8873-3cc59d3eb692', name: 'Birthdays & Anniversaries' },
];

export function ReviewsSection({ experienceId }: { experienceId?: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<ExperienceOption[]>([]);

  const [form, setForm] = useState({
    guestName: '',
    guestEmail: '',
    experienceId: '',
    rating: 5,
    comment: '',
  });

  const loadReviews = useCallback(async () => {
    try {
      const url = new URL('/api/reviews', window.location.origin);
      if (experienceId) url.searchParams.set('experienceId', experienceId);
      url.searchParams.set('limit', '20');

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch reviews');

      const json: ReviewsResponse = await res.json();
      setReviews(json.data.reviews);
      setAverageRating(json.data.averageRating);
      setTotalCount(json.data.totalCount);
    } catch {
      setReviews([]);
      setAverageRating(0);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [experienceId]);

  useEffect(() => {
    setExperiences(EXPERIENCES);
    if (!experienceId && EXPERIENCES.length > 0) {
      const defaultExperienceId = EXPERIENCES[0].id;
      setForm((f) => ({ ...f, experienceId: defaultExperienceId }));
    }
  }, [experienceId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          experienceId: form.experienceId || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to submit review');
      }

      setSuccess('Thank you! Your review has been submitted.');
      setForm((f) => ({ ...f, comment: '', rating: 5 }));
      setShowForm(false);
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          onClick={() => interactive && setForm((f) => ({ ...f, rating: star }))}
        >
          <Star
            className={`h-5 w-5 ${star <= rating ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <section className="w-full px-4 py-16 md:px-16 md:py-40 lg:px-24 xl:px-32">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 w-full animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="w-full px-4 py-16 md:px-16 md:py-40 lg:px-24 xl:px-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start gap-2">
          <span className="text-sm text-zinc-900">GUEST REVIEWS</span>
          <h2 className="text-3xl leading-tight font-medium tracking-tight text-zinc-900 md:text-4xl">
            What our guests say
          </h2>
          {totalCount > 0 && (
            <div className="mt-2 flex items-center gap-3">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-zinc-600">
                {averageRating.toFixed(1)} · {totalCount} review{totalCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => {
            const displayName = review.user
              ? `${review.user.firstName ?? ''} ${review.user.lastName ?? ''}`.trim() || review.guestName
              : review.guestName;

            return (
              <motion.div
                key={review.id}
                className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full bg-gray-100">
                    <Image
                      src={avatarSrc}
                      alt={displayName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-800">{displayName}</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(review.createdAt).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {renderStars(review.rating)}

                <p className="text-sm leading-relaxed text-zinc-600">{review.comment}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12">
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-900"
            >
              Write a review
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-stroke bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900">Write a review</h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="cursor-pointer rounded-full p-1 text-zinc-500 transition hover:bg-gray-100"
                >
                  <X className="size-5" />
                </button>
              </div>

              {success && (
                <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
                  {success}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-800">Name</label>
                    <input
                      type="text"
                      required
                      value={form.guestName}
                      onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
                      className="w-full rounded-md border border-stroke px-3 py-2 text-sm outline-none focus:border-cyan-900"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-800">Email</label>
                    <input
                      type="email"
                      value={form.guestEmail}
                      onChange={(e) => setForm((f) => ({ ...f, guestEmail: e.target.value }))}
                      className="w-full rounded-md border border-stroke px-3 py-2 text-sm outline-none focus:border-cyan-900"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-800">Experience</label>
                  <select
                    required
                    value={form.experienceId}
                    onChange={(e) => setForm((f) => ({ ...f, experienceId: e.target.value }))}
                    className="w-full rounded-md border border-stroke px-3 py-2 text-sm outline-none focus:border-cyan-900"
                  >
                    <option value="">Select an experience</option>
                    {experiences.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-800">Rating</label>
                  {renderStars(form.rating, true)}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-800">Review</label>
                  <textarea
                    required
                    value={form.comment}
                    onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                    className="w-full rounded-md border border-stroke px-3 py-2 text-sm outline-none focus:border-cyan-900"
                    placeholder="Tell us about your experience..."
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="mt-1 text-xs text-zinc-500">{form.comment.length}/1000</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex cursor-pointer items-center justify-center rounded-full bg-cyan-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-900 disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="inline-flex cursor-pointer items-center justify-center rounded-full border border-stroke px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}