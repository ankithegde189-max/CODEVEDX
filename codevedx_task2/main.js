import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { calculateEntropy, getStrengthRating } from './password_analyzer/entropy.js';
import { analyzePatterns } from './password_analyzer/patterns.js';
import { checkPolicyCompliance } from './password_analyzer/policies.js';
import { checkWordlistVulnerability } from './password_analyzer/wordlist.js';
import { estimateBruteForceTimes, simulateSha256Crack } from './password_analyzer/simulator.js';

// ANSI escape codes for native colored terminal outputs
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  lightred: "\x1b[91m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m"
};

const BANNER = `
${colors.cyan}${colors.bright}=============================================================
    PASSWORD SECURITY & CRACKING ANALYSIS TOOL
    (Ethical Security Research & Education)
=============================================================${colors.reset}
`;

function printSeparator() {
  console.log(`${colors.white}-------------------------------------------------------------${colors.reset}`);
}

function promptQuestion(rl, query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function analyzeSinglePassword(password, verbose = true) {
  const entropy = calculateEntropy(password);
  const strength = getStrengthRating(entropy);
  const patterns = analyzePatterns(password);
  const policy = checkPolicyCompliance(password);
  const dictionaryVuln = checkWordlistVulnerability(password);
  const bruteForce = estimateBruteForceTimes(password);

  if (verbose) {
    console.log(`\n${colors.yellow}${colors.bright}[*] PASSWORD ANALYSIS FOR: ${colors.white}${password}${colors.reset}`);
    printSeparator();

    // Entropy & Strength Rating
    const ratingColor = colors[strength.color] || colors.white;
    console.log(`Entropy Score     : ${ratingColor}${entropy} bits${colors.reset}`);
    console.log(`Strength Rating   : ${ratingColor}${colors.bright}${strength.level}${colors.reset}`);
    console.log(`Details           : ${strength.description}`);
    printSeparator();

    // Wordlist vulnerability check
    if (dictionaryVuln.vulnerable) {
      console.log(`Dictionary Check  : ${colors.red}VULNERABLE / DANGEROUS!${colors.reset}`);
      console.log(`Reason            : ${dictionaryVuln.reason}`);
    } else {
      console.log(`Dictionary Check  : ${colors.green}Passed${colors.reset} (Not found in common password lists)`);
    }
    printSeparator();

    // Pattern warnings
    console.log(`Pattern Analysis  :`);
    if (patterns.has_patterns) {
      if (patterns.keyboard_walks.length > 0) {
        console.log(`  - ${colors.yellow}Warning${colors.reset}: Keyboard walk detected: [${patterns.keyboard_walks.join(", ")}]`);
      }
      if (patterns.sequences.length > 0) {
        console.log(`  - ${colors.yellow}Warning${colors.reset}: Sequential characters detected: [${patterns.sequences.join(", ")}]`);
      }
      if (patterns.repeats.length > 0) {
        console.log(`  - ${colors.yellow}Warning${colors.reset}: Repeating/repeating-block characters: [${patterns.repeats.join(", ")}]`);
      }
      if (patterns.years.length > 0) {
        console.log(`  - ${colors.yellow}Warning${colors.reset}: Year structure detected: [${patterns.years.join(", ")}]`);
      }
    } else {
      console.log(`  - ${colors.green}No obvious keyboard walks, sequences, or simple repetitions detected.${colors.reset}`);
    }
    printSeparator();

    // Compliance policies
    console.log(`Policy Compliance :`);
    const corpStatus = policy.corp_policy.passed ? `${colors.green}Compliant` : `${colors.red}Non-Compliant`;
    const nistStatus = policy.nist_policy.passed ? `${colors.green}Compliant` : `${colors.red}Non-Compliant`;
    console.log(`  - Standard Corporate Rule (Length >= 8, Mixed Case, Digits, Symbols): ${corpStatus}${colors.reset}`);
    console.log(`  - NIST SP 800-63B Basic (Minimum Length >= 8): ${nistStatus}${colors.reset}`);
    if (policy.failures.length > 0) {
      console.log(`  - ${colors.lightred}Policy Failures: [${policy.failures.join(", ")}]${colors.reset}`);
    }
    printSeparator();

    // Estimated Brute force Cracking times
    console.log(`Brute-Force Estimates (Mathematical Crack Expectation):`);
    console.log(`  - Possible Combinations: ${colors.cyan}${bruteForce.combinations.toExponential(2)}${colors.reset} (Pool size: ${bruteForce.pool_size})`);
    for (const [hwName, details] of Object.entries(bruteForce.estimates)) {
      const timeStr = details.readable_time;
      const timeColor = (timeStr.includes("Years") || timeStr.includes("Centuries")) ? colors.green : colors.red;
      console.log(`  - ${hwName.padEnd(36)} @ ${details.rate_desc.padEnd(20)}: ${timeColor}${timeStr}${colors.reset}`);
    }
    printSeparator();
  }

  return {
    password,
    entropy,
    strength,
    patterns,
    policy,
    dictionary: dictionaryVuln,
    brute_force: bruteForce
  };
}

async function runDictionaryCrackSimulation(rl) {
  console.log(`\n${colors.yellow}[*] SHA-256 Offline Dictionary Crack Simulator${colors.reset}`);
  console.log("This mode demonstrates how hackers use precomputed hashes or dictionary attacks");
  console.log("to quickly crack unsalted hashes of weak passwords offline.\n");

  const targetHash = await promptQuestion(rl, `${colors.cyan}Enter SHA-256 Hash to crack: ${colors.reset}`);
  if (!targetHash.trim()) {
    console.log(`${colors.red}Error: Hash cannot be empty.${colors.reset}`);
    return;
  }

  // Hash length validation (SHA-256 has 64 characters)
  const cleanedHash = targetHash.trim();
  if (cleanedHash.length !== 64 || !/^[0-9a-fA-F]+$/.test(cleanedHash)) {
    console.log(`${colors.red}Warning: That does not look like a valid 64-character SHA-256 hex hash.${colors.reset}`);
    const confirm = await promptQuestion(rl, "Continue anyway? (y/n): ");
    if (confirm.trim().toLowerCase() !== 'y') {
      return;
    }
  }

  console.log(`\n${colors.yellow}[*] Cracking hash: ${cleanedHash}...${colors.reset}`);
  console.log("[*] Running local dictionary check and generating mutations...");

  const result = simulateSha256Crack(cleanedHash);

  printSeparator();
  if (result.success) {
    console.log(`${colors.green}${colors.bright}[+] CRACK SUCCESSFUL!${colors.reset}`);
    console.log(`Plaintext Match: ${colors.green}${colors.bright}${result.plaintext}${colors.reset}`);
    console.log(`Method Used    : ${result.method}`);
    console.log(`Time Taken     : ${result.elapsed_seconds.toFixed(6)} Seconds`);
    console.log(`Hashes Tried   : ${result.checked_count}`);
  } else {
    console.log(`${colors.red}[-] CRACK FAILED.${colors.reset}`);
    console.log(`Tested ${result.checked_count} permutations in ${result.elapsed_seconds.toFixed(6)} seconds.`);
    console.log("Reason: Hash is not based on top common password vectors or simple mutations.");
  }
  printSeparator();
}

async function batchAnalyzeFile(rl) {
  console.log(`\n${colors.yellow}[*] Batch Password Analyzer${colors.reset}`);
  const filepath = await promptQuestion(rl, `${colors.cyan}Enter path to text file containing passwords (one per line): ${colors.reset}`);
  const cleanPath = filepath.trim();

  if (!fs.existsSync(cleanPath)) {
    console.log(`${colors.red}Error: File not found at ${cleanPath}${colors.reset}`);
    return;
  }

  let content;
  try {
    content = fs.readFileSync(cleanPath, 'utf-8');
  } catch (err) {
    console.log(`${colors.red}Error reading file: ${err.message}${colors.reset}`);
    return;
  }

  const passwords = content.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

  if (passwords.length === 0) {
    console.log(`${colors.yellow}Warning: Selected file is empty.${colors.reset}`);
    return;
  }

  console.log(`\n[*] Found ${passwords.length} passwords. Analyzing...`);

  const results = [];
  let weakCount = 0;
  let strongCount = 0;
  let mediumCount = 0;

  for (const pwd of passwords) {
    const res = analyzeSinglePassword(pwd, false);
    results.push(res);

    const level = res.strength.level;
    if (level === "Very Weak" || level === "Weak") {
      weakCount++;
    } else if (level === "Medium") {
      mediumCount++;
    } else {
      strongCount++;
    }
  }

  // Print summary
  printSeparator();
  console.log(`${colors.cyan}${colors.bright}BATCH REPORT SUMMARY${colors.reset}`);
  printSeparator();
  console.log(`Total Passwords Analyzed : ${passwords.length}`);
  console.log(`Strong / Very Strong     : ${colors.green}${strongCount}${colors.reset}`);
  console.log(`Medium Strength          : ${colors.yellow}${mediumCount}${colors.reset}`);
  console.log(`Weak / Very Weak         : ${colors.red}${weakCount}${colors.reset}`);
  printSeparator();

  // Save report option
  const saveOpt = await promptQuestion(rl, "Export results to JSON report? (y/n): ");
  if (saveOpt.trim().toLowerCase() === 'y') {
    const outPath = "password_report.json";
    try {
      fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
      console.log(`${colors.green}[+] Report exported successfully to: ${path.resolve(outPath)}${colors.reset}`);
    } catch (err) {
      console.log(`${colors.red}Failed to export report: ${err.message}${colors.reset}`);
    }
  }
}

function showEducationalInfo() {
  console.log(`
${colors.cyan}${colors.bright}=============================================================
         PASSWORD SECURITY BEST PRACTICES
=============================================================${colors.reset}
1. Length is King:
   A longer password (12+ characters) creates exponentially more 
   combinations than a shorter one, even if the shorter one uses 
   symbols.

2. Avoid Human Patterns:
   Hackers build patterns into cracking algorithms: keyboard walks (qwerty), 
   dictionary words with standard numbers added at the end (Password123!), 
   and substitutions (P@ssw0rd) are checked instantly.

3. Use Password Managers & MFA:
   Unique passwords for every service prevent credential stuffing attacks.
   Always enable Multi-Factor Authentication (MFA) to protect logins 
   if a password is breached.

4. Hashing & Salts:
   Store passwords using strong, adaptive hashing functions like 
   bcrypt, Argon2, or PBKDF2 with unique cryptographic salts. Avoid 
   storing plain MD5, SHA-1, or unsalted SHA-256.
-------------------------------------------------------------
`);
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    console.log(BANNER);
    console.log("Choose an option:");
    console.log("1. Analyze a single password");
    console.log("2. Simulate dictionary hash cracking (SHA-256)");
    console.log("3. Batch analyze passwords from file");
    console.log("4. Read security guidelines & best practices");
    console.log("5. Exit");

    const choice = await promptQuestion(rl, `\n${colors.cyan}Selection (1-5): ${colors.reset}`);

    if (choice.trim() === "1") {
      const pwd = await promptQuestion(rl, `${colors.cyan}Enter password to analyze: ${colors.reset}`);
      analyzeSinglePassword(pwd);
    } else if (choice.trim() === "2") {
      await runDictionaryCrackSimulation(rl);
    } else if (choice.trim() === "3") {
      await batchAnalyzeFile(rl);
    } else if (choice.trim() === "4") {
      showEducationalInfo();
    } else if (choice.trim() === "5") {
      console.log(`${colors.green}Exiting. Stay secure!${colors.reset}`);
      rl.close();
      break;
    } else {
      console.log(`${colors.red}Invalid option. Please enter a number 1-5.${colors.reset}`);
    }

    await promptQuestion(rl, `\n${colors.white}Press Enter to return to menu...${colors.reset}`);
    // Clear console screen
    console.clear();
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
