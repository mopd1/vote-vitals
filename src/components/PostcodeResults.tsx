'use client';

import { PostcodeLookupResponse } from '@/lib/types/member';

interface PostcodeResultsProps {
  results: PostcodeLookupResponse;
  onClose: () => void;
}

export function PostcodeResults({ results, onClose }: PostcodeResultsProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Your Constituency</h2>
          <p className="text-gray-600">{results.constituency.name}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Local MP */}
      {results.mp && (
        <div className="mb-6 border-b pb-6">
          <h3 className="font-semibold mb-4">Your MP</h3>
          <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg">
            {results.mp.thumbnailUrl ? (
              <img 
                src={results.mp.thumbnailUrl} 
                alt={results.mp.nameDisplayAs}
                className="w-20 h-20 object-cover rounded"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            <div>
              <h4 className="font-semibold">{results.mp.nameDisplayAs}</h4>
              <p className="text-gray-600">{results.mp.latestParty.name}</p>
              <p className="text-sm text-gray-500">
                Member since {formatDate(results.mp.startDate)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Neighboring Constituencies */}
      {results.neighbors.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Neighboring Constituencies</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {results.neighbors.map((neighbor) => (
              <div key={neighbor.constituency.id} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{neighbor.constituency.name}</h4>
                {neighbor.mp ? (
                  <div className="flex items-center gap-3">
                    {neighbor.mp.thumbnailUrl ? (
                      <img 
                        src={neighbor.mp.thumbnailUrl} 
                        alt={neighbor.mp.nameDisplayAs}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{neighbor.mp.nameDisplayAs}</p>
                      <p className="text-sm text-gray-600">{neighbor.mp.latestParty.name}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No current MP</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}