'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImageUpload } from '@/components/admin/ui/image-upload';

const CATEGORIES = ['TRANSPORT', 'LEISURE', 'ADVENTURE', 'PRIVATE', 'CORPORATE'] as const;

interface FormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  durationMinutes: string;
  defaultPrice: string;
  currency: string;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  heroImageUrl: string;
  maxGroupSize: string;
  minGroupSize: string;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CreateExperiencePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [includes, setIncludes] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState('');
  const [includeInput, setIncludeInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');

  const [form, setForm] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    durationMinutes: '',
    defaultPrice: '',
    currency: 'KES',
    category: 'LEISURE',
    isFeatured: false,
    isActive: true,
    heroImageUrl: '',
    maxGroupSize: '',
    minGroupSize: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const body = {
        ...form,
        slug: toSlug(form.name) || toSlug(form.slug),
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes, 10) : null,
        defaultPrice: form.defaultPrice ? parseFloat(form.defaultPrice) : null,
        maxGroupSize: form.maxGroupSize ? parseInt(form.maxGroupSize, 10) : null,
        minGroupSize: form.minGroupSize ? parseInt(form.minGroupSize, 10) : null,
        heroImageUrl: heroImage || null,
        galleryUrls: galleryImages,
        highlights,
        includes,
        requirements,
      };

      const res = await fetch('/api/admin/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to create experience');
      }

      router.push('/admin/experiences');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setHighlights([...highlights, highlightInput.trim()]);
      setHighlightInput('');
    }
  };

  const addInclude = () => {
    if (includeInput.trim()) {
      setIncludes([...includes, includeInput.trim()]);
      setIncludeInput('');
    }
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Add Experience</h1>
        <p className="text-dark-6 mt-1">Create a new coastal experience</p>
      </div>

      {error && (
        <div className="border border-red bg-red-light-5 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-stroke bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-dark">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <div>
              <label className="text-sm font-medium text-dark">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <Input
              label="Duration (minutes)"
              type="number"
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Price"
                type="number"
                value={form.defaultPrice}
                onChange={(e) => setForm({ ...form, defaultPrice: e.target.value })}
              />
              <Input
                label="Currency"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
              />
            </div>
            <Input
              label="Min Group Size"
              type="number"
              value={form.minGroupSize}
              onChange={(e) => setForm({ ...form, minGroupSize: e.target.value })}
            />
            <Input
              label="Max Group Size"
              type="number"
              value={form.maxGroupSize}
              onChange={(e) => setForm({ ...form, maxGroupSize: e.target.value })}
            />
          </div>
        </div>

        <div className="border border-stroke bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-dark">Descriptions</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-dark">Short Description</label>
              <textarea
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                rows={2}
                className="mt-1 w-full border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-dark">Full Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="mt-1 w-full border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="border border-stroke bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-dark">Images</h2>
          <div>
            <label className="text-sm font-medium text-dark">Hero Image</label>
            <div className="mt-2">
              <ImageUpload
                onUpload={(url) => setHeroImage(url)}
                accept="image/*"
                multiple={false}
              />
            </div>
            {heroImage && (
              <div className="mt-2">
                <Image src={heroImage} alt="Hero preview" width={200} height={128} className="border border-stroke" />
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-dark">Gallery Images</label>
            <div className="mt-2">
              <ImageUpload
                onUpload={(url) => setGalleryImages([...galleryImages, url])}
                accept="image/*"
                multiple={true}
              />
            </div>
            {galleryImages.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {galleryImages.map((img, i) => (
                  <div key={i} className="relative">
                    <Image src={img} alt={`Gallery ${i + 1}`} width={80} height={80} className="border border-stroke" />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 bg-red text-white rounded-full size-5 text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border border-stroke bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-dark">Highlights</h2>
          <div className="flex gap-2">
            <Input
              label="Add Highlight"
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
            />
            <button
              type="button"
              onClick={addHighlight}
              className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-deep"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {highlights.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-sm text-dark">
                {item}
                <button type="button" onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))} className="text-red hover:text-red-dark">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="border border-stroke bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-dark">Includes</h2>
          <div className="flex gap-2">
            <Input
              label="Add Inclusion"
              value={includeInput}
              onChange={(e) => setIncludeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
            />
            <button
              type="button"
              onClick={addInclude}
              className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-deep"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {includes.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-sm text-dark">
                {item}
                <button type="button" onClick={() => setIncludes(includes.filter((_, idx) => idx !== i))} className="text-red hover:text-red-dark">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="border border-stroke bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-dark">Requirements</h2>
          <div className="flex gap-2">
            <Input
              label="Add Requirement"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            />
            <button
              type="button"
              onClick={addRequirement}
              className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-deep"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {requirements.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-sm text-dark">
                {item}
                <button type="button" onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} className="text-red hover:text-red-dark">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push('/admin/experiences')}
            className="px-4 py-2 border border-stroke bg-white text-dark text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-deep disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Experience'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-dark">
        {label}
        {required && <span className="text-red ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 w-full border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        {...props}
      />
    </div>
  );
}
