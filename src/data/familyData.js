export const familyData = [
  {
    familyName: "Daugdaug Family",
    members: [
      { id: "justine", name: "Justine" },
      { id: "jean", name: "Jean" },
      { id: "john-andrew", name: "John Andrew" },
      { id: "edna", name: "Edna" },
      { id: "baby-zia", name: "Baby Zia" },
      { id: "baby-aki", name: "Baby Aki" },
      { id: "krystel", name: "Krystel" },
      { id: "mommy-xty", name: "Mommy Xty" },
      { id: "francis", name: "Francis" },
      // { id: "rada", name: "Rada" }
    ]
  },
  {
    familyName: "Auxtero Family",
    members: [
      { id: "shay", name: "Shay" },
      { id: "levie-rose", name: "Levie Rose" },
      { id: "lilibeth", name: "Lilibeth" },
      { id: "junray", name: "Junray" },
      { id: "art", name: "Art" },
      { id: "nathan", name: "Nathan" },
      { id: "jam", name: "Jam" }
    ]
  },
  {
    familyName: "Isales Family",
    members: [
      { id: "bruce", name: "Bruce" },
      { id: "vivian", name: "Vivian" },
      { id: "kuya-shawn", name: "Kuya Shawn" }
    ]
  },
  {
    familyName: "Macasero Family",
    members: [
      { id: "charie", name: "Charie" },
      { id: "kevin", name: "Kevin" },
      { id: "andrei", name: "Andrei" }
    ]
  }
];

export const getAllMembers = () => {
  return familyData.flatMap(family =>
    family.members.map(member => ({
      ...member,
      familyName: family.familyName
    }))
  );
};

export const getFamilyByMemberId = (memberId) => {
  for (const family of familyData) {
    if (family.members.some(m => m.id === memberId)) {
      return family.familyName;
    }
  }
  return null;
};
