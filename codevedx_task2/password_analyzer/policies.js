export function checkPolicyCompliance(password) {
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  // Corporate Policy Criteria
  const corpMinLength = length >= 8;
  const corpComplexity = hasLower && hasUpper && hasDigit && hasSpecial;
  const corpPassed = corpMinLength && corpComplexity;

  // NIST SP 800-63B Guidelines Criteria
  const nistMinLength = length >= 8;
  const nistRecommendedLength = length >= 12;
  const nistPassed = nistMinLength; // Simplistic base check

  // Gather reasons for failures
  const failures = [];
  if (length < 8) {
    failures.push("Too short (less than 8 characters)");
  }
  if (!hasLower) {
    failures.push("Missing lowercase letters");
  }
  if (!hasUpper) {
    failures.push("Missing uppercase letters");
  }
  if (!hasDigit) {
    failures.push("Missing numbers");
  }
  if (!hasSpecial) {
    failures.push("Missing special characters/symbols");
  }

  return {
    length,
    corp_policy: {
      passed: corpPassed,
      min_length_ok: corpMinLength,
      complexity_ok: corpComplexity
    },
    nist_policy: {
      passed: nistPassed,
      min_length_ok: nistMinLength,
      recommended_length_ok: nistRecommendedLength
    },
    failures
  };
}
