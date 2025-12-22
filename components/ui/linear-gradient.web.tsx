import React from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';

type LinearGradientPoint = { x: number; y: number };

type LinearGradientProps = ViewProps & {
  colors: string[];
  locations?: number[];
  start?: LinearGradientPoint;
  end?: LinearGradientPoint;
  children?: React.ReactNode;
};

export function LinearGradient({ colors, style, children, ...rest }: LinearGradientProps) {
  const backgroundColor = Array.isArray(colors) && colors.length > 0 ? colors[0] : 'transparent';
  return (
    <View style={[{ backgroundColor }, style]} {...(rest as any)}>
      {children}
    </View>
  );
}
