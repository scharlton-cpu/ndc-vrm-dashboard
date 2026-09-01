// Grenada constituency & polling-division reference data used by the seed
// script. Registered-elector counts are demonstration figures engineered to
// sum to the 92,573 national benchmark; swap this file for the real
// electoral register export when one is available.

export const CONSTITUENCIES = [
  { code: "TSG", name: "Town of St. George", parish: "St. George", divisions: 12 },
  { code: "SGNE", name: "St. George North East", parish: "St. George", divisions: 10 },
  { code: "SGNW", name: "St. George North West", parish: "St. George", divisions: 9 },
  { code: "SGS", name: "St. George South", parish: "St. George", divisions: 10 },
  { code: "SGSE", name: "St. George South East", parish: "St. George", divisions: 9 },
  { code: "SDV", name: "St. David", parish: "St. David", divisions: 10 },
  { code: "SANE", name: "St. Andrew North East", parish: "St. Andrew", divisions: 9 },
  { code: "SASE", name: "St. Andrew South East", parish: "St. Andrew", divisions: 10 },
  { code: "SASW", name: "St. Andrew South West", parish: "St. Andrew", divisions: 9 },
  { code: "SANW", name: "St. Andrew North West", parish: "St. Andrew", divisions: 8 },
  { code: "SPE", name: "St. Patrick East", parish: "St. Patrick", divisions: 8 },
  { code: "SPW", name: "St. Patrick West", parish: "St. Patrick", divisions: 8 },
  { code: "SMK", name: "St. Mark", parish: "St. Mark", divisions: 6 },
  { code: "SJN", name: "St. John", parish: "St. John", divisions: 9 },
  { code: "CPM", name: "Carriacou & Petite Martinique", parish: "Carriacou & Petite Martinique", divisions: 7 },
] as const;

export const TOTAL_REGISTERED_ELECTORS = 92_573;

export const VILLAGE_NAMES: Record<string, string[]> = {
  TSG: ["Belmont", "Lucas Street", "Melville Street", "Church Street", "Tanteen", "Mt. Wheldale", "Paddock", "Springs", "Cross Street", "Herring Lane", "Young Street", "Market Hill"],
  SGNE: ["Morne Jaloux", "Belair", "St. Paul's", "Beaulieu", "Mon Repos", "Woodlands", "Cherry Hill", "Frequente", "Mardigras", "Bain's"],
  SGNW: ["Grand Anse", "Morne Rouge", "L'Anse aux Epines", "True Blue", "Woburn", "Point Salines", "Lance aux Epines", "Ross Point", "Prickly Bay"],
  SGS: ["Calivigny", "Westerhall", "Perdmontemps", "Marian", "Clarkes Court", "Woburn Bay", "Fontenoy", "Petit Bacaye", "La Sagesse", "Belle Vue"],
  SGSE: ["Grand Bras", "Mt. Horne", "Mardigras", "Beausejour", "Beaton", "Munich", "St. Paul's Extension", "Vendome", "Providence"],
  SDV: ["St. David's", "Bailles Bacolet", "Perdmontemps", "Mt. Hope", "Great Esperance", "La Fortune", "Corinth", "Petit Esperance", "Beaton", "Soubise"],
  SANE: ["Tivoli", "Simon", "Grand Bras", "La Poterie", "Mt. Horne", "Munich", "Byelands", "Corinth", "Paraclete"],
  SASE: ["Grenville", "Marquis", "Soubise", "Beausejour", "Mt. Rich", "Belvidere", "Chantimelle", "Mt. Reuil", "Paradise", "Union"],
  SASW: ["Snug Corner", "Mirabeau", "Tivoli", "Grand Bras", "Constantine", "Mt. Fendue", "La Fillette", "Chantimelle", "Vendome"],
  SANW: ["Grand Etang", "Mt. Rose", "Birch Grove", "Belvidere", "Chantimelle", "Paraclete", "Rose Hill", "Boulogne"],
  SPE: ["Sauteurs", "Chez Chemin", "Tufton Hall", "Mt. Rodney", "Union", "River Sallee", "Duquesne", "Bocage"],
  SPW: ["Victoria", "Dumfries", "Samaritan", "Mt. Craven", "Chez Chemin", "Marigot", "Diego Piece", "Morne Fendue"],
  SMK: ["Gouyave", "Clozier", "Union", "Florida", "Grand Roy", "Concord"],
  SJN: ["Gouyave", "Victoria", "Hermitage", "Nonpareil", "Palmiste", "Black Bay", "Marigot", "Waltham", "Belair"],
  CPM: ["Hillsborough", "L'Esterre", "Windward", "Harvey Vale", "Bogles", "Petite Martinique", "Top Hill"],
};
