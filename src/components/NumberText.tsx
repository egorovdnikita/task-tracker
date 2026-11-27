import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useFonts } from 'expo-font';

/** Handjet из макета: ELGR=1, ELSH=8, wght=400. Статический файл для iOS. */
export const NumberText = ({ style, ...props }: TextProps) => {
  const [loaded] = useFonts({ Handjet: require('../../assets/fonts/Handjet-Regular.ttf') });
  return <Text {...props} style={[{ fontFamily: loaded ? 'Handjet' : 'System', fontSize: 72, lineHeight: 76 }, style]} />;
};
