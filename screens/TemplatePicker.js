import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

const templates = [
  { id: '1', name: 'Cornell Notes' },
  { id: '2', name: 'GUESST Method' },
  { id: '3', name: 'Mind Map' },
  { id: '4', name: 'Feynman Technique' },
  { id: '5', name: 'SQ3R' },
];

export default function TemplatePicker({ navigation }) {
  const handleSelect = (templateName) => {
    navigation.navigate('NoteEditor', { template: templateName });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Choose a Template</Text>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Button
              title={item.name}
              onPress={() => handleSelect(item.name)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  item: {
    marginVertical: 8,
    width: '100%',
  },
});

