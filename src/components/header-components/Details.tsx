import React from "react";

const Details: React.FC = () => {
  return (
    <div className="p-6 text-white">
      <div className="space-y-6">
        {/* Statistics Panel */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-6 shadow-lg transform transition duration-300 hover:scale-105">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-600 pb-2">Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Views</span>
              <span className="text-blue-300 font-bold">1,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Comments</span>
              <span className="text-green-300 font-bold">56</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Shares</span>
              <span className="text-purple-300 font-bold">23</span>
            </div>
          </div>
        </div>

        {/* Category Panel */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-6 shadow-lg transform transition duration-300 hover:scale-105">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-600 pb-2">Count</h3>
          <div className="flex flex-wrap gap-3">
            <span className="bg-blue-600/20 text-blue-200 px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-colors hover:bg-blue-600 hover:text-white">
              Technology
            </span>
            <span className="bg-green-600/20 text-green-200 px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-colors hover:bg-green-600 hover:text-white">
              Development
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
