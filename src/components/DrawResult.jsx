import { useState, useEffect } from 'react';
import { performDraw, saveDrawToStorage, getAllDrawnRecipients } from '../utils/drawLogic';
import { getAllMembers } from '../data/familyData';

function DrawResult({ user, wishlist, recipientId, onDrawComplete, onReset, alreadyDrawn = false }) {
  const [recipient, setRecipient] = useState(null);
  const [isDrawing, setIsDrawing] = useState(!alreadyDrawn);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (alreadyDrawn && recipientId) {
      const allMembers = getAllMembers();
      const recipientData = allMembers.find(m => m.id === recipientId);
      setRecipient(recipientData);
      setIsDrawing(false);
    } else if (!alreadyDrawn) {
      performDrawAnimation();
    }
  }, [alreadyDrawn, recipientId]);

  const performDrawAnimation = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const alreadyDrawnList = getAllDrawnRecipients();
    const drawnRecipient = performDraw(user.id, alreadyDrawnList);

    if (!drawnRecipient) {
      setError('No available recipients to draw. Please contact the admin.');
      setIsDrawing(false);
      return;
    }

    saveDrawToStorage(user.id, drawnRecipient.id, wishlist);
    setRecipient(drawnRecipient);
    setIsDrawing(false);
    onDrawComplete(drawnRecipient.id);
  };

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-6 animate-fade-in text-center">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Oops!
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onReset}
          className="bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (isDrawing) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in text-center">
        <div className="animate-bounce text-6xl mb-4">🎁</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Drawing your Manito...
        </h2>
        <p className="text-gray-600">
          Please wait while we pick someone special for you!
        </p>
        <div className="mt-6 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Congratulations, {user.name}!
        </h2>
        <p className="text-gray-600 mb-4">
          You will be giving a gift to:
        </p>
        <div className="bg-gradient-to-r from-red-500 to-green-500 text-white text-3xl font-bold py-6 px-4 rounded-xl shadow-lg mb-4">
          {recipient?.name}
        </div>
        <p className="text-sm text-gray-500">
          from {recipient?.familyName}
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="text-2xl mr-3">🤫</div>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Remember: Keep it a secret!
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Don't tell anyone who you got. That's the fun of Manito-Manita!
            </p>
          </div>
        </div>
      </div>

      {wishlist && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Your Wishlist:
          </h3>
          <p className="text-sm text-blue-800 whitespace-pre-wrap">
            {wishlist}
          </p>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
      >
        Done
      </button>
    </div>
  );
}

export default DrawResult;
