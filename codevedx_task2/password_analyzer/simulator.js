import crypto from 'crypto';
import { COMMON_PASSWORDS, generateMutations } from './wordlist.js';

// Hardware profiles for cracking estimation
const HARDWARE_PROFILES = {
  "Consumer CPU (Single-core)": {
    rate: 1e7, // 10 Million hashes/sec
    description: "Standard modern laptop/desktop processor core"
  },
  "High-end Gaming GPU": {
    rate: 1e10, // 10 Billion hashes/sec
    description: "Dedicated graphics card (e.g. RTX 4090 class)"
  },
  "Distributed Botnet / Supercomputer": {
    rate: 1e13, // 10 Trillion hashes/sec
    description: "Malicious network or nation-state infrastructure"
  }
};

export function formatDuration(seconds) {
  if (seconds === 0) return "Instant";
  if (seconds < 0.001) return "Microseconds";
  if (seconds < 1) return `${seconds.toFixed(3)} Seconds`;

  const units = [
    { name: "Seconds", limit: 60 },
    { name: "Minutes", limit: 60 },
    { name: "Hours", limit: 24 },
    { name: "Days", limit: 365 },
    { name: "Years", limit: 100 },
    { name: "Centuries", limit: Infinity }
  ];

  let val = seconds;
  for (const unit of units) {
    if (val < unit.limit || unit.name === "Centuries") {
      if (unit.name === "Years" && val > 1e6) {
        return `${val.toExponential(1)} Years`;
      }
      return `${Math.round(val)} ${unit.name}`;
    }
    val /= unit.limit;
  }
  return "Centuries";
}

export function estimateBruteForceTimes(password) {
  const length = password.length;
  if (length === 0) return {};

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSpecial) poolSize += 33;

  const totalCombinations = Math.pow(poolSize, length);
  const averageAttempts = totalCombinations / 2;

  const estimates = {};
  for (const [name, profile] of Object.entries(HARDWARE_PROFILES)) {
    const seconds = averageAttempts / profile.rate;
    estimates[name] = {
      rate_desc: `${profile.rate.toExponential(0)} guesses/sec`,
      time_seconds: seconds,
      readable_time: formatDuration(seconds)
    };
  }

  return {
    combinations: totalCombinations,
    pool_size: poolSize,
    estimates
  };
}

export function simulateSha256Crack(targetHash) {
  const startTime = process.hrtime.bigint();
  const cleanedHash = targetHash.trim().toLowerCase();

  let checkedCount = 0;

  // Direct check
  for (const word of COMMON_PASSWORDS) {
    checkedCount++;
    const hash = crypto.createHash('sha256').update(word).digest('hex');
    if (hash === cleanedHash) {
      const endTime = process.hrtime.bigint();
      const elapsedSeconds = Number(endTime - startTime) / 1e9;
      return {
        success: true,
        plaintext: word,
        checked_count: checkedCount,
        elapsed_seconds: elapsedSeconds,
        method: "Direct Dictionary Match"
      };
    }
  }

  // Mutation check
  for (const word of COMMON_PASSWORDS) {
    const mutations = generateMutations(word);
    for (const mut of mutations) {
      checkedCount++;
      const hash = crypto.createHash('sha256').update(mut).digest('hex');
      if (hash === cleanedHash) {
        const endTime = process.hrtime.bigint();
        const elapsedSeconds = Number(endTime - startTime) / 1e9;
        return {
          success: true,
          plaintext: mut,
          checked_count: checkedCount,
          elapsed_seconds: elapsedSeconds,
          method: `Mutation of base word '${word}'`
        };
      }
    }
  }

  const endTime = process.hrtime.bigint();
  const elapsedSeconds = Number(endTime - startTime) / 1e9;
  return {
    success: false,
    plaintext: null,
    checked_count: checkedCount,
    elapsed_seconds: elapsedSeconds,
    method: "Dictionary & Mutation Search Exhausted"
  };
}
