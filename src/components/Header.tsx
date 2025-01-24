import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex space-x-8">
              <Link 
                href="/"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
              >
                Home
              </Link>
              <Link 
                href="/members"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
              >
                Members
              </Link>
              <Link 
                href="/bills"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
              >
                Bills
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}