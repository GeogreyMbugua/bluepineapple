'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImageUpload } from '@/components/admin/ui/image-upload';
import type { VesselData } from '@blue-pineapple/iam';

const VESSEL_TYPES = ['FERRY', 'SPEEDBOAT', 'DHOW', 'CATAMARAN', 'CATAMARAN_LUXURY'] as const;

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminVesselDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vessel, setVessel] = useState<VesselData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/fleet/${params.id}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        setVessel(json.data);
        setHeroImage(json.data.heroImage || '');
        setImages(json.data.images || []);
        setFeatures(json.data.features || []);
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

    try {
      const body = {
        ...vessel,
        heroImage: heroImage || null,
        images: images.length > 0 ? images : null,
        features: features.length > 0 ? features : null,
      };

      const res = await fetch(`/api/admin/fleet/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to update vessel');
      }

      router.push('/admin/fleet');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (action: string) => {
    await fetch(`/api/admin/fleet/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const res = await fetch(`/api/admin/fleet/${params.id}`, { cache: 'no-store' });
    const json = await res.json();
    setVessel(json.data);
  };

  if (isLoading) {
    return <div className="text-dark-6">Loading vessel...</div>;
  }

  if (!vessel) {
    return <div className="text-dark-6">Vessel not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-primary-deep">
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-dark">{vessel.name}</h1>
          </div>
          <p className="text-dark-6 mt-1">{vessel.registration}</p>
        </div>
        <div className="flex gap-2">
          {vessel.status === 'ACTIVE' && (
            <button
              onClick={() => handleAction('deactivate')}
              className="px-4 py-2 border border-stroke bg-white text-dark text-sm font-medium hover:bg-muted"
            >
              Deactivate
            </button>
          )}
          {vessel.status === 'INACTIVE' && (
            <button
              onClick={() => handleAction('activate')}
              className="px-4 py-2 bg-green text-white text-sm font-medium hover:bg-green-dark"
            >
              Activate
            </button>
          )}
          {vessel.status !== 'DECOMMISSIONED' && (
            <button
              onClick={() => handleAction('decommission')}
              className="px-4 py-2 border border-red bg-white text-red text-sm font-medium hover:bg-red-light-5"
            >
              Decommission
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
              value={vessel.name}
              onChange={(e) => setVessel({ ...vessel, name: e.target.value.toUpperCase(), slug: toSlug(e.target.value) })}
            />
            <Input
              label="Registration"
              value={vessel.registration || ''}
              onChange={(e) => setVessel({ ...vessel, registration: e.target.value })}
            />
            <Input
              label="Capacity"
              type="number"
              value={vessel.capacity}
              onChange={(e) => setVessel({ ...vessel, capacity: parseInt(e.target.value, 10) || 0 })}
            />
            <div>
              <label className="text-sm font-medium text-dark">Type</label>
              <select
                value={vessel.type || ''}
                onChange={(e) => setVessel({ ...vessel, type: e.target.value })}
                className="mt-1 w-full border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Select type</option>
                {VESSEL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <Input
              label="Operator Name"
              value={vessel.operatorName || ''}
              onChange={(e) => setVessel({ ...vessel, operatorName: e.target.value })}
            />
            <Input
              label="Owner Name"
              value={vessel.ownerName || ''}
              onChange={(e) => setVessel({ ...vessel, ownerName: e.target.value })}
            />
          </div>
        </div>

        <div className="border border-stroke bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-dark">Marketing Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Subtitle"
              value={vessel.subtitle || ''}
              onChange={(e) => setVessel({ ...vessel, subtitle: e.target.value })}
            />
            <Input
              label="Hourly Rate"
              value={vessel.hourlyRate || ''}
              onChange={(e) => setVessel({ ...vessel, hourlyRate: e.target.value })}
            />
            <Input
              label="Daily Rate"
              value={vessel.dailyRate || ''}
              onChange={(e) => setVessel({ ...vessel, dailyRate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dark">Description</label>
            <textarea
              value={vessel.description || ''}
              onChange={(e) => setVessel({ ...vessel, description: e.target.value })}
              rows={4}
              className="mt-1 w-full border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
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
                onUpload={(url) => setImages([...images, url])}
                accept="image/*"
                multiple={true}
              />
            </div>
            {images.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <Image src={img} alt={`Gallery ${i + 1}`} width={80} height={80} className="border border-stroke" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
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
          <h2 className="text-lg font-bold text-dark">Features</h2>
          <div className="flex gap-2">
            <Input
              label="Add Feature"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-deep"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((feature, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-sm text-dark"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className="text-red hover:text-red-dark"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push('/admin/fleet')}
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
