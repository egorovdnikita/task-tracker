import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

/** Пять заливок из утверждённого Finch, нормализованные координаты Figma. */
export const ScreenBackdrop = () => {
  const id = useId().replace(/:/g, '');
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden>
      <Svg width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={`${id}base`} x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#7A4588" /><Stop offset=".16" stopColor="#B47AA6" />
            <Stop offset=".45" stopColor="#E2A0B0" /><Stop offset=".72" stopColor="#F8BA9C" />
            <Stop offset="1" stopColor="#FCB47E" />
          </LinearGradient>
          <RadialGradient id={`${id}violet`} cx=".15" cy="-.05" rx=".4" ry=".4" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#4E348F" stopOpacity=".6" /><Stop offset="1" stopColor="#4E348F" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={`${id}wine`} cx="1" cy=".02" rx=".45" ry=".4" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#7A2630" stopOpacity=".85" /><Stop offset=".6" stopColor="#8A3040" stopOpacity=".35" /><Stop offset="1" stopColor="#8A3040" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={`${id}light`} cx=".47" cy=".5" rx=".42" ry=".45" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FFF8F6" stopOpacity=".85" /><Stop offset=".5" stopColor="#FBE6E6" stopOpacity=".4" /><Stop offset="1" stopColor="#FBE6E6" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={`${id}peach`} cx=".45" cy=".95" rx=".35" ry=".25" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FFE2CC" stopOpacity=".22" /><Stop offset="1" stopColor="#FFE2CC" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {['base', 'violet', 'wine', 'light', 'peach'].map(layer => <Rect key={layer} width="1" height="1" fill={`url(#${id}${layer})`} />)}
      </Svg>
    </View>
  );
};
