import Leaderboard from '@/components/Leaderboard';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Vote Vitals</h1>
        <p className="text-xl text-gray-600">Transparent access to UK parliamentary data</p>
      </div>
      
      <Leaderboard />
    </main>
  );
}
