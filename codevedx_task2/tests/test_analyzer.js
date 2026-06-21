import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';

import { calculateEntropy, getStrengthRating } from '../password_analyzer/entropy.js';
import { checkKeyboardWalks, checkCharacterSequences, checkRepeatingPatterns, checkYearPatterns } from '../password_analyzer/patterns.js';
import { checkPolicyCompliance } from '../password_analyzer/policies.js';
import { checkWordlistVulnerability } from '../password_analyzer/wordlist.js';
import { estimateBruteForceTimes, simulateSha256Crack } from '../password_analyzer/simulator.js';

test('Entropy Calculations', () => {
  assert.strictEqual(calculateEntropy(""), 0);
  // 'abcd' has lowercase characters only (pool size = 26).
  // Entropy = 4 * log2(26) = ~18.80
  assert.strictEqual(calculateEntropy("abcd"), 18.80);
  // 'AbCd' has upper and lower (pool size = 52).
  // Entropy = 4 * log2(52) = ~22.80
  assert.strictEqual(calculateEntropy("AbCd"), 22.80);
});

test('Strength Ratings', () => {
  const ratingWeak = getStrengthRating(10.0);
  assert.strictEqual(ratingWeak.level, "Very Weak");

  const ratingStrong = getStrengthRating(95.0);
  assert.strictEqual(ratingStrong.level, "Very Strong");
});

test('Keyboard Walks Detection', () => {
  const walks = checkKeyboardWalks("qwerty");
  assert.ok(walks.map(w => w.toLowerCase()).includes("qwe"));

  const noWalks = checkKeyboardWalks("k7!xP2_");
  assert.strictEqual(noWalks.length, 0);
});

test('Character Sequences Detection', () => {
  const seqs = checkCharacterSequences("abc123");
  assert.ok(seqs.length >= 2); // Should find 'abc' and '123'
});

test('Repeating Patterns Detection', () => {
  const repeatsSingle = checkRepeatingPatterns("aaaa");
  assert.ok(repeatsSingle.length > 0);

  const repeatsBlock = checkRepeatingPatterns("abcabc");
  assert.ok(repeatsBlock.length > 0);
});

test('Year Pattern Detection', () => {
  const years = checkYearPatterns("password2024");
  assert.ok(years.includes("2024"));
});

test('Compliance Policy Verification', () => {
  const weakPolicy = checkPolicyCompliance("Short1!");
  assert.strictEqual(weakPolicy.corp_policy.passed, false); // Length < 8
  assert.strictEqual(weakPolicy.failures.length, 1);

  const strongPolicy = checkPolicyCompliance("ExcellentPassword2026!");
  assert.strictEqual(strongPolicy.corp_policy.passed, true);
  assert.strictEqual(strongPolicy.failures.length, 0);
});

test('Wordlist & Mutation Vulnerability Check', () => {
  // Direct check
  const direct = checkWordlistVulnerability("123456");
  assert.strictEqual(direct.vulnerable, true);

  // Mutation check
  const mut = checkWordlistVulnerability("admin123");
  assert.strictEqual(mut.vulnerable, true);
});

test('Brute Force Duration Estimations', () => {
  const estimatesObj = estimateBruteForceTimes("abc");
  assert.ok("Consumer CPU (Single-core)" in estimatesObj.estimates);
  assert.strictEqual(estimatesObj.pool_size, 26);
});

test('SHA-256 Offline Hashing Crack Simulator', () => {
  // Hash of "password"
  const hash = crypto.createHash('sha256').update("password").digest('hex');
  const crackRes = simulateSha256Crack(hash);
  assert.strictEqual(crackRes.success, true);
  assert.strictEqual(crackRes.plaintext, "password");

  // Hash of something not in lists
  const complexHash = crypto.createHash('sha256').update("L9!qXz4#p109w").digest('hex');
  const crackResFailed = simulateSha256Crack(complexHash);
  assert.strictEqual(crackResFailed.success, false);
});
