/**
 * AnimatedRiver - Flowing water effect for the bridge game
 * Creates a gentle horizontal shimmer suggesting the movement of time
 */

import { SharedColors } from '@/constants/theme';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnimatedRiverProps {
  height?: number;
  intensity?: 'calm' | 'flowing' | 'active';
}

export function AnimatedRiver({ height = 200, intensity = 'flowing' }: AnimatedRiverProps) {
  const waveOffset = useSharedValue(0);
  const shimmerProgress = useSharedValue(0);

  // Duration based on intensity
  const waveDuration = intensity === 'calm' ? 8000 : intensity === 'flowing' ? 5000 : 3000;

  useEffect(() => {
    // Continuous wave animation
    waveOffset.value = withRepeat(
      withTiming(1, { duration: waveDuration, easing: Easing.linear }),
      -1, // Infinite
      false
    );

    // Shimmer effect
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [intensity]);

  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: waveOffset.value * SCREEN_WIDTH * 0.3 }],
    opacity: 0.6 + shimmerProgress.value * 0.2,
  }));

  const wave2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: -waveOffset.value * SCREEN_WIDTH * 0.2 }],
    opacity: 0.4 + shimmerProgress.value * 0.3,
  }));

  const wave3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: waveOffset.value * SCREEN_WIDTH * 0.15 }],
    opacity: 0.5 + shimmerProgress.value * 0.2,
  }));

  return (
    <View style={[styles.container, { height }]}>
      {/* Base water layer */}
      <View style={styles.waterBase} />
      
      {/* Animated wave layers */}
      <Animated.View style={[styles.waveLayer, styles.wave1, wave1Style]} />
      <Animated.View style={[styles.waveLayer, styles.wave2, wave2Style]} />
      <Animated.View style={[styles.waveLayer, styles.wave3, wave3Style]} />
      
      {/* Surface highlights */}
      <View style={styles.surfaceHighlight} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  waterBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SharedColors.river,
  },
  waveLayer: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH * 2,
    left: -SCREEN_WIDTH * 0.5,
  },
  wave1: {
    backgroundColor: SharedColors.riverDeep,
    borderRadius: 100,
    transform: [{ scaleY: 0.5 }],
    top: '20%',
  },
  wave2: {
    backgroundColor: SharedColors.riverLight,
    borderRadius: 80,
    transform: [{ scaleY: 0.3 }],
    top: '50%',
  },
  wave3: {
    backgroundColor: SharedColors.riverDeep,
    borderRadius: 120,
    transform: [{ scaleY: 0.4 }],
    top: '70%',
  },
  surfaceHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: SharedColors.riverLight,
    opacity: 0.6,
  },
});

export default AnimatedRiver;
