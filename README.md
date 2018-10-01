# tsubasa_discordbot
A simple discord bot using modular commands.

Not designed to be used by third parties, but a sample `settings.json.dist` file is provided.

## Requirements
- NodeJS 8 and up
- ffmpeg (to use *music* command)

## Installation & Usage
- clone repo anywhere
- run `npm install`
- add ffmpeg to `PATH`
- copy `settings.dist.json` and rename it `settings.json`
- fill in `settings.json` with parameters, namely discord API app key
- run `node index.js`
