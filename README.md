# WorldGuesser Dashboard

A modern, interactive dashboard for visualizing competitive WorldGuesser game data.

## Features

- **Player Rankings**: Compare total points across all players
- **Win Rate Analysis**: See who wins most frequently
- **Performance Trends**: Track performance over time
- **Country Performance**: Analyze which countries yield the best scores
- **Detailed Statistics**: Comprehensive player stats table
- **Interactive Charts**: Beautiful visualizations using Recharts

## Tech Stack

- React 18
- Vite
- TailwindCSS
- Recharts
- Lucide React (icons)

## Data Setup

The dashboard now scrapes data directly from the frontend using your WorldGuessr secret and stores the dataset in browser cookies.

The stored data follows this structure:

```json
[
  {
    "gameId": "party_xxx",
    "gameType": "private_multiplayer",
    "startedAt": "2026-03-12T13:12:56.901Z",
    "endedAt": "2026-03-12T13:17:07.739Z",
    "userStats": {
      "totalPoints": 14371,
      "finalRank": 2
    },
    "result": {
      "winner": "playerId",
      "isDraw": false
    },
    "multiplayer": {
      "playerCount": 3
    },
    "game": {
      "rounds": [
        {
          "roundNumber": 1,
          "location": {
            "lat": 16.471216,
            "long": 99.531307,
            "country": "TH"
          },
          "allGuesses": [
            {
              "playerId": "xxx",
              "username": "PlayerName",
              "guessLat": 22.767632,
              "guessLong": 85.759277,
              "points": 2244,
              "timeTaken": 15
            }
          ]
        }
      ]
    }
  }
]
```

### How to Load Data

1. Run the app:
   ```bash
   npm run dev
   ```

2. Open the `Data` menu in the sticky header.

3. Paste your WorldGuessr secret and click `Update Data`.

4. The dashboard stores scraped games in cookies and loads from cookie storage on next visit.

> **Note:** Cookie storage has size limits. Very large datasets may not fit and the app will show an error in that case.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```
