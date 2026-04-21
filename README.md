# Rhombus AI — Automated Test Suite

This repository contains an automated test suite for the Rhombus AI web application (https://rhombusai.com). It covers UI automation, API-level testing, and data validation to verify the full AI pipeline workflow — from file upload to cleaned CSV output.

## Tech Stack

- **Part 1 – UI Automation:** Playwright (JavaScript)
- **Part 2 – API Tests:** Jest + Axios (JavaScript) + Playwright (for session extraction)
- **Part 3 – Data Validation:** Python + pandas

## Prerequisites

- Node.js v18+
- Python 3.10+
- Git

## Setup

### Part 1 – UI Tests
```bash
cd ui-tests
npm install
npx playwright install chromium
```

### Part 2 – API Tests
```bash
cd api-tests
npm install
npx playwright install chromium
```

### Part 3 – Data Validation
```bash
pip install pandas
```

## Environment Variables

Create a `.env` file in the root of the repository:
TEST_EMAIL=your@email.com
TEST_PASSWORD=yourpassword

## Running the Tests

### Part 1 – UI Automation
```bash
npx playwright test ui-tests/tests/login.spec.js --headed
```

### Part 2 – API Tests
```bash
cd api-tests
npm test
```

### Part 3 – Data Validation
```bash
python data-validation/validate.py
```

> Note: Run the UI test first — it generates `output.csv` which the validation script needs.

## QA Findings

**Finding 1 – Unnamed upload button**
The `+` upload button has no accessible name or `data-testid`, forcing testers to use fragile positional selectors like `.nth(2)`. Recommendation: add `aria-label="Upload file"` or `data-testid="upload-button"`.

**Finding 2 – Automation fails when existing projects are present**
The upload flow breaks when any projects already exist in the dashboard. The app behaves differently when projects exist, blocking the upload interaction. Recommendation: ensure consistent UI behaviour regardless of project count.

**Finding 3 – Onboarding modal appears at unpredictable times**
The "Start Building" modal appears at different points during the session — sometimes immediately after login, sometimes after file upload. Recommendation: trigger the modal at a consistent, predictable point in the user journey.

**Finding 4 – No `data-testid` on critical UI elements**
Key elements like the upload button lack test IDs, making automation unnecessarily brittle. The `Run Pipeline` button was the exception — its `data-testid="run-pipeline"` worked perfectly.

**Finding 5 – Upload endpoint allows unauthenticated access**
`POST https://api.rhombusai.com/api/dataset/datasets/temp/upload` returns 200 without any Authorization header. Anyone can upload files without an account. This is a security vulnerability — the endpoint should require authentication.

**Finding 6 – AI did not clean invalid phone number**
The input CSV contained `not-a-phone` in the Phone Number column. Despite the prompt instructing the AI to infer column data types and blank invalid values, the AI left this value unchanged. This indicates incomplete prompt adherence for non-email columns.

## Known Limitations

- The `+` upload button is selected using `.nth(2)` — a fragile positional selector that may break if the page layout changes.
- The UI test requires no existing projects in the Rhombus AI dashboard before running.
- Pipeline timeout is set to 2 minutes — may need increasing for larger files.
- The test uses a hardcoded node test ID `rf__node-llm_node_1` which may change between pipeline runs.
- `output.csv` is not committed to the repository — it is generated fresh by running the UI test.

## Future Improvements

- Add phone number validation to the data validation script — flag values containing no digits.
- Improve prompt engineering to ensure the AI correctly blanks invalid phone numbers.
- Replace positional selector `nth(2)` with a stable selector once Rhombus adds a proper label to the upload button.
- Add pipeline execution status API test once a stable endpoint is identified.

## Demo Video
