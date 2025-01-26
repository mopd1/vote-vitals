import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/api';

export async function GET() {
  try {
    const leaderboardData = await getLeaderboard();
    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}
