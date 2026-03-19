// Common product names with their proper Tamil equivalents
// These are real Tamil words, not phonetic transliterations
export const productNameMapping = {
  // Vegetables
  tomato: "தக்காளி",
  onion: "வெங்காயம்",
  potato: "உருளைக்கிழங்கு",
  carrot: "கேரட்",
  cabbage: "முட்டைக்கோஸ்",
  brinjal: "கத்திரிக்காய்",
  bitter_gourd: "பாகல்",
  bitter_melon: "பாகல்",
  gourd: "சுரைக்காய்",
  pumpkin: "பூசணி",
  cucumber: "வெள்ளரிக்காய்",
  radish: "முள்ளங்கி",
  bean: "பீன்ஸ்",
  okra: "பெண்டை",
  capsicum: "பெருமிளகாய்",
  bell_pepper: "பெருமிளகாய்",
  spinach: "பசலை",
  coriander: "கொத்தமல்லி",
  mint: "புதினா",
  garlic: "பூண்டு",
  ginger: "இஞ்சி",
  turmeric: "மஞ்சள்",

  // Fruits
  mango: "மாம்பழம்",
  banana: "வாழைப்பழம்",
  apple: "ஆப்பிள்",
  orange: "ஆரஞ்சு",
  lemon: "எலுமிச்சை",
  grape: "திராட்சை",
  papaya: "பப்பாளி",
  watermelon: "தர்பூசணி",
  coconut: "தேங்காய்",
  pineapple: "அன்னாசி",
  guava: "கொய்யா",
  pomegranate: "மாதுளை",
  strawberry: "ஸ்ட்ராபெரி",
  kiwi: "கிவி",

  // Spices
  salt: "உப்பு",
  chili: "மிளகாய்",
  pepper: "மிளகு",
  cumin: "சீரகம்",
  coriander_seeds: "மல்லி",
  fennel: "சோம்பு",
  asafoetida: "பெருங்காயம்",
  fenugreek: "வெந்தயம்",
  clove: "கிராம்பு",
  cinnamon: "பட்டை",
  cardamom: "ஏலக்காய்",
  bay_leaf: "கருவேப்பிலை",

  // Grains & Pulses
  rice: "அரிசி",
  wheat: "கோதுமை",
  dal: "பருப்பு",
  lentil: "பருப்பு",
  chickpea: "கொண்டைக்கடலை",
  green_peas: "பச்சைப்பயிறு",
  black_gram: "உளுத்து",
  chickpea_flour: "கடலை மாவு",

  // Dairy & Proteins
  milk: "பால்",
  curd: "தயிர்",
  butter: "வெண்ணெய்",
  cheese: "பனிர்",
  yogurt: "தயிர்",
  egg: "முட்டை",
  chicken: "கோழி",
  fish: "மீன்",
  meat: "வறுத்த மாமிஸம்",
  paneer: "பனிர்",

  // Oils & Fats
  oil: "எண்ணெய்",
  ghee: "நெய்",
  coconut_oil: "தேங்காய் எண்ணெய்",
  sesame_oil: "எள் எண்ணெய்",
  mustard_oil: "கடுகு எண்ணெய்",

  // Sauces & Condiments
  honey: "தேன்",
  sugar: "சர்க்கரை",
  jaggery: "வெல்லம்",
  vinegar: "கொதுமالி",
  soy_sauce: "சோயா சாஸ்",
  pickle: "ஆச்சாரம்",
  sauce: "சாஸ்",

  // Bread & Flour
  flour: "மாவு",
  bread: "ப்ரெட்",
  rice_flour: "அரிசி மாவு",
  wheat_flour: "மைதா",
  cornflour: "சோள மாவு",
  semolina: "ரவை",

  // Beverages
  tea: "தேநீர்",
  coffee: "காபி",
  milk_powder: "பால் பவுடர்",
  water: "நீர்",

  // Frozen & Ready-made
  frozen: "உறைந்த",
  ice_cream: "ஐஸ் கிரீம்",
  cheese_cake: "பாவுவு கேக்",
  brownie: "பிரெளனி",

  // Snacks
  chips: "சிப்ஸ்",
  biscuit: "பிஸ்கட்",
  cookie: "குக்கி",
  cracker: "கிராக்கர்",

  // General
  organic: "ஆர்கனிக்",
  fresh: "புதிய",
  premium: "ப்ரீமியம்",
  deluxe: "டீலக்ஸ்",
  special: "சிறப்பு",

  // Colors
  red: "சிவப்பு",
  green: "பச்சை",
  blue: "நீலம்",
  yellow: "மஞ்சள்",
  white: "வெள்ளை",
  black: "கருப்பு",
  brown: "பிரவுன்"
};

import { transliterateToTamil } from "./tamilPhonetic";

/**
 * Get proper Tamil product name from English product name
 * If no mapping exists for a word, it falls back to phonetic transliteration
 * @param {string} englishName - The product name in English
 * @returns {string} - The proper Tamil product name
 */
export const getTamilProductName = (englishName) => {
  if (!englishName) return "";
  
  // Split into words to handle multi-word products like "Fresh Red Apple"
  const words = englishName.trim().split(/\s+/);
  
  const tamilWords = words.map(word => {
    let key = word.toLowerCase().replace(/[^a-z]/g, "");
    
    // Check exact match
    if (productNameMapping[key]) {
      return productNameMapping[key];
    }
    
    // Check without trailing 's' (e.g. apples -> apple)
    if (key.endsWith('s') && productNameMapping[key.slice(0, -1)]) {
      return productNameMapping[key.slice(0, -1)] + "கள்"; // adding tamil plural suffix
    }
    
    // Check without trailing 'es' (e.g. potatoes -> potato)
    if (key.endsWith('es') && productNameMapping[key.slice(0, -2)]) {
      return productNameMapping[key.slice(0, -2)] + "கள்"; 
    }
    
    // Fallback to phonetic transliteration
    return transliterateToTamil(word);
  });
  
  return tamilWords.join(" ");
};
