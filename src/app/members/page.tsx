'use client';

import { useEffect, useState } from 'react';
import { Member } from '@/lib/types/member';
import { getMembers } from '@/lib/api';

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedHouse, setSelectedHouse] = useState('Commons');
  const [selectedParty, setSelectedParty] = useState<string>('');

  useEffect(() => {
    async function fetchMembers() {
      try {
        setLoading(true);
        setError(null);
        const data = await getMembers(page, selectedHouse, selectedParty);
        setMembers(data.items);
        setTotalPages(Math.ceil(data.totalResults / 20));
      } catch (err) {
        console.error('Error loading members:', err);
        setError('Unable to load members. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [page, selectedHouse, selectedParty]);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Members of Parliament</h1>
      
      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select 
          value={selectedHouse}
          onChange={(e) => {
            setPage(1);
            setSelectedHouse(e.target.value);
          }}
          className="border rounded p-2"
        >
          <option value="Commons">House of Commons</option>
          <option value="Lords">House of Lords</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-pulse text-lg">Loading members...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div key={member.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {member.thumbnailUrl && (
                    <img 
                      src={member.thumbnailUrl} 
                      alt={member.nameDisplayAs}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <h2 className="font-semibold">{member.nameDisplayAs}</h2>
                    <p className="text-gray-600">{member.latestParty.name}</p>
                    <p className="text-sm text-gray-500">{member.membershipFrom}</p>
                    <p className="text-sm text-gray-500">
                      Member since {new Date(member.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 border rounded transition-colors ${
                    page === i + 1 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}