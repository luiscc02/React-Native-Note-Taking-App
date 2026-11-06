# React Native Note Taking App

A simple Expo-powered React Native app for creating handwritten notes on top of study templates. Pick a template, sketch with your finger or stylus, and switch between drawing and erasing as you study.

## Features

- Template picker for common study methods (Cornell, SQ3R, and more).
- Skia-based drawing canvas with pen + eraser modes.
- Undo and clear controls for quick edits.
- Uses a background image to guide layout while sketching.

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- Expo CLI (`npm install -g expo-cli`) or use `npx expo`

### Install

```bash
npm install
```

### Run

```bash
# Start Metro bundler
npm start

# Or launch directly on a platform
npm run android
npm run ios
npm run web
```

## Project Structure

```
.
├── App.js                # Navigation setup
├── assets/               # Template images and static assets
├── screens/
│   ├── HomeScreen.js     # Entry screen
│   ├── TemplatePicker.js # Template list
│   └── NoteEditor.js     # Drawing canvas
├── index.js              # App entry
└── package.json          # Scripts + dependencies
```

## Notes

- The current background image for the note editor is `assets/cornell.png`. Replace or extend this image to add more templates.
- Drawing uses `@shopify/react-native-skia`, which may require additional setup for certain platforms.

## License

0BSD
