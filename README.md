# PaisaTrack

A responsive personal finance dashboard built with HTML, CSS and vanilla JavaScript.

## Features
- Overview of total balance, current-month income, expenses and savings
- Add and delete income/expense transactions
- Category and date tracking
- Monthly spending budget with progress indicator
- Savings goals with progress tracking
- Six-month cash-flow chart
- LocalStorage persistence
- Responsive desktop and mobile layout
- Indian Rupee (INR) formatting

## Run locally
1. Download or clone this repository.
2. Open `index.html` in a modern browser.

No build tools, server, API key or dependencies are required. Google Fonts are loaded from the web; the system falls back to sans-serif fonts if unavailable.

## Publish with GitHub Pages
1. Create a GitHub account at https://github.com if you do not already have one.
2. Click **New repository** and name it `PaisaTrack`.
3. Choose **Public** (or Private if you prefer; GitHub Pages availability depends on your plan/settings).
4. Upload `index.html`, `style.css`, `app.js`, and `README.md` to the repository root.
5. Open **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select branch `main` and folder `/ (root)`, then click **Save**.
8. Wait for GitHub Pages to publish. Your site URL will look like:
   `https://YOUR-USERNAME.github.io/PaisaTrack/`

## Data and privacy
Transactions, budget and savings goals are stored in the browser's LocalStorage on the device/browser where the site is used. They are not synced to GitHub or another device. Clearing browser site data can remove locally stored entries. This starter project is not a bank connection or a secure financial record system. Do not enter bank passwords, card numbers or other sensitive information.

## Reset demo data
Open browser developer tools → Console and run:
```js
localStorage.removeItem("paisatrack-v1");
location.reload();
```

## Project structure
```text
PaisaTrack/
├── index.html
├── style.css
├── app.js
└── README.md
```
