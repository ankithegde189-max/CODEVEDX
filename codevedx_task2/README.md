# Password Security & Cracking Analysis

Password Security and Cracking Analysis is a modular, ethically safe command-line tool focused on evaluating password strength, detecting common human-centric weaknesses, estimating theoretical brute force duration across multiple hardware profiles, and simulating offline dictionary attack cracking.

This tool highlights the critical importance of secure authentication policies, long passwords, and strong cryptographic storage parameters (salts & slow hashing algorithms).

---

## Features

1. **Entropy & Strength Calculation**: Uses Shannon/Pool entropy estimation to calculate password complexity and strength categories (Very Weak, Weak, Medium, Strong, Very Strong).
2. **Human Pattern Detection**: Checks for obvious visual and structural patterns:
   - Horizontal QWERTY keyboard walks (e.g. `qwerty`, `asdfgh`)
   - Sequential letter/number sequences (e.g. `abc`, `123`)
   - Repeating strings or sub-strings (e.g. `aaaa`, `abcabc`)
   - Common year structures (e.g. `1998`, `2024`)
3. **NIST & Corporate Policy Auditing**: Checks compliance against traditional enterprise policies (length + casing + digit + special symbols) and modern NIST SP 800-63B standards (length-focused, composition-free).
4. **Brute Force Duration Estimator**: Estimates average computational cracking duration across:
   - Consumer CPU Single-Core (10M guesses/sec)
   - Gaming GPU (10B guesses/sec)
   - Supercomputer/Botnet (10T guesses/sec)
5. **Offline Dictionary Hashing Simulator**: Simulates matching user-provided SHA-256 hashes against a dictionary list of common passwords and their dynamic mutations (leetspeak, common suffixes, case modifications).

---

## Project Structure

```
c:\codevedx_task2\
├── README.md                  # Project documentation and guide
├── requirements.txt           # Python dependencies (colorama)
├── password_analyzer/
│   ├── __init__.py
│   ├── entropy.py             # Entropy scoring & rating classification
│   ├── patterns.py            # Sequence, walk, repeat & year pattern check
│   ├── policies.py            # Compliance policy verification (NIST)
│   ├── simulator.py           # Mathematical brute-force estimates & hash cracking
│   └── wordlist.py            # Embedded weak password vocabulary & mutation algorithms
├── tests/
│   ├── __init__.py
│   └── test_analyzer.py       # Automated testing suite
└── main.py                    # Main interactive console launcher
```

---

## Installation & Setup

1. **Clone/Navigate** to the repository folder.
2. **Install Dependencies** (specifically `colorama` for beautiful colored terminal output):
   ```bash
   pip install -r requirements.txt
   ```

---

## Usage

### Run the Interactive CLI Dashboard
Start the program menu by running:
```bash
py main.py
```
*(Use `python main.py` if the `py` launcher is not set up on your machine.)*

### Run Unit Tests
To verify all operations are running correctly:
```bash
py -m unittest discover -s tests
```
*(Use `python -m unittest discover -s tests` if needed.)*
