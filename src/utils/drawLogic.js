import { getFamilyByMemberId, getAllMembers } from '../data/familyData';
import { supabase } from '../lib/supabase';
import { encryptRecipient, decryptRecipient, hashRecipient } from './encryption';
import bcrypt from 'bcryptjs';

// Generate a random 4-digit PIN
export const generatePin = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Verify PIN against hash stored in database
export const verifyPin = async (enteredPin, pinHash) => {
  try {
    const isValid = await bcrypt.compare(enteredPin, pinHash);
    return isValid;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

export const getEligibleRecipients = (giverId, alreadyDrawnHashes) => {
  const allMembers = getAllMembers();

  return allMembers.filter(member => {
    // Only prevent drawing yourself
    if (member.id === giverId) return false;
    // Prevent drawing someone who's already been drawn
    const memberHash = hashRecipient(member.id);
    if (alreadyDrawnHashes.includes(memberHash)) return false;
    return true;
  });
};

// Fisher-Yates shuffle algorithm for maximum randomness
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const performDraw = (giverId, alreadyDrawnHashes) => {
  const eligible = getEligibleRecipients(giverId, alreadyDrawnHashes);

  if (eligible.length === 0) {
    return null;
  }

  // Shuffle the eligible recipients multiple times for extra randomness
  let shuffled = shuffleArray(eligible);
  shuffled = shuffleArray(shuffled);
  shuffled = shuffleArray(shuffled);

  // Pick a random index from the shuffled array
  const randomIndex = Math.floor(Math.random() * shuffled.length);
  return shuffled[randomIndex];
};

export const saveDrawToDatabase = async (userId, recipientId) => {
  try {
    const encryptedRecipientId = encryptRecipient(recipientId, userId);
    const recipientHash = hashRecipient(recipientId);
    const pin = generatePin();

    const { data, error } = await supabase
      .from('draws')
      .insert({
        giver_id: userId,
        recipient_id: encryptedRecipientId,
        recipient_hash: recipientHash,
        pin_hash: pin,
        drawn_at: new Date().toISOString()
      })
      .select();

    if (error) {
      // Check if it's a duplicate recipient error (concurrent draw conflict)
      if (error.code === '23505' && error.message.includes('recipient_hash')) {
        return { success: false, error, conflict: 'recipient_taken' };
      }
      // Check if giver already drew (shouldn't happen, but just in case)
      if (error.code === '23505' && error.message.includes('giver_id')) {
        return { success: false, error, conflict: 'already_drawn' };
      }
      throw error;
    }
    return { success: true, data, pin };
  } catch (error) {
    console.error('Error saving draw:', error);
    return { success: false, error };
  }
};

// Perform draw with automatic retry on conflicts (handles concurrent draws)
export const performDrawWithRetry = async (userId, maxRetries = 5) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Fetch the latest list of drawn recipients
    const alreadyDrawnHashes = await getAllDrawnRecipients();

    // Perform the draw
    const drawnRecipient = performDraw(userId, alreadyDrawnHashes);

    if (!drawnRecipient) {
      return { success: false, error: 'No eligible recipients available' };
    }

    // Try to save to database
    const result = await saveDrawToDatabase(userId, drawnRecipient.id);

    if (result.success) {
      return { success: true, recipient: drawnRecipient, pin: result.pin };
    }

    // If recipient was taken by someone else (concurrent draw), retry
    if (result.conflict === 'recipient_taken') {
      console.log(`Attempt ${attempt + 1}: Recipient already taken, retrying...`);
      // Add a small random delay to reduce collision probability
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
      continue;
    }

    // If giver already drew, return existing draw
    if (result.conflict === 'already_drawn') {
      const existingDraw = await getDrawFromDatabase(userId);
      if (existingDraw) {
        const allMembers = getAllMembers();
        const recipient = allMembers.find(m => m.id === existingDraw.recipientId);
        return { success: true, recipient, pin: existingDraw.pin, alreadyExisted: true };
      }
    }

    // Other errors
    return { success: false, error: result.error };
  }

  // Max retries exceeded
  return { success: false, error: 'Max retries exceeded. Please try again.' };
};

export const getDrawFromDatabase = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .eq('giver_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    const decryptedRecipientId = decryptRecipient(data.recipient_id, userId);

    return {
      recipientId: decryptedRecipientId,
      drawnAt: data.drawn_at,
      pin: data.pin_hash
    };
  } catch (error) {
    console.error('Error getting draw:', error);
    return null;
  }
};

export const getAllDrawnRecipients = async () => {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('recipient_hash');

    if (error) throw error;

    return data.map(d => d.recipient_hash);
  } catch (error) {
    console.error('Error getting drawn recipients:', error);
    return [];
  }
};

export const getAllDraws = async () => {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .order('drawn_at', { ascending: false });

    if (error) throw error;

    return data.map(d => ({
      giverId: d.giver_id,
      recipientId: '[ENCRYPTED]',
      drawnAt: d.drawn_at
    }));
  } catch (error) {
    console.error('Error getting all draws:', error);
    return [];
  }
};

export const clearAllDraws = async () => {
  try {
    const { error: errorDraw } = await supabase
      .from('draws')
      .delete()
      .neq('giver_id', '');

    const { error: errorWish } = await supabase
      .from('wishlists')
      .delete()
      .neq('user_id', '');

    if (errorDraw) throw errorDraw;
    if (errorWish) throw errorWish;
    return { success: true };
  } catch (error) {
    console.error('Error clearing draws:', error);
    return { success: false, error };
  }
};

// Wishlist functions
export const saveWishlist = async (userId, wishlistText) => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .upsert({
        user_id: userId,
        wishlist: wishlistText,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving wishlist:', error);
    return { success: false, error };
  }
};

export const getWishlist = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('wishlist')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data.wishlist;
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return null;
  }
};

export const getAllWishlists = async () => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting all wishlists:', error);
    return [];
  }
};

export const checkIfAllDrawsComplete = async () => {
  try {
    const allMembers = getAllMembers();
    const totalMembers = allMembers.length;

    const { data, error } = await supabase
      .from('draws')
      .select('giver_id');

    if (error) throw error;

    const totalDraws = data ? data.length : 0;

    return {
      isComplete: totalDraws === totalMembers,
      totalMembers,
      totalDraws
    };
  } catch (error) {
    console.error('Error checking if all draws complete:', error);
    return {
      isComplete: false,
      totalMembers: 0,
      totalDraws: 0
    };
  }
};
