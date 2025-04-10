// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import TemplatePicker from './screens/TemplatePicker';
import NoteEditor from './screens/NoteEditor';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TemplatePicker" component={TemplatePicker} />
	<Stack.Screen name="NoteEditor" component={NoteEditor} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


