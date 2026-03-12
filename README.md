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

The dashboard expects a `worldguesser_data.json` file in the project root directory. This file should contain an array of game objects with the following structure:

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

### How to Generate the Data

#### Using the worldguesser.py Script

1. **Install Python dependencies**
   ```bash
   pip install requests
   ```

2. **Set WorldGuessr token in .env**
   Retrieve your worldGuessr token from your browser's developer tools (Network tab) while logged in to WorldGuesser and add it to a `.env` file in the project root directory as `SECRET=your_token_here`.

3. **Run the script**
   ```bash
   python worldguesser.py
   ```

4. **Verify the data**
   - Ensure the generated `worldguesser_data.json` follows the structure shown above
   - The file should be in the project root directory
   - The dashboard will automatically load and visualize the data on startup

> **Note:** You'll need to obtain your session token from WorldGuesser. Check your browser's developer tools (Network tab) while logged in to find the authentication token.

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
