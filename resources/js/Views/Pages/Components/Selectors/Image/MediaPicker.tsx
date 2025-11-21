import React, { useEffect, useState } from 'react';
import { showAppToast } from '@/utils/toast';
import PrimaryButton from '@/Components/PrimaryButton';

export default function MediaPicker({ onSelect }: { onSelect: (m: any) => void }) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/media', { credentials: 'same-origin' });
      if (!resp.ok) throw new Error('Failed to fetch');
      const json = await resp.json();
      setImages(json.images || []);
    } catch (e) {
      showAppToast('Could not load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Choose Image</h3>
        <a href="/dashboard/media" className="text-sm text-indigo-600 hover:underline">Open full media manager</a>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : images.length === 0 ? (
        <div className="text-gray-500">No images</div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {images.map((m) => (
            <button key={m.id} className="block" onClick={() => onSelect(m)}>
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 overflow-hidden rounded">
                <img src={m.public_url ?? m.url} alt={m.file_name} className="w-full h-full object-cover" />
              </div>
              <div className="mt-1 text-xs truncate">{m.file_name}</div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4">
        <PrimaryButton onClick={fetchMedia}>Refresh</PrimaryButton>
      </div>
    </div>
  );
}
