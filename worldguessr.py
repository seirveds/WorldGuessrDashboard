import requests
from time import sleep
import json
from dotenv import load_dotenv
import os

load_dotenv()
SECRET = os.getenv("SECRET")


class WorldGuesserAPI:

    BASE_URL: str = "https://api.worldguessr.com/api/"
    HEADERS: dict = {
        "accept": "*/*",
        "content-type": "application/json",
        "origin": "https://www.worldguessr.com",
        "referer": "https://www.worldguessr.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    }

    def __init__(self, secret: str) -> None:
        self.secret = secret

    def get_username_from_id(self, id: str) -> dict:
        response = requests.post(
            url=self.BASE_URL + "publicAccount",
            headers=self.HEADERS,
            json={"id": id}
        )
        return response.json()["username"]

    def get_all_games(self) -> dict:
        all_games = []
        page = 1
        while True:
            response = requests.post(
                url=self.BASE_URL + "gameHistory",
                headers=self.HEADERS,
                json={"secret": self.secret, "page": page, "limit": 50},
            )
            games = response.json()["games"]
            if not games:
                break

            for game in games:
                game["game"] = self.get_game_info(game["gameId"])
                time.sleep(1)
            all_games.extend(games)
            page += 1
            sleep(5)
        return all_games
    
    def get_game_info(self, game_id: str) -> dict:
        response = requests.post(
            self.BASE_URL + "gameDetails",
            headers=self.HEADERS,
            json={
                "gameId": game_id,
                "secret": self.secret,
            }
        )
        return response.json()["game"]

api = WorldGuesserAPI(SECRET)

all_games = api.get_all_games()

with open("worldguesser_data.json", "w") as f:
    json.dump(all_games, f)
