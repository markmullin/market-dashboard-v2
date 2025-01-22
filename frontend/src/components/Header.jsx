import React, { useState } from 'react';
import axios from 'axios';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get('http://localhost:5000/api/market/search', {
        params: { query: searchQuery }
      });
      setSearchResults(response.data?.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glassmorphism container */}
      <div className="backdrop-blur-md bg-white/70 border-b border-white/30 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Investors Daily Brief
              </h1>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 
                           bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-green-500 
                           focus:border-transparent transition-all duration-300
                           placeholder-gray-400"
                  placeholder="Search stocks, sectors, or market data..."
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 rounded-md
                           bg-gradient-to-r from-green-500 to-green-600 text-white
                           hover:from-green-600 hover:to-green-700 transition-all duration-300
                           disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Market Status */}
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-gray-600">Market Open</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Dropdown with Glassmorphism */}
      {searchResults.length > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-2xl mt-2">
          <div className="mx-4 rounded-lg overflow-hidden border border-white/30 shadow-xl
                        backdrop-blur-md bg-white/90">
            {searchResults.map((result) => (
              <div
                key={result.symbol}
                className="px-4 py-3 hover:bg-white/50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{result.symbol}</h3>
                    <p className="text-sm text-gray-600">{result.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${result.price}</p>
                    <p className={`text-sm ${result.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.change >= 0 ? '+' : ''}{result.change}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;