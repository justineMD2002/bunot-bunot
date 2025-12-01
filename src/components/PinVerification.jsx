import { useState } from 'react';

function PinVerification({ user, onVerify, onBack }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate PIN format
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError('Please enter a valid 4-digit PIN');
      return;
    }

    setIsVerifying(true);
    setError('');

    const isValid = await onVerify(pin);

    if (!isValid) {
      setError('Invalid PIN. Please try again.');
      setPin('');
      setIsVerifying(false);
    }
  };

  const handlePinChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and max 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value);
      setError('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Welcome back, {user.name}!
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Enter your 4-digit PIN to view your draw
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            4-Digit PIN
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={pin}
            onChange={handlePinChange}
            placeholder="Enter 4-digit PIN"
            className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            autoFocus
            disabled={isVerifying}
          />
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isVerifying}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isVerifying || pin.length !== 4}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <p className="text-xs text-blue-700 text-center">
          This is the PIN shown to you after you drew your recipient. If you forgot your PIN, please contact the administrator.
        </p>
      </div>
    </div>
  );
}

export default PinVerification;
