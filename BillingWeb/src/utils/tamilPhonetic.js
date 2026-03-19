// Basic Phonetic Tamil Transliteration Map
const tamilMap = {
    'a': 'அ', 'aa': 'ஆ', 'A': 'ஆ',
    'i': 'இ', 'ii': 'ஈ', 'I': 'ஈ',
    'u': 'உ', 'uu': 'ஊ', 'U': 'ஊ',
    'e': 'எ', 'ee': 'ஏ', 'E': 'ஏ',
    'ai': 'ஐ',
    'o': 'ஒ', 'oo': 'ஓ', 'O': 'ஓ',
    'au': 'ஔ',
    'k': 'க்', 'ka': 'க', 'kaa': 'கா', 'ki': 'கி', 'kii': 'கீ', 'ku': 'கு', 'kuu': 'கூ', 'ke': 'கெ', 'kee': 'கே', 'kai': 'கை', 'ko': 'கொ', 'koo': 'கோ', 'kau': 'கௌ',
    'ng': 'ங்', 'nga': 'ங', 'ngaa': 'ஙா', 'ngi': 'ஙி', 'ngii': 'ஙீ', 'ngu': 'ஙு', 'nguu': 'ஙூ', 'nge': 'ஙெ', 'ngee': 'ஙே', 'ngai': 'ஙை', 'ngo': 'ஙொ', 'ngoo': 'ஙோ', 'ngau': 'ஙௌ',
    'ch': 'ச்', 'cha': 'ச', 'chaa': 'சா', 'chi': 'சி', 'chii': 'சீ', 'chu': 'சு', 'chuu': 'சூ', 'che': 'செ', 'chee': 'சே', 'chai': 'சை', 'cho': 'சொ', 'choo': 'சோ', 'chau': 'சௌ',
    'nj': 'ஞ்', 'nja': 'ஞ', 'njaa': 'ஞா', 'nji': 'ஞி', 'njii': 'ஞீ', 'nju': 'ஞு', 'njuu': 'ஞூ', 'nje': 'ஞெ', 'njee': 'ஞே', 'njai': 'ஞை', 'njo': 'ஞொ', 'njoo': 'ஞோ', 'njau': 'ஞௌ',
    't': 'ட்', 'ta': 'ட', 'taa': 'டா', 'ti': 'டி', 'tii': 'டீ', 'tu': 'டு', 'tuu': 'டூ', 'te': 'டெ', 'tee': 'டே', 'tai': 'டை', 'to': 'டொ', 'too': 'டோ', 'tau': 'டௌ',
    'N': 'ண்', 'Na': 'ண', 'Naa': 'ணா', 'Ni': 'ணி', 'Nii': 'ணீ', 'Nu': 'ணு', 'Nuu': 'ணூ', 'Ne': 'ணெ', 'Nee': 'ணே', 'Nai': 'ணை', 'No': 'ணொ', 'Noo': 'ணோ', 'Nau': 'ணௌ',
    'th': 'த்', 'tha': 'த', 'thaa': 'தா', 'thi': 'தி', 'thii': 'தீ', 'thu': 'து', 'thuu': 'தூ', 'the': 'தெ', 'thee': 'தே', 'thai': 'தை', 'tho': 'தொ', 'thoo': 'தோ', 'thau': 'தௌ',
    'n': 'ந்', 'na': 'ந', 'naa': 'நா', 'ni': 'நி', 'nii': 'நீ', 'nu': 'நு', 'nuu': 'நூ', 'ne': 'நெ', 'nee': 'நே', 'nai': 'நை', 'no': 'நொ', 'noo': 'நோ', 'nau': 'நௌ',
    'p': 'ப்', 'pa': 'ப', 'paa': 'பா', 'pi': 'பி', 'pii': 'பீ', 'pu': 'பு', 'puu': 'பூ', 'pe': 'பெ', 'pee': 'பே', 'pai': 'பை', 'po': 'பொ', 'poo': 'போ', 'pau': 'பௌ',
    'm': 'ம்', 'ma': 'ம', 'maa': 'மா', 'mi': 'மி', 'mii': 'மீ', 'mu': 'மு', 'muu': 'மூ', 'me': 'மெ', 'mee': 'மே', 'mai': 'மை', 'mo': 'மொ', 'moo': 'மோ', 'mau': 'மௌ',
    'y': 'ய்', 'ya': 'ய', 'yaa': 'யா', 'yi': 'யி', 'yii': 'யீ', 'yu': 'யு', 'yuu': 'யூகூ', 'ye': 'யெ', 'yee': 'யே', 'yai': 'யை', 'yo': 'யொ', 'yoo': 'யோ', 'yau': 'யௌ',
    'r': 'ர்', 'ra': 'ர', 'raa': 'ரா', 'ri': 'ரி', 'rii': 'ரீ', 'ru': 'ரு', 'ruu': 'ரூ', 're': 'ரெ', 'ree': 'ரே', 'rai': 'ரை', 'ro': 'ரொ', 'roo': 'ரோ', 'rau': 'ரௌ',
    'l': 'ல்', 'la': 'ல', 'laa': 'லா', 'li': 'லி', 'lii': 'லீ', 'lu': 'லு', 'luu': 'லூ', 'le': 'லெ', 'lee': 'லே', 'lai': 'லை', 'lo': 'லொ', 'loo': 'லோ', 'lau': 'லௌ',
    'v': 'வ்', 'va': 'வ', 'vaa': 'வா', 'vi': 'வி', 'vii': 'வீ', 'vu': 'வு', 'vuu': 'வூ', 've': 'வெ', 'vee': 'வே', 'vai': 'வை', 'vo': 'வொ', 'voo': 'வோ', 'vau': 'வௌ',
    'zh': 'ழ்', 'zha': 'ழ', 'zhaa': 'ழா', 'zhi': 'ழி', 'zhii': 'ழீ', 'zhu': 'ழு', 'zhuu': 'ழூ', 'zhe': 'ழெ', 'zhee': 'ழே', 'zhai': 'ழை', 'zho': 'ழொ', 'zhoo': 'ழோ', 'zhau': 'ழௌ',
    'L': 'ள்', 'La': 'ள', 'Laa': 'ளா', 'Li': 'ளி', 'Lii': 'ளீ', 'Lu': 'ளு', 'Luu': 'ளூ', 'Le': 'ளெ', 'Lee': 'ளே', 'Lai': 'ளை', 'Lo': 'ளொ', 'Loo': 'ளோ', 'Lau': 'ளௌ',
    'rr': 'ற்', 'rra': 'ற', 'rraa': 'றா', 'rri': 'றி', 'rrii': 'றீ', 'rru': 'று', 'rruu': 'றூ', 'rre': 'றெ', 'rree': 'றே', 'rrai': 'றை', 'rro': 'றொ', 'rroo': 'றோ', 'rrau': 'றௌ',
    'nn': 'ன்', 'nna': 'ன', 'nnaa': 'னா', 'nni': 'னி', 'nnii': 'னீ', 'nnu': 'னு', 'nnuu': 'னூ', 'nne': 'னெ', 'nnee': 'னே', 'nnai': 'னை', 'nno': 'னொ', 'nnoo': 'னோ', 'nnau': 'னௌ',

    // Added common Latin phonetics for Tamil S / SH sounds
    's': 'ஸ்', 'sa': 'ச', 'saa': 'சா', 'si': 'சி', 'sii': 'சீ', 'su': 'சு', 'suu': 'சூ', 'se': 'செ', 'see': 'சே', 'sai': 'சை', 'so': 'சொ', 'soo': 'சோ', 'sau': 'சௌ',
    'sh': 'ஷ்', 'sha': 'ஷ', 'shaa': 'ஷா', 'shi': 'ஷி', 'shii': 'ஷீ', 'shu': 'ஷு', 'shuu': 'ஷூ', 'she': 'ஷெ', 'shee': 'ஷே', 'shai': 'ஷை', 'sho': 'ஷொ', 'shoo': 'ஷோ', 'shau': 'ஷௌ'
};

