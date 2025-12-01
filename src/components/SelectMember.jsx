import { useState, useEffect } from 'react';
import { familyData } from '../data/familyData';
import { supabase } from '../lib/supabase';
import { checkIfAllDrawsComplete } from '../utils/drawLogic';

function SelectMember({ onSelect }) {
  const [usersWhoHaveDrawn, setUsersWhoHaveDrawn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allDrawsComplete, setAllDrawsComplete] = useState(false);

  useEffect(() => {
    // Fetch users who have already drawn
    const fetchDrawnUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('draws')
        .select('giver_id');

      if (!error && data) {
        setUsersWhoHaveDrawn(data.map(d => d.giver_id));
      }

      // Check if all draws are complete
      const drawStatus = await checkIfAllDrawsComplete();
      setAllDrawsComplete(drawStatus.isComplete);

      setLoading(false);
    };

    fetchDrawnUsers();

    // Subscribe to real-time changes on the draws table
    const channel = supabase
      .channel('draws-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'draws'
        },
        async (payload) => {
          // Refetch the list of users who have drawn (without showing loading)
          const { data, error } = await supabase
            .from('draws')
            .select('giver_id');

          if (!error && data) {
            setUsersWhoHaveDrawn(data.map(d => d.giver_id));
          }

          // Check if all draws are complete
          const drawStatus = await checkIfAllDrawsComplete();
          setAllDrawsComplete(drawStatus.isComplete);
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="animate-bounce text-6xl mb-4">🎄</div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (allDrawsComplete) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
        <div className="text-6xl mb-6">🎉🎄🎁</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          All Names Are Drawn!
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          Everyone has successfully drawn their bunot-bunot recipient.
        </p>
        <div className="bg-gradient-to-r from-red-100 to-green-100 rounded-lg p-6 mb-6">
          <p className="text-2xl font-semibold text-gray-800 mb-2">
            See you on
          </p>
          <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
            December 24, 2025!
          </p>
        </div>
        <p className="text-gray-500 text-sm">
          Get ready for the gift exchange at the Christmas party!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Who are you?
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Select your name to continue
      </p>

      <div className="space-y-4">
        {familyData.map((family) => {
          // Filter out members who have already drawn
          const availableMembers = family.members.filter(
            member => !usersWhoHaveDrawn.includes(member.id)
          );

          // Only show the family section if there are available members
          if (availableMembers.length === 0) {
            return null;
          }

          return (
            <div key={family.familyName} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {family.familyName}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {availableMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => onSelect({ ...member, familyName: family.familyName })}
                    className="bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SelectMember;
