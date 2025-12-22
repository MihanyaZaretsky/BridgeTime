import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ViewProps } from 'react-native';

export type LinearGradientPoint = { x: number; y: number };

export type LinearGradientProps = ViewProps & {
  colors: string[];
  locations?: number[];
  start?: LinearGradientPoint;
  end?: LinearGradientPoint;
  children?: React.ReactNode;
};

export function LinearGradient(props: LinearGradientProps) {
  return <ExpoLinearGradient {...(props as any)} />;
}
