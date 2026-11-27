import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

/** Пять заливок из утверждённого Finch, нормализованные координаты Figma. */
export const ScreenBackdrop = () => {
  const id = useId().replace(/:/g, '');
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={`${id}base`} x1="0" y1="0" x2="0" y2="844" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#7A4588" /><Stop offset={0.16} stopColor="#B47AA6" />
            <Stop offset={0.45} stopColor="#E2A0B0" /><Stop offset={0.72} stopColor="#F8BA9C" />
            <Stop offset="1" stopColor="#FCB47E" />
          </LinearGradient>
          <RadialGradient id={`${id}violet`} cx="58.5" cy="-42.2" rx="156" ry="337.6" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#4E348F" stopOpacity={0.6} /><Stop offset="1" stopColor="#4E348F" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={`${id}wine`} cx="390" cy="16.88" rx="175.5" ry="337.6" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#7A2630" stopOpacity={0.85} /><Stop offset={0.6} stopColor="#8A3040" stopOpacity={0.35} /><Stop offset="1" stopColor="#8A3040" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={`${id}light`} cx="183.3" cy="422" rx="163.8" ry="379.8" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FFF8F6" stopOpacity={0.85} /><Stop offset={0.5} stopColor="#FBE6E6" stopOpacity={0.4} /><Stop offset="1" stopColor="#FBE6E6" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id={`${id}peach`} cx="175.5" cy="801.8" rx="136.5" ry="211" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FFE2CC" stopOpacity={0.22} /><Stop offset="1" stopColor="#FFE2CC" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {['base', 'violet', 'wine', 'light', 'peach'].map(layer => <Rect key={layer} width="390" height="844" fill={`url(#${id}${layer})`} />)}
      </Svg>
    </View>
  );
};
