BARAMEEL RUN — NEW PROJECT
This is a NEW standalone project. It does not modify or depend on the previous GitHub project.

GAME LOGIC
QR Checkpoint -> Scan -> Puzzle Piece -> Points -> Collection Progress -> Competition -> Complete Collection -> Redeem Rewards

SCREENS
01 Start
02 Choose Runner
03 Runner Confirmed
04 Home / Run Dashboard
05 QR Checkpoint Scanner
06 Checkpoint Found / Puzzle Piece
07 Next Checkpoint
08 Checkpoint Hunt / Collection Progress
09 Leaderboard
10 Redeem / Reward

ASSET UPLOAD
Upload the final artwork files directly into /assets using the exact names in assets/ASSET-NAMES.txt.
The current PNGs in /assets are only temporary placeholders for the new artwork and should be replaced.

COLLECTION 01
Already included in:
assets/collections/collection01/
- collection01-master.png
- collection01.json
- pieces/collection01-piece-01.png ... piece-09.png
- QR-piece-04-test.png

TEST QR PAYLOAD
{"collection":"collection01","piece":4,"points":10000}

GITHUB
1. Create a NEW repository.
2. Upload everything inside this project folder to the repository root.
3. Keep /assets as a folder at the root.
4. Replace the placeholder screen PNGs with the final screen artwork using the exact names.
5. Enable GitHub Pages from Settings -> Pages -> Deploy from branch -> main -> /(root).
6. Open the generated Pages URL over HTTPS; camera permissions require HTTPS.

IMPORTANT
Do not upload BARAMEEL-COLLECTION-01.zip itself into assets. The collection is already unpacked into the correct game structure.
