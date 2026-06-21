import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { calculateEntropy, getStrengthRating } from './password_analyzer/entropy.js';
import { analyzePatterns } from './password_analyzer/patterns.js';
import { checkPolicyCompliance } from './password_analyzer/policies.js';
import { checkWordlistVulnerability, COMMON_PASSWORDS, generateMutations } from './password_analyzer/wordlist.js';
import { estimateBruteForceTimes } from './password_analyzer/simulator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve static frontend files from the workspace root directory
app.use(express.static(__dirname));

/**
 * API to analyze a single password
 */
app.post('/api/analyze', (req, res) => {
  const { password } = req.body;
  if (password === undefined) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const entropy = calculateEntropy(password);
  const strength = getStrengthRating(entropy);
  const patterns = analyzePatterns(password);
  const policy = checkPolicyCompliance(password);
  const dictionary = checkWordlistVulnerability(password);
  const brute_force = estimateBruteForceTimes(password);

  res.json({
    password,
    entropy,
    strength,
    patterns,
    policy,
    dictionary,
    brute_force
  });
});

/**
 * API to perform batch analysis on multiple passwords
 */
app.post('/api/batch', (req, res) => {
  const { passwords } = req.body;
  if (!Array.isArray(passwords)) {
    return res.status(400).json({ error: 'Passwords array is required' });
  }

  let strong = 0;
  let medium = 0;
  let weak = 0;
  const results = [];

  for (const pwd of passwords) {
    const entropy = calculateEntropy(pwd);
    const rating = getStrengthRating(entropy);
    const policyResult = checkPolicyCompliance(pwd);
    const patternResult = analyzePatterns(pwd);
    const wordlistResult = checkWordlistVulnerability(pwd);

    if (rating.level === "Very Weak" || rating.level === "Weak") {
      weak++;
    } else if (rating.level === "Medium") {
      medium++;
    } else {
      strong++;
    }

    results.push({
      password: pwd,
      entropy,
      strength: rating,
      policy: policyResult,
      patterns: patternResult,
      dictionary: wordlistResult
    });
  }

  res.json({
    summary: {
      total: passwords.length,
      strong,
      medium,
      weak
    },
    results
  });
});

/**
 * API to simulate offline dictionary hash cracking using Server-Sent Events (SSE)
 */
app.get('/api/crack', async (req, res) => {
  const { hash } = req.query;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!hash) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'No target hash provided.' })}\n\n`);
    res.end();
    return;
  }

  const cleanedHash = hash.trim().toLowerCase();
  
  if (cleanedHash.length !== 64 || !/^[0-9a-fA-F]+$/.test(cleanedHash)) {
    res.write(`data: ${JSON.stringify({ type: 'log', message: '[!] Warning: That does not look like a valid 64-character SHA-256 hex hash.' })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ type: 'log', message: `[#] Starting cracking simulation for: ${cleanedHash}` })}\n\n`);
  
  let checkedCount = 0;
  let found = null;
  let method = "";
  const startTime = process.hrtime.bigint();

  // Phase 1: Direct Dictionary Match
  for (let i = 0; i < COMMON_PASSWORDS.length; i++) {
    const word = COMMON_PASSWORDS[i];
    checkedCount++;

    if (checkedCount % 5 === 0) {
      res.write(`data: ${JSON.stringify({ type: 'log', message: `[*] Checked ${checkedCount} entries...` })}\n\n`);
      // Simulate real-time decryption latency for visualization
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    const currentHash = crypto.createHash('sha256').update(word).digest('hex');
    if (currentHash === cleanedHash) {
      found = word;
      method = "Direct Dictionary Match";
      break;
    }
  }

  // Phase 2: Mutation dictionary check if not found
  if (!found) {
    res.write(`data: ${JSON.stringify({ type: 'log', message: `[*] Base dictionary exhausted. Initiating common mutation checks...` })}\n\n`);
    
    for (const word of COMMON_PASSWORDS) {
      const mutations = generateMutations(word);
      for (const mut of mutations) {
        checkedCount++;

        if (checkedCount % 15 === 0) {
          res.write(`data: ${JSON.stringify({ type: 'log', message: `[*] Attempted ${checkedCount} permutations (leet/suffixes)...` })}\n\n`);
          // Simulate real-time decryption latency for visualization
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        const currentHash = crypto.createHash('sha256').update(mut).digest('hex');
        if (currentHash === cleanedHash) {
          found = mut;
          method = `Mutation of base word '${word}'`;
          break;
        }
      }
      if (found) break;
    }
  }

  const endTime = process.hrtime.bigint();
  const elapsedSeconds = Number(endTime - startTime) / 1e9;

  if (found) {
    res.write(`data: ${JSON.stringify({
      type: 'result',
      success: true,
      plaintext: found,
      method,
      elapsed_seconds: elapsedSeconds,
      checked_count: checkedCount
    })}\n\n`);
  } else {
    res.write(`data: ${JSON.stringify({
      type: 'result',
      success: false,
      plaintext: null,
      method: "Dictionary & Mutation Search Exhausted",
      elapsed_seconds: elapsedSeconds,
      checked_count: checkedCount
    })}\n\n`);
  }

  res.end();
});

// Serve index.html on all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
