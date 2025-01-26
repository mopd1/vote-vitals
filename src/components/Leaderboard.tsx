'use client';

import { useEffect, useState } from 'react';
import { Member } from '../lib/types/member';

interface LeaderboardMember extends Member {
  totalValue: number;
}

export default function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<LeaderboardMember[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const data = await response.json();
        setMembers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Top 10 MPs by Declared Interests</h2>
      <div className="space-y-4">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-xl font-bold text-gray-500">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{member.nameDisplayAs}</h3>
                  <p className="text-gray-600">
                    {member.latestParty.name} • {member.membershipFrom}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  £{member.totalValue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Declared Value</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
