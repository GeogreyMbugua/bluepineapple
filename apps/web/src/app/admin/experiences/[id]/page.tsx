'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImageUpload } from '@/components/admin/ui/image-upload';
import type { ExperienceWithRoutes } from '@blue-pineapple/iam';

const CATEGORIES = ['TRANSPORT', 'LEISURE', 'ADVENTURE', 'PRIVATE', 'CORPORATE'] as const;

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function EditExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<ExperienceWithRoutes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/experiences/${params.id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        const data = json.data as ExperienceWithRoutes;
        setExperience(data);
        setHeroImage(data.heroImageUrl || '');
        setGalleryImages(data.galleryUrls || []);
        setHighlights(data.highlights || []);
        setIncludes(data.includes || []);
        setRequirements(data.requirements || []);
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!experience) return;

    try {
      const body = {
        name: experience.name,
        slug: toSlug(experience.name),
        description: experience.description,
        shortDescription: experience.shortDescription,
        durationMinutes: experience.durationMinutes,
        defaultPrice: experience.defaultPrice,
        currency: experience.currency,
        category: experience.category,
        isFeatured: experience.isFeatured,
        isActive: experience.isActive,
        heroImageUrl: heroImage || null,
        galleryUrls: galleryImages,
        maxGroupSize: experience.maxGroupSize,
        minGroupSize: experience.minGroupSize,
        highlights,
        includes,
        requirements,
      };

      const res = await fetch(`/api/admin/experiences/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to update experience');
      }

      router.push('/admin/experiences');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (action: string) => {
    await fetch(`/api/admin/experiences/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const res = await fetch(`/api/admin/experiences/${params.id}`, { cache: 'no-store' });
    const json = await res.json();
    setExperience(json.data);
  };

  if (isLoading) {
    return <div className="text-dark-6">Loading experience...</div>;
  }

  if (!experience) {
    return <div className="text-dark-6">Experience not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-primary-deep">
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-dark">{experience.name}</h1>
          </div>
          <p className="text-dark-6 mt-1">{experience.slug}</p>
        </div>
        <div className="flex gap-2">
          {experience.isActive && (
            <button
              onClick={() => handleAction('deactivate')}
              className="px-4 py-2 border border-stroke bg-white text-dark text-sm font-medium hover:bg-muted"
            >
              Deactivate
            </button>
          )}
          {!experience.isActive && (
            <button
              onClick={() => handleAction('activate')}
              className="px-4 py-2 bg-green text-white text-sm font-medium hover:bg-green-dark"
            >
              Activate
            </button>
          )}
        </div>
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
              value={experience.name}
              onChange={(e) => setExperience({ ...experience, name: e.target.value, slug: toSlug(e.target.value) })}
              required
            />
            <div>
              <label className="text-sm font-medium text-dark">Category</label>
              <select
                value={experience.category}
                onChange={(e) => setExperience({ ...experience, category: e.target.value })}
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
              value={experience.durationMinutes?.toString() || ''}
              onChange={(e) => setExperience({ ...experience, durationMinutes: e.target.value ? parseInt(e.target.value, 10) : null })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Price"
                type="number"
                value={experience.defaultPrice?.toString() || ''}
                onChange={(e) => setExperience({ ...experience, defaultPrice: e.target.value ? parseFloat(e.target.value) : null })}
              />
              <Input
                label="Currency"
                value={experience.currency}
                onChange={(e) => setExperience({ ...experience, currency: e.target.value.toUpperCase() })}
              />
            </div>
            <Input
              label="Min Group Size"
              type="number"
              value={experience.minGroupSize?.toString() || ''}
              onChange={(e) => setExperience({ ...experience, minGroupSize: e.target.value ? parseInt(e.target.value, 10) : null })}
            />
            <Input
              label="Max Group Size"
              type="number"
              value={experience.maxGroupSize?.toString() || ''}
              onChange={(e) => setExperience({ ...experience, maxGroupSize: e.target.value ? parseInt(e.target.value, 10) : null })}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={experience.isFeatured}
                onChange={(e) => setExperience({ ...experience, isFeatured: e.target.checked })}
                className="size-4 rounded border-stroke"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-dark">Featured</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={experience.isActive}
                onChange={(e) => setExperience({ ...experience, isActive: e.target.checked })}
                className="size-4 rounded border-stroke"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-dark">Active</label>
            </div>
          </div>
        </div>

        <div className="border border-stroke bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-dark">Descriptions</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-dark">Short Description</label>
              <textarea
                value={experience.shortDescription || ''}
                onChange={(e) => setExperience({ ...experience, shortDescription: e.target.value })}
                rows={2}
                className="mt-1 w-full border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-dark">Full Description</label>
              <textarea
                value={experience.description || ''}
                onChange={(e) => setExperience({ ...experience, description: e.target.value })}
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
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
