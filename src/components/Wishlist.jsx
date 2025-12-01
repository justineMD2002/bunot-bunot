import { useState } from 'react';

function Wishlist({ user, onSubmit, onBack }) {
  const [wishlistText, setWishlistText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(wishlistText);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Hi, {user.name}!
      </h2>
      <p className="text-gray-600 text-center mb-6">
        What's on your wishlist this Christmas?
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Wishlist (Optional)
          </label>
          <textarea
            value={wishlistText}
            onChange={(e) => setWishlistText(e.target.value)}
            placeholder="E.g., Books, gadgets, clothes, anything you'd love to receive..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            This will help your Manito choose the perfect gift for you!
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Continue to Draw
          </button>
        </div>
      </form>
    </div>
  );
}

export default Wishlist;
