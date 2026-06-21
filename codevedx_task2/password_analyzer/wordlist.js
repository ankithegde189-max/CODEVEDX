// Top 100 most common passwords
export const COMMON_PASSWORDS = [
  "123456", "password", "123456789", "12345678", "12345", "qwerty",
  "1234567", "google", "1234567890", "1234567890", "123456", "password123",
  "admin", "admin123", "letmein", "welcome", "football", "monkey",
  "charlie", "cisco", "oracle", "password1", "1234567890", "shadow",
  "superman", "batman", "princess", "starwars", "login", "root",
  "password!", "123456!", "qwerty123", "iloveyou", "mustang", "hunter2",
  "hello", "test", "testing", "testing123", "user", "guest", "pass",
  "123123", "111111", "1234567890", "123qwe", "security", "server",
  "database", "network", "system", "default", "manager", "support",
  "access", "change", "changeme", "secret", "private", "hidden",
  "internal", "backup", "restore", "archive", "temp", "temporary",
  "test1", "test2", "test3", "demo", "demo123", "guest123", "user123",
  "welcome1", "welcome123", "password123!", "1234567890!", "qwertyuiop",
  "asdfghjkl", "zxcvbnm", "qazwsx", "edcrfv", "tgbyhn", "ujmko",
  "1a2b3c", "password@123", "p@ssword", "p@ssw0rd", "pass123", "pass@123",
  "123456abc", "abc123", "xyz123", "love", "peace", "trust", "honest"
];

// Leet speak character mapping
const LEET_DICT = {
  'a': ['4', '@'],
  'e': ['3'],
  'i': ['1', '!'],
  'o': ['0'],
  's': ['5', '$'],
  't': ['7', '+'],
  'b': ['8'],
  'g': ['9']
};

export function generateMutations(word) {
  const mutations = new Set();
  const wordLower = word.toLowerCase();
  
  mutations.add(wordLower);
  mutations.add(wordLower.charAt(0).toUpperCase() + wordLower.slice(1));
  mutations.add(wordLower.toUpperCase());

  // Suffix lists
  const suffixes = ["1", "123", "!", "@", "123!", "2025", "2026", "2024", "12"];
  const currentMutations = Array.from(mutations);

  for (const m of currentMutations) {
    for (const suffix of suffixes) {
      mutations.add(m + suffix);
    }
  }

  // Leet speak mapping
  let leetWord = "";
  for (let i = 0; i < wordLower.length; i++) {
    const char = wordLower[i];
    if (LEET_DICT[char]) {
      leetWord += LEET_DICT[char][0];
    } else {
      leetWord += char;
    }
  }

  mutations.add(leetWord);
  mutations.add(leetWord + "1");
  mutations.add(leetWord + "!");

  return mutations;
}

export function checkWordlistVulnerability(password) {
  const pwdLower = password.toLowerCase();

  // Direct check
  const matchedCommon = COMMON_PASSWORDS.find(w => w.toLowerCase() === pwdLower);
  if (matchedCommon) {
    return {
      vulnerable: true,
      reason: "Matches a known common password exactly.",
      matched_word: pwdLower
    };
  }

  // Mutation checks
  for (const common of COMMON_PASSWORDS) {
    const muts = generateMutations(common);
    if (muts.has(password)) {
      return {
        vulnerable: true,
        reason: `Matches a mutation of the common password '${common}'`,
        matched_word: common
      };
    }
  }

  return {
    vulnerable: false,
    reason: "Not found in common password dictionary or simple mutations.",
    matched_word: null
  };
}
