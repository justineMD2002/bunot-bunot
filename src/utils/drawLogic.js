import { getFamilyByMemberId, getAllMembers } from '../data/familyData';

export const getEligibleRecipients = (giverId, alreadyDrawn) => {
  const allMembers = getAllMembers();
  const giverFamily = getFamilyByMemberId(giverId);

  return allMembers.filter(member => {
    if (member.id === giverId) return false;
    if (alreadyDrawn.includes(member.id)) return false;
    if (member.familyName === giverFamily) return false;
    return true;
  });
};

export const performDraw = (giverId, alreadyDrawn) => {
  const eligible = getEligibleRecipients(giverId, alreadyDrawn);

  if (eligible.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex];
};

export const saveDrawToStorage = (userId, recipientId, wishlist) => {
  const draws = JSON.parse(localStorage.getItem('manitoDraws') || '{}');
  draws[userId] = {
    recipientId,
    wishlist,
    drawnAt: new Date().toISOString()
  };
  localStorage.setItem('manitoDraws', JSON.stringify(draws));

  const allDrawn = JSON.parse(localStorage.getItem('allDrawnRecipients') || '[]');
  if (!allDrawn.includes(recipientId)) {
    allDrawn.push(recipientId);
    localStorage.setItem('allDrawnRecipients', JSON.stringify(allDrawn));
  }
};

export const getDrawFromStorage = (userId) => {
  const draws = JSON.parse(localStorage.getItem('manitoDraws') || '{}');
  return draws[userId] || null;
};

export const getAllDrawnRecipients = () => {
  return JSON.parse(localStorage.getItem('allDrawnRecipients') || '[]');
};

export const clearAllDraws = () => {
  localStorage.removeItem('manitoDraws');
  localStorage.removeItem('allDrawnRecipients');
};