/**
 * Perform basic phonetic transliteration from English to Tamil.
 * Note: This is a simplified version and might not cover all linguistic nuances.
 * @param {string} text - The phonetic English text.
 * @returns {string} - The transliterated Tamil text.
 */
// Build reverse map for Tamil -> Latin transliteration (used for Tamil->English phonetic matching)
const reverseTamilMap = Object.entries(tamilMap)
    .reduce((acc, [latin, tamil]) => {
        // Some Tamil values may already exist; prefer the longest Latin key
        if (!acc[tamil] || latin.length > acc[tamil].length) {
            acc[tamil] = latin;
        }
        return acc;
    }, {});

// Sort reverse keys by length descending so longer Tamil sequences match first
const reverseSortedKeys = Object.keys(reverseTamilMap).sort((a, b) => b.length - a.length);

export const transliterateToTamil = (text) => {
    if (!text) return "";

    // Sort keys by length DESC to match longer compounds first (e.g., 'aa' before 'a')
    const sortedKeys = Object.keys(tamilMap).sort((a, b) => b.length - a.length);
    let result = "";
    let i = 0;

    while (i < text.length) {
        let matchFound = false;

        // Try to match the longest key first
        for (const key of sortedKeys) {
            if (text.startsWith(key, i)) {
                result += tamilMap[key];
                i += key.length;
                matchFound = true;
                break;
            }
        }

        if (!matchFound) {
            result += text[i]; // Keep original if no match
            i++;
        }
    }

    return result;
};

export const transliterateTamilToLatin = (text) => {
    if (!text) return "";

    let result = "";
    let i = 0;

    while (i < text.length) {
        let matchFound = false;

        for (const key of reverseSortedKeys) {
            if (text.startsWith(key, i)) {
                result += reverseTamilMap[key];
                i += key.length;
                matchFound = true;
                break;
            }
        }

        if (!matchFound) {
            result += text[i];
            i++;
        }
    }

    return result;
};
