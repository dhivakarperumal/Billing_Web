import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              BillingSoft
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-600 hover:text-blue-600 font-medium transition">Dashboard</a>
            <a href="/invoices" className="text-gray-600 hover:text-blue-600 font-medium transition">Invoices</a>
            <a href="/members" className="text-gray-600 hover:text-blue-600 font-medium transition">Members</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-600 font-medium transition">
              Login
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-blue-200 transition">
              Register
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
