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
        const data = await getMembers(page, selectedHouse, selectedParty);
        setMembers(data.items);
        setTotalPages(Math.ceil(data.totalResults / 20));
      } catch (err) {
        setError('Failed to load members');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [page, selectedHouse, selectedParty]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Members of Parliament</h1>
      
      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select 
          value={selectedHouse}
          onChange={(e) => setSelectedHouse(e.target.value)}
          className="border rounded p-2"
        >
          <option value="Commons">House of Commons</option>
          <option value="Lords">House of Lords</option>
        </select>

        {/* Party filter will be added here */}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div key={member.id} className="border rounded-lg p-4 shadow">
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
                    <p className="text-sm">{member.membershipFrom}</p>
                    <p className="text-sm">Member since {new Date(member.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  page === i + 1 ? 'bg-blue-500 text-white' : ''
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}