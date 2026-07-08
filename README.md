# Wedding Jeopardy

A lightweight HTML/CSS/JavaScript Jeopardy game that runs entirely offline.

## Features

- No dependencies
- Runs locally
- JSON-driven questions
- Easy styling with CSS
- Supports images, audio, and video
- Easily customizable for weddings or other events

## Running

Because browsers often block loading local JSON files via `file://`, it's easiest to serve the folder with a simple local web server.

If you have Python installed:

```bash
python -m http.server 8000
```

Then visit:

http://localhost:8000