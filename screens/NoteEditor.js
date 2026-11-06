import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, PanResponder, Button, Image, Platform } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  Group,
  Paint,
} from '@shopify/react-native-skia';

// Change this if your file name or path differs
const templateImage = require('../assets/cornell.png');

// Paint props for each stroke mode. The eraser's dstOut blend only removes ink
// because the strokes are drawn inside their own layer (see the Group below).
const strokeProps = {
  draw: { color: 'black', strokeWidth: 2 },
  erase: { color: 'black', strokeWidth: 20, blendMode: 'dstOut' },
};

export default function NoteEditor({ route }) {
  const { template } = route.params;
  const { width, height } = useWindowDimensions();

  // Keep a single array of strokes. Each stroke is { path, mode }.
  // mode: 'draw' or 'erase'
  const [strokes, setStrokes] = useState([]);

  // Current stroke being drawn. The ref is what the gesture handlers extend;
  // the state holds a copy so each move re-renders the stroke in progress.
  const currentPathRef = useRef(null);
  const [currentPath, setCurrentPath] = useState(null);

  // Where the current stroke started, relative to the drawing surface
  const startPointRef = useRef({ x: 0, y: 0 });

  // Toggle for eraser mode
  const [isEraser, setIsEraser] = useState(false);

  // The PanResponder below is only created once, so it reads the mode from a ref
  const isEraserRef = useRef(isEraser);
  isEraserRef.current = isEraser;

  // Save the stroke in progress, if there is one
  const finishStroke = () => {
    if (!currentPathRef.current) return;
    const finishedPath = currentPathRef.current;

    // Save the stroke with its mode
    setStrokes((prev) => [
      ...prev,
      { path: finishedPath, mode: isEraserRef.current ? 'erase' : 'draw' },
    ]);

    currentPathRef.current = null;
    setCurrentPath(null);
  };

  // PanResponder for capturing stylus or finger input
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        startPointRef.current = { x: locationX, y: locationY };
        const newPath = Skia.Path.Make();
        newPath.moveTo(locationX, locationY);
        currentPathRef.current = newPath;
        setCurrentPath(newPath.copy());
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!currentPathRef.current) return;
        // Use the distance moved, not locationX/Y: those are relative to whichever
        // view is under the pointer, which changes if the stroke leaves the surface.
        currentPathRef.current.lineTo(
          startPointRef.current.x + gestureState.dx,
          startPointRef.current.y + gestureState.dy
        );
        setCurrentPath(currentPathRef.current.copy());
      },
      onPanResponderRelease: () => finishStroke(),
      onPanResponderTerminate: () => finishStroke(),
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
    setCurrentPath(null);
  };

  // Toggle between drawing and erasing
  const toggleEraser = () => {
    setIsEraser((prev) => !prev);
  };

  return (
    <View style={styles.container}>
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

      <View style={[styles.canvasWrapper, { width: width * 0.9, height: height * 0.7 }]}>
        {/* Background (Cornell notes) */}
        <Image source={templateImage} style={styles.backgroundImage} resizeMode="stretch" />

        {/* Drawing Canvas */}
        <Canvas style={styles.canvas}>
          <Group layer={<Paint />}>
            {strokes.map((stroke, i) => (
              <Path
                key={i}
                path={stroke.path}
                style="stroke"
                strokeCap="round"
                strokeJoin="round"
                {...strokeProps[stroke.mode]}
              />
            ))}

            {/* Show the current in-progress stroke */}
            {currentPath && (
              <Path
                path={currentPath}
                style="stroke"
                strokeCap="round"
                strokeJoin="round"
                {...strokeProps[isEraser ? 'erase' : 'draw']}
              />
            )}
          </Group>
        </Canvas>

        {/* Empty view on top of the canvas, so touches are always relative to it */}
        <View style={styles.touchSurface} {...panResponder.panHandlers} />
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
  touchSurface: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    ...Platform.select({ web: { cursor: 'crosshair', touchAction: 'none', userSelect: 'none' } }),
  },
});

