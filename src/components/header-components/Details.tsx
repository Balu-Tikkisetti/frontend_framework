// src/components/Details.tsx
const Details = () => {
    return (
      <div className="p-4 text-white">
        <h2 className="text-xl font-bold mb-4">Topic Details</h2>
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Views</span>
                <span>1,234</span>
              </div>
              <div className="flex justify-between">
                <span>Comments</span>
                <span>56</span>
              </div>
              <div className="flex justify-between">
                <span>Shares</span>
                <span>23</span>
              </div>
            </div>
          </div>
  
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Category</h3>
            <div className="flex gap-2">
              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                Technology
              </span>
              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-sm">
                Development
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Details;