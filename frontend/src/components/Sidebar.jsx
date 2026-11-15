import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  Star,
  History,
  User,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Market', path: '/market', icon: TrendingUp },
    { name: 'Portfolio', path: '/portfolio', icon: PieChart },
    { name: 'Watchlist', path: '/watchlist', icon: Star },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 border-r border-[#222b3e] bg-[#151a26] flex flex-col justify-between hidden md:flex h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-[#8a9fc2] uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#00c805]/10 text-[#00c805] font-bold border-l-2 border-[#00c805]'
                    : 'text-[#8a9fc2] hover:text-white hover:bg-[#1c2333]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Market Status Widget */}
      <div className="p-4 m-3 rounded-xl bg-[#0b0e14] border border-[#222b3e] space-y-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00c805] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00c805]"></span>
          </span>
          <span className="text-xs font-bold text-white">US Market Open</span>
        </div>
        <p className="text-[11px] text-[#8a9fc2] leading-relaxed">
          Simulated trading hours 9:30 AM – 4:00 PM EST. Real-time paper quotes active.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
