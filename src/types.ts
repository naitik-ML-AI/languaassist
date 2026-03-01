export interface Language {
  name: string;
  code: string; // BCP 47 language tag for Speech Recognition
  nativeName: string;
  description: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { name: "Hindi", code: "hi-IN", nativeName: "हिन्दी", description: "Predominant in Northern & Central India" },
  { name: "Bengali", code: "bn-IN", nativeName: "বাংলা", description: "West Bengal & Northeast" },
  { name: "Marathi", code: "mr-IN", nativeName: "मराठी", description: "Maharashtra" },
  { name: "Telugu", code: "te-IN", nativeName: "తెలుగు", description: "Andhra Pradesh & Telangana" },
  { name: "Tamil", code: "ta-IN", nativeName: "தமிழ்", description: "Tamil Nadu" },
  { name: "Gujarati", code: "gu-IN", nativeName: "ગુજરાતી", description: "Gujarat" },
  { name: "Urdu", code: "ur-IN", nativeName: "اردو", description: "Spoken across multiple states" },
  { name: "Kannada", code: "kn-IN", nativeName: "ಕನ್ನಡ", description: "Karnataka" },
  { name: "Odia", code: "or-IN", nativeName: "ଓଡ଼ିଆ", description: "Odisha" },
  { name: "Malayalam", code: "ml-IN", nativeName: "മലയാളം", description: "Kerala" },
];
