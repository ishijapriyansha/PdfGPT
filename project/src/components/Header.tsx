import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
// Displays the application name with an icon and a navigation link to the Documents page.
const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo section*/}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-emerald-500 text-white p-1.5 rounded-md">
            <FileText size={20} />
          </div>
             {/* App name and subtitle */}
          <span className="text-xl font-semibold text-gray-800">PdfGPT</span>
          <span className="text-sm text-emerald-500 hidden sm:inline-block">documents made easier</span>
        </Link>
        
        {/* <div className="flex space-x-4">
          <Link 
            to="/"
            className="text-gray-600 hover:text-emerald-500 transition-colors"
          >
            Documents
          </Link>
        </div> */}
      </div>
    </header>
  );
};

export default Header;