import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Search, TrendingUp, DollarSign } from 'lucide-react';
import { logoutSuccess } from '../store/slices/authSlice.js';
import api from '../services/api.js';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    dispatch(logoutSuccess());
    navigate('/login');
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get(`/stocks/search?q=${searchQuery}`);
        setSearchResults(response.data);
      } catch (err) {
        console.error('Navbar search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStock = (symbol) => {
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/stock/${symbol}`);
  };

  return (
    <nav className="h-16 border-b border-[#222b3e] bg-[#151a26] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
        <TrendingUp className="h-6 w-6 text-[#00c805]" />
        <span className="font-bold text-lg tracking-wider text-white">
          SB <span className="text-[#00c805]">STOCKS</span>
        </span>
      </Link>

      {/* Center Search Bar with Dropdown */}
      <div className="hidden md:block relative w-96 select-none" ref={dropdownRef}>
        <div className="flex items-center gap-2 bg-[#0b0e14] border border-[#222b3e] rounded-lg px-3 py-1.5 focus-within:border-[#00c805]/50 transition-colors">
          <Search className="h-4 w-4 text-[#8a9fc2]" />
          <input
            type="text"
            placeholder="Search stocks (e.g. AAPL, MSFT)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white w-full outline-none placeholder:text-[#8a9fc2]"
          />
          {isSearching && (
            <div className="h-3.5 w-3.5 border-2 border-[#00c805] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 border border-[#222b3e] bg-[#151a26] rounded-lg shadow-2xl p-1.5 max-h-60 overflow-y-auto space-y-1">
            {searchResults.map((item) => (
              <div
                key={item.symbol}
                onClick={() => handleSelectStock(item.symbol)}
                className="flex items-center justify-between p-2 rounded hover:bg-[#0b0e14] cursor-pointer group transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-[#00c805] transition-colors">
                    {item.symbol}
                  </p>
                  <p className="text-[9px] text-[#8a9fc2] max-w-[200px] truncate">
                    {item.description}
                  </p>
                </div>
                <span className="text-[9px] bg-[#222b3e] px-1.5 py-0.5 rounded text-[#8a9fc2]">Stock</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Side: Account Balance & Profile */}
      <div className="flex items-center gap-6">
        {user && (
          <div className="flex items-center gap-2 bg-[#0b0e14]/60 border border-[#222b3e] px-3 py-1.5 rounded-lg">
            <DollarSign className="h-4 w-4 text-[#00c805]" />
            <span className="text-xs text-[#8a9fc2] mr-1">Virtual Balance:</span>
            <span className="text-sm font-semibold text-white">
              ${user.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </span>
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-full bg-[#222b3e] border border-[#00c805]/30 flex items-center justify-center text-[#00c805] font-semibold overflow-hidden group-hover:border-[#00c805] transition-all">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span className="text-sm text-white font-medium group-hover:text-[#00c805] transition-colors hidden sm:inline">
                {user.username}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-[#8a9fc2] hover:text-[#ff3b30] transition-colors p-1.5 rounded-lg hover:bg-[#0b0e14]/50"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-[#8a9fc2] hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="bg-[#00c805] hover:bg-[#00c805]/90 text-[#0b0e14] font-semibold text-sm px-4 py-1.5 rounded-lg transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
