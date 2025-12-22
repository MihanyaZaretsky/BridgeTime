import { BlurView as ExpoBlurView } from 'expo-blur';
import React from 'react';
import { ViewProps } from 'react-native';

export type BlurTint = 'light' | 'dark' | 'default';

export type BlurViewProps = ViewProps & {
  intensity?: number;
  tint?: BlurTint;
  children?: React.ReactNode;
};

export function BlurView(props: BlurViewProps) {
  return <ExpoBlurView {...(props as any)} />;
}
