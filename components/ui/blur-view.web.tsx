import React from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';

type BlurTint = 'light' | 'dark' | 'default';

type BlurViewProps = ViewProps & {
  intensity?: number;
  tint?: BlurTint;
  children?: React.ReactNode;
};

export function BlurView({ style, children, ...rest }: BlurViewProps) {
  return (
    <View style={style} {...(rest as any)}>
      {children}
    </View>
  );
}
