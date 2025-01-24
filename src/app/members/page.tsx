'use client';

import { useEffect, useState, useCallback } from 'react';
import { Member } from '@/lib/types/member';
import { getMembers } from '@/lib/api';
import debounce from 'lodash/debounce';

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedHouse, setSelectedHouse] = useState('Commons');
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search function to prevent too many API calls
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      try {
        setLoading(true);
        const data = await getMembers({
          page: 1,
          house: selectedHouse,
          party: selectedParty,
          searchTerm: term
        });
        setMembers(data.items);
        setTotalPages(Math.ceil((data.totalResults || 0) / 20));
        setPage(1);
      } catch (err) {
        console.error('Error searching members:', err);
        setError('Unable to search members. Please try again later.');
      } finally {
        setLoading(false);
      }
    }, 300),
    [selectedHouse, selectedParty]
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      fetchMembers();
    }
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, page, selectedHouse, selectedParty]);

  async function fetchMembers() {
    try {
      setLoading(true);
      const data = await getMembers({
        page,
        house: selectedHouse,
        party: selectedParty
      });
      setMembers(data.items);
      setTotalPages(Math.ceil((data.totalResults || 0) / 20));
    } catch (err) {
      console.error('Error loading members:', err);
      setError('Unable to load members. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  // Generate array of page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

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
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Members of Parliament</h1>
      
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Input */}
        <div className="max-w-2xl">
          <input
            type="text"
            placeholder="Search members by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* House Filter */}
        <div className="flex gap-4">
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
          {/* Results count */}
          {searchTerm && (
            <p className="text-gray-600 mb-4">
              Found {members.length} members matching "{searchTerm}"
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {members.map((member) => (
              <div key={member.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {member.thumbnailUrl ? (
                    <img 
                      src={member.thumbnailUrl} 
                      alt={member.nameDisplayAs}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold">{member.nameDisplayAs}</h2>
                    <p className="text-gray-600">{member.latestParty?.name}</p>
                    <p className="text-sm text-gray-500">{member.membershipFrom}</p>
                    <p className="text-sm text-gray-500">
                      Member since {formatDate(member.startDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Only show pagination if not searching */}
          {!searchTerm && members.length > 0 && (
            <div className="flex justify-center items-center gap-2 mb-8 overflow-x-auto py-4">
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {pageNumbers.slice(Math.max(0, page - 5), Math.min(pageNumbers.length, page + 5)).map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`px-3 py-1 border rounded ${
                    page === num ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  {num}
                </button>
              ))}
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>
          )}

          {/* No results message */}
          {members.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No members found {searchTerm ? `matching "${searchTerm}"` : ''}.
            </div>
          )}
        </>
      )}
    </div>
  );
}