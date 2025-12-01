import { useState, useEffect } from 'react';
import { clearAllDraws, getAllDraws, getAllWishlists } from '../utils/drawLogic';
import { getAllMembers } from '../data/familyData';

function AdminPanel({ onClose, onReset }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [draws, setDraws] = useState([]);
  const [wishlists, setWishlists] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [allDraws, allWishlists] = await Promise.all([
      getAllDraws(),
      getAllWishlists()
    ]);

    setDraws(allDraws);

    // Convert wishlists array to object for easy lookup
    const wishlistsMap = {};
    allWishlists.forEach(w => {
      wishlistsMap[w.user_id] = w.wishlist;
    });
    setWishlists(wishlistsMap);

    setLoading(false);
  };

  const handleResetAll = async () => {
    await clearAllDraws();
    setDraws([]);
    onReset();
    setShowConfirm(false);
  };

  const allMembers = getAllMembers();
  const drawList = draws.map((data) => {
    const giver = allMembers.find(m => m.id === data.giverId);
    return {
      giver,
      recipientEncrypted: true,
      wishlist: wishlists[data.giverId] || null,
      drawnAt: data.drawnAt
    };
  });

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <div className="mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Total Draws:</strong> {draws.length} / {allMembers.length}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-bounce text-4xl mb-2">🎄</div>
            <p>Loading draws...</p>
          </div>
        ) : drawList.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Draw History
            </h3>
            {drawList.map((draw, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-800">
                      {draw.giver?.name}
                    </p>
                    <p className="text-xs text-gray-500">{draw.giver?.familyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">→</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800 flex items-center gap-1">
                      <span>🔒</span>
                      <span>Hidden</span>
                    </p>
                    <p className="text-xs text-gray-500 italic">For privacy</p>
                  </div>
                </div>
                {draw.wishlist && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600 font-medium mb-1">Wishlist:</p>
                    <p className="text-xs text-gray-700 line-clamp-2">
                      {draw.wishlist}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">🎁</p>
            <p>No draws yet</p>
          </div>
        )}
      </div>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={true}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Reset All Draws
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-800 font-medium">
              Are you sure? This will delete all draws and wishlists!
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleResetAll}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Yes, Reset All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
