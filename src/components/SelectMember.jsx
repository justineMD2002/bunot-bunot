import { familyData } from '../data/familyData';

function SelectMember({ onSelect }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Who are you?
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Select your name to continue
      </p>

      <div className="space-y-4">
        {familyData.map((family) => (
          <div key={family.familyName} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {family.familyName}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {family.members.map((member) => (
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
        ))}
      </div>
    </div>
  );
}

export default SelectMember;
