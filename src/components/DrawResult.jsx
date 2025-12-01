import { useState, useEffect } from 'react';
import { performDrawWithRetry, getWishlist, saveWishlist, getDrawFromDatabase } from '../utils/drawLogic';
import { getAllMembers } from '../data/familyData';

function DrawResult({ user, userWishlist, recipientId, onDrawComplete, onReset, alreadyDrawn = false }) {
  const [recipient, setRecipient] = useState(null);
  const [recipientWishlist, setRecipientWishlist] = useState('');
  const [isDrawing, setIsDrawing] = useState(!alreadyDrawn);
  const [error, setError] = useState(null);
  const [pin, setPin] = useState(null);

  useEffect(() => {
    if (alreadyDrawn && recipientId) {
      loadExistingDraw();
    } else if (!alreadyDrawn) {
      performDrawAnimation();
    }
  }, [alreadyDrawn, recipientId]);

  const loadExistingDraw = async () => {
    const allMembers = getAllMembers();
    const recipientData = allMembers.find(m => m.id === recipientId);
    setRecipient(recipientData);

    // Fetch the draw data to get the PIN
    const drawData = await getDrawFromDatabase(user.id);
    if (drawData && drawData.pin) {
      setPin(drawData.pin);
    }

    // Fetch recipient's wishlist
    const wishlist = await getWishlist(recipientId);
    setRecipientWishlist(wishlist || '');
    setIsDrawing(false);
  };

  const performDrawAnimation = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Save user's wishlist first
    await saveWishlist(user.id, userWishlist);

    // Perform the draw with automatic retry on conflicts
    const result = await performDrawWithRetry(user.id);

    if (!result.success) {
      setError(result.error || 'Failed to draw. Please try again.');
      setIsDrawing(false);
      return;
    }

    // Check if this is an existing draw (user already drew before)
    if (result.alreadyExisted) {
      setError('You have already drawn! Each person can only draw once.');
      setIsDrawing(false);
      return;
    }

    const drawnRecipient = result.recipient;
    setRecipient(drawnRecipient);

    // Set the PIN
    if (result.pin) {
      setPin(result.pin);
    }

    // Fetch recipient's wishlist
    const wishlist = await getWishlist(drawnRecipient.id);
    setRecipientWishlist(wishlist || '');

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
        <p className="text-sm text-gray-500 mb-4">
          from {recipient?.familyName}
        </p>

        {pin && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 shadow-lg">
            <p className="text-white text-sm font-medium mb-1">Your Secret PIN</p>
            <p className="text-white text-3xl font-bold tracking-widest">{pin}</p>
            <p className="text-white text-xs mt-2 opacity-90">Save this PIN to view your draw later</p>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
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

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="text-2xl mr-3">💰</div>
          <div>
            <p className="text-sm font-medium text-blue-800">
              Gift Budget
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Minimum of ₱500 for your gift. Make it thoughtful and special!
            </p>
          </div>
        </div>
      </div>

      {recipientWishlist && (
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
            <span>🎁</span>
            <span>{recipient?.name}'s Wishlist:</span>
          </h3>
          <p className="text-sm text-green-800 whitespace-pre-wrap">
            {recipientWishlist}
          </p>
        </div>
      )}

      {!recipientWishlist && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 italic text-center">
            {recipient?.name} hasn't added a wishlist yet
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
