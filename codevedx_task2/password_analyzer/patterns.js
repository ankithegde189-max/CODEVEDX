// Keyboard configurations for QWERTY walking patterns
const KEYBOARD_ROWS = [
  "1234567890-=",
  "qwertyuiop[]\\",
  "asdfghjkl;'",
  "zxcvbnm,./"
];

export function checkKeyboardWalks(password, threshold = 3) {
  const detectedWalks = [];
  const pwdLower = password.toLowerCase();

  for (let i = 0; i <= pwdLower.length - threshold; i++) {
    const chunk = pwdLower.slice(i, i + threshold);

    for (const row of KEYBOARD_ROWS) {
      // Forward walk
      if (row.includes(chunk)) {
        detectedWalks.push(password.slice(i, i + threshold));
        break;
      }
      // Backward walk
      const reversedRow = row.split("").reverse().join("");
      if (reversedRow.includes(chunk)) {
        detectedWalks.push(password.slice(i, i + threshold));
        break;
      }
    }
  }

  return Array.from(new Set(detectedWalks));
}

export function checkCharacterSequences(password, threshold = 3) {
  const detectedSeqs = [];
  const pwdLower = password.toLowerCase();

  for (let i = 0; i <= pwdLower.length - threshold; i++) {
    const chunk = pwdLower.slice(i, i + threshold);

    let isForward = true;
    let isBackward = true;

    for (let j = 1; j < threshold; j++) {
      const diff = chunk.charCodeAt(j) - chunk.charCodeAt(j - 1);
      if (diff !== 1) isForward = false;
      if (diff !== -1) isBackward = false;
    }

    if (isForward || isBackward) {
      // Must be alphanumeric characters to avoid marking multiple symbols as sequences
      if (/^[a-z0-9]+$/.test(chunk)) {
        detectedSeqs.push(password.slice(i, i + threshold));
      }
    }
  }

  return Array.from(new Set(detectedSeqs));
}

export function checkRepeatingPatterns(password, threshold = 3) {
  const pwdLower = password.toLowerCase();
  const detectedRepeats = [];

  // Single character repeats (e.g. "aaa")
  for (let i = 0; i <= pwdLower.length - threshold; i++) {
    const chunk = pwdLower.slice(i, i + threshold);
    const uniqueChars = new Set(chunk);
    if (uniqueChars.size === 1) {
      detectedRepeats.push(password.slice(i, i + threshold));
    }
  }

  // Repeating blocks (e.g. "abcabc") using regex
  // Match a pattern of 2 to 4 characters that repeats immediately
  const repeatRegex = /([a-z0-9]{2,4})\1/g;
  let match;
  while ((match = repeatRegex.exec(pwdLower)) !== null) {
    const fullMatch = match[0];
    const index = match.index;
    detectedRepeats.push(password.slice(index, index + fullMatch.length));
  }

  return Array.from(new Set(detectedRepeats));
}

export function checkYearPatterns(password) {
  const detectedYears = [];
  // Match 4-digit numbers starting with 19 or 20, not preceded or followed by other digits
  const yearRegex = /(?<!\d)(19\d{2}|20[0-2]\d)(?!\d)/g;
  let match;
  while ((match = yearRegex.exec(password)) !== null) {
    detectedYears.push(match[1]);
  }
  return Array.from(new Set(detectedYears));
}

export function analyzePatterns(password) {
  const walks = checkKeyboardWalks(password);
  const sequences = checkCharacterSequences(password);
  const repeats = checkRepeatingPatterns(password);
  const years = checkYearPatterns(password);

  const hasIssues = walks.length > 0 || sequences.length > 0 || repeats.length > 0 || years.length > 0;

  return {
    has_patterns: hasIssues,
    keyboard_walks: walks,
    sequences: sequences,
    repeats: repeats,
    years: years
  };
}
