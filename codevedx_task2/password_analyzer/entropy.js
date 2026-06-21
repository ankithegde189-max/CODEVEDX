/**
 * Calculates the Shannon/Pool entropy of a password.
 * Entropy H = L * log2(R)
 * L = length of password
 * R = size of character pool representing classes present in the password.
 */
export function calculateEntropy(password) {
  const length = password.length;
  if (length === 0) return 0.0;

  let hasLower = false;
  let hasUpper = false;
  let hasDigit = false;
  let hasSpecial = false;

  for (let i = 0; i < length; i++) {
    const char = password[i];
    if (/[a-z]/.test(char)) {
      hasLower = true;
    } else if (/[A-Z]/.test(char)) {
      hasUpper = true;
    } else if (/[0-9]/.test(char)) {
      hasDigit = true;
    } else {
      hasSpecial = true;
    }
  }

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSpecial) poolSize += 33; // standard printable ASCII symbols and space

  if (poolSize === 0) return 0.0;

  const entropy = length * Math.log2(poolSize);
  return parseFloat(entropy.toFixed(2));
}

/**
 * Classifies entropy into a standard rating category.
 */
export function getStrengthRating(entropy) {
  if (entropy < 28) {
    return {
      level: "Very Weak",
      color: "red",
      description: "Very vulnerable. Easily compromised via basic automated tools."
    };
  } else if (entropy < 36) {
    return {
      level: "Weak",
      color: "lightred",
      description: "Vulnerable to simple dictionary attacks and short brute-force runs."
    };
  } else if (entropy < 60) {
    return {
      level: "Medium",
      color: "yellow",
      description: "Adequate for low-risk accounts, but susceptible to dedicated offline attacks."
    };
  } else if (entropy < 80) {
    return {
      level: "Strong",
      color: "green",
      description: "Highly secure. Very resistant to current offline/online attacks."
    };
  } else {
    return {
      level: "Very Strong",
      color: "cyan",
      description: "Excellent entropy. Virtually uncrackable with modern hardware."
    };
  }
}
