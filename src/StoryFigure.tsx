import React from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

type Props = {
  id: string;
  source: ImageSourcePropType;
  ratio: number;
  title: string;
  description: string;
  credit: string;
};

export function StoryFigure({ id, source, ratio, title, description, credit }: Props) {
  return <View testID={id} style={styles.figure}>
    <View style={[styles.frame, { aspectRatio: ratio }]}>
      <Image source={source} style={styles.image} resizeMode="contain" accessibilityLabel={description} />
    </View>
    <View style={styles.caption}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.credit}>{credit}</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  figure: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#EFF1E7', marginBottom: 22 },
  frame: { width: '100%', backgroundColor: '#DFE5D5' },
  image: { width: '100%', height: '100%' },
  caption: { padding: 14, gap: 5 },
  title: { color: '#244F3E', fontSize: 14, fontWeight: '700', lineHeight: 20 },
  description: { color: '#52664E', fontSize: 12, lineHeight: 19 },
  credit: { color: '#687462', fontSize: 10, lineHeight: 16, marginTop: 3 },
});
