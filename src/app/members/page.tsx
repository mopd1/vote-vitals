'use client';

import { useEffect, useState, useCallback } from 'react';
import { Member, PostcodeLookupResponse } from '@/lib/types/member';
import { getMembers, getMembersByPostcode } from '@/lib/api';
import debounce from 'lodash/debounce';

type SearchType = 'name' | 'postcode';

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedHouse, setSelectedHouse] = useState('Commons');
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('name');
  const [postcodeResult, setPostcodeResult] = useState<PostcodeLookupResponse | null>(null);

  // Debounced search function for name search
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

  // Function to handle postcode search
  const handlePostcodeSearch = async (postcode: string) => {
    if (!postcode.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const result = await getMembersByPostcode(postcode);
      setPostcodeResult(result);
      setMembers([]); // Clear regular member list
    } catch (err) {
      console.error('Error searching by postcode:', err);
      setError(err instanceof Error ? err.message : 'Unable to find constituency for this postcode.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchType === 'name') {
      if (searchTerm) {
        debouncedSearch(searchTerm);
      } else {
        fetchMembers();
      }
    }
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, page, selectedHouse, selectedParty, searchType]);

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

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type);
    setSearchTerm('');
    setError(null);
    setPostcodeResult(null);
    if (type === 'name') {
      fetchMembers();
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Members of Parliament</h1>
      
      {/* Search Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleSearchTypeChange('name')}
              className={`${
                searchType === 'name'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
            >
              Search by Name
            </button>
            <button
              onClick={() => handleSearchTypeChange('postcode')}
              className={`${
                searchType === 'postcode'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium`}
            >
              Search by Postcode
            </button>
          </nav>
        </div>
      </div>

      {/* Search Inputs */}
      <div className="mb-6 space-y-4">
        {searchType === 'name' ? (
          <>
            <div className="max-w-2xl">
              <input
                type="text"
                placeholder="Search members by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
          </>
        ) : (
          <div className="max-w-2xl">
            <form onSubmit={(e) => {
              e.preventDefault();
              handlePostcodeSearch(searchTerm);
            }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter postcode (e.g., SW1A 0AA)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Find MP'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-pulse text-lg">Loading members...</div>
        </div>
      ) : (
        <>
          {searchType === 'postcode' && postcodeResult ? (
            <div className="space-y-8">
              {/* Local MP */}
              <div className="border rounded-lg p-6 bg-blue-50">
                <h2 className="text-xl font-semibold mb-4">Your MP - {postcodeResult.constituency.name}</h2>
                {postcodeResult.mp ? (
                  <div className="flex items-center gap-4">
                    {postcodeResult.mp.thumbnailUrl ? (
                      <img 
                        src={postcodeResult.mp.thumbnailUrl} 
                        alt={postcodeResult.mp.nameDisplayAs}
                        className="w-24 h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{postcodeResult.mp.nameDisplayAs}</h3>
                      <p className="text-gray-600">{postcodeResult.mp.latestParty.name}</p>
                      <p className="text-sm text-gray-500">
                        Member since {formatDate(postcodeResult.mp.startDate)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No current MP found for this constituency</p>
                )}
              </div>

              {/* Neighboring Constituencies */}
              {postcodeResult.neighbors.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Neighboring Constituencies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {postcodeResult.neighbors.map((neighbor) => (
                      <div key={neighbor.constituency.id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{neighbor.constituency.name}</h3>
                        {neighbor.mp ? (
                          <div className="flex items-center gap-4">
                            {neighbor.mp.thumbnailUrl ? (
                              <img 
                                src={neighbor.mp.thumbnailUrl} 
                                alt={neighbor.mp.nameDisplayAs}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-400">No image</span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{neighbor.mp.nameDisplayAs}</p>
                              <p className="text-sm text-gray-600">{neighbor.mp.latestParty.name}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-600">No current MP</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Regular member list */}
              {searchTerm && searchType === 'name' && (
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

              {/* Pagination - only show if not searching and there are members */}
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
        </>
      )}
    </div>
  );
}