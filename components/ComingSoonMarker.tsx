import React from 'react';

export const ComingSoonMarker: React.FC = () => {
  return (
    <div className="m-10 relative inline-block group">
      <div className="relative bg-red-500 text-white px-4 py-2 rounded-t-lg font-bold uppercase text-sm shadow-lg hover:scale-105 transition-transform">
        Coming Soon
        {/* Triangle pointer */}
        <div className="absolute left-1/2 -bottom-2 w-4 h-4 bg-red-500 transform -translate-x-1/2 rotate-45 origin-center shadow-lg"></div>
        
        {/* Optional folded corner effect */}
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-l-[20px] border-t-red-700 border-l-transparent"></div>
      </div>
    </div>
  );
};