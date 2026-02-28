# Smart English Quiz App (MVP Scaffold)

This repository now contains a runnable MVP scaffold for the Smart English Quiz App.

## What is included
- Node.js HTTP server (no external dependencies)
- Basic Teacher panel features:
  - AI-style question generation from lesson text (mock logic)
  - Question bank listing
  - Quiz creation from generated questions
- Basic Student flow:
  - Demo attempt submission
- Basic analytics overview cards

## Prerequisites
- Node.js 18+

## Run locally
```bash
npm start
```

The app will run at:
- http://localhost:3000

## API quick checks
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/questions
curl http://localhost:3000/api/analytics/overview
```

## Notes
- Data is kept in-memory for demo purposes (resets on restart).
- This is a scaffold to make the app runnable and easy to extend into a production implementation.
