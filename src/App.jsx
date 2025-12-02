import { useState, useEffect } from 'react';
import SelectMember from './components/SelectMember';
import Wishlist from './components/Wishlist';
import DrawResult from './components/DrawResult';
import AdminPanel from './components/AdminPanel';
import PinVerification from './components/PinVerification';
import { getDrawFromDatabase, verifyPin } from './utils/drawLogic';

function App() {
  const [step, setStep] = useState('select');
  const [selectedUser, setSelectedUser] = useState(null);
  const [wishlist, setWishlist] = useState('');
  const [drawnRecipient, setDrawnRecipient] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      checkExistingDraw(selectedUser.id);
    }
  }, [selectedUser]);

  const checkExistingDraw = async (userId) => {
    setLoading(true);
    const existingDraw = await getDrawFromDatabase(userId);
    if (existingDraw) {
      setDrawnRecipient(existingDraw.recipientId);
      setStep('pin-verify');
    }
    setLoading(false);
  };

  const handleMemberSelect = async (member) => {
    setSelectedUser(member);
    setLoading(true);
    const existingDraw = await getDrawFromDatabase(member.id);
    if (existingDraw) {
      setDrawnRecipient(existingDraw.recipientId);
      setStep('pin-verify');
    } else {
      setStep('wishlist');
    }
    setLoading(false);
  };

  const handleWishlistSubmit = (wishlistText) => {
    setWishlist(wishlistText);
    setStep('draw');
  };

  const handleDrawComplete = (recipient) => {
    setDrawnRecipient(recipient);
    setStep('result');
  };

  const handlePinVerify = async (enteredPin) => {
    if (!selectedUser) return false;

    const existingDraw = await getDrawFromDatabase(selectedUser.id);
    if (existingDraw) {
      const isValid = await verifyPin(enteredPin, existingDraw.pin);
      if (isValid) {
        setStep('result');
        return true;
      }
    }
    return false;
  };

  const handleReset = () => {
    setStep('select');
    setSelectedUser(null);
    setWishlist('');
    setDrawnRecipient(null);
  };

  const toggleAdmin = () => {
    setShowAdmin(!showAdmin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-green-700 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Bunot-Bunot
          </h1>
          <h2 className="text-lg text-white/90 mb-1">
            Familia Zaragoza AKA Team Nustar
          </h2>
          <h3 className="text-md text-white/80">
            Christmas Party 2025
          </h3>
        </div>

        {showAdmin ? (
          <AdminPanel onClose={toggleAdmin} onReset={handleReset} />
        ) : loading ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="animate-bounce text-6xl mb-4">🎄</div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {step === 'select' && (
              <SelectMember onSelect={handleMemberSelect} />
            )}

            {step === 'wishlist' && (
              <Wishlist
                user={selectedUser}
                onSubmit={handleWishlistSubmit}
                onBack={handleReset}
              />
            )}

            {step === 'pin-verify' && (
              <PinVerification
                user={selectedUser}
                onVerify={handlePinVerify}
                onBack={handleReset}
              />
            )}

            {step === 'draw' && (
              <DrawResult
                user={selectedUser}
                userWishlist={wishlist}
                onDrawComplete={handleDrawComplete}
                onReset={handleReset}
              />
            )}

            {step === 'result' && (
              <DrawResult
                user={selectedUser}
                userWishlist={wishlist}
                recipientId={drawnRecipient}
                onReset={handleReset}
                alreadyDrawn={true}
              />
            )}
          </>
        )}

        <button
          onClick={toggleAdmin}
          className="fixed bottom-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-colors"
          aria-label="Admin Panel"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}

export default App;
