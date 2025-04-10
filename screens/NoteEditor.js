import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, Button, Image } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  Group,
  PaintStyle,
  Paint,
} from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

// Change this if your file name or path differs
const templateImage = require('../assets/cornell.png');

export default function NoteEditor({ route }) {
  const { template } = route.params;

  // Keep a single array of strokes. Each stroke is { path, mode }.
  // mode: 'draw' or 'erase'
  const [strokes, setStrokes] = useState([]);

  // Current stroke being drawn
  const currentPathRef = useRef(null);

  // Toggle for eraser mode
  const [isEraser, setIsEraser] = useState(false);

  // Paint for normal drawing (black lines)
  const drawPaint = Skia.Paint();
  drawPaint.setColor(Skia.Color('black'));
  drawPaint.setStyle(PaintStyle.Stroke);
  drawPaint.setStrokeWidth(2);

  // Paint for eraser (using blend mode if your device supports it)
  const erasePaint = Skia.Paint();
  erasePaint.setStyle(PaintStyle.Stroke);
  erasePaint.setStrokeWidth(20);

  // If your Skia version supports blend modes, set one here
  // e.g. Skia.BlendMode.Clear or Skia.BlendMode.DstOut
  // If your device doesn’t support it, you may see black lines
  if (Skia.BlendMode) {
    erasePaint.setBlendMode(Skia.BlendMode.DstOut);
  } else {
    // fallback if BlendMode is undefined
    // This will draw white strokes instead, which only works well
    // if your background is plain white
    erasePaint.setColor(Skia.Color('white'));
  }

  // Decide which paint to use for the current stroke preview
  const getPreviewPaint = () => (isEraser ? erasePaint : drawPaint);

  // PanResponder for capturing stylus or finger input
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = Skia.Path.Make();
        newPath.moveTo(locationX, locationY);
        currentPathRef.current = newPath;
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (currentPathRef.current) {
          currentPathRef.current.lineTo(locationX, locationY);
        }
      },
      onPanResponderRelease: () => {
        if (!currentPathRef.current) return;
        // Create a copy for the final stroke
        const finishedPath = currentPathRef.current.copy();

        // Save the stroke with its mode
        setStrokes((prev) => [
          ...prev,
          { path: finishedPath, mode: isEraser ? 'erase' : 'draw' },
        ]);

        currentPathRef.current = null;
      },
    })
  ).current;

  // Undo removes the last stroke from strokes array
  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  // Clear everything
  const handleClear = () => {
    setStrokes([]);
    currentPathRef.current = null;
  };

  // Toggle between drawing and erasing
  const toggleEraser = () => {
    setIsEraser((prev) => !prev);
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Text style={styles.title}>🖋️ {template}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Undo" onPress={handleUndo} color="#5bc0de" />
        <Button title="Clear" onPress={handleClear} color="#d9534f" />
        <Button
          title={isEraser ? 'Draw' : 'Eraser'}
          onPress={toggleEraser}
          color="#5cb85c"
        />
      </View>

      <View style={styles.canvasWrapper}>
        {/* Background (Cornell notes) */}
        <Image source={templateImage} style={styles.backgroundImage} resizeMode="stretch" />

        {/* Drawing Canvas */}
        <Canvas style={styles.canvas}>
          <Group>
            {strokes.map((stroke, i) => {
              // Decide paint for each stroke based on its stored mode
              const paint = stroke.mode === 'erase' ? erasePaint : drawPaint;
              return <Path key={i} path={stroke.path} paint={paint} />;
            })}

            {/* Show the current in-progress stroke */}
            {currentPathRef.current && (
              <Path path={currentPathRef.current} paint={getPreviewPaint()} />
            )}
          </Group>
        </Canvas>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    width: '90%',
    justifyContent: 'space-around',
  },
  canvasWrapper: {
    width: width * 0.9,
    height: height * 0.7,
    position: 'relative',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  canvas: {
    flex: 1,
    zIndex: 1,
  },
});

