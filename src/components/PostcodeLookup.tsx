'use client';

import { useState } from 'react';
import { PostcodeLookupResponse } from '@/lib/types/member';
import { getMembersByPostcode } from '@/lib/api';

interface PostcodeLookupProps {
  onLoading: (loading: boolean) => void;
  onResult: (result: PostcodeLookupResponse) => void;
  onError: (error: string) => void;
}

export function PostcodeLookup({ onLoading, onResult, onError }: PostcodeLookupProps) {
  const [postcode, setPostcode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode.trim()) return;

    onLoading(true);
    try {
      const result = await getMembersByPostcode(postcode);
      onResult(result);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to lookup postcode');
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <div className="flex gap-2">
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="Enter your postcode..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          pattern="^[A-Za-z0-9 ]+$"
          maxLength={8}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={!postcode.trim()}
        >
          Find MPs
        </button>
      </div>
    </form>
  );
}