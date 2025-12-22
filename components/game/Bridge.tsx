/**
 * BridgeSegment - Visual representation of a bridge piece
 * Animates into place when earned by a player
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SharedColors, PastColors, PresentColors } from '@/constants/theme';
import { PlayerRole } from '@/types/game';

interface BridgeSegmentProps {
  position: number;
  earnedBy: PlayerRole;
  isNew?: boolean;
  totalSegments: number;
}

export function BridgeSegmentView({
  position,
  earnedBy,
  isNew = false,
  totalSegments,
}: BridgeSegmentProps) {
  const buildProgress = useSharedValue(isNew ? 0 : 1);
  
  const playerColors = earnedBy === 'past' ? PastColors : PresentColors;

  useEffect(() => {
    if (isNew) {
      // Animate segment sliding into place
      buildProgress.value = withDelay(
        100,
        withSpring(1, {
          damping: 12,
          stiffness: 100,
        })
      );
    }
  }, [isNew]);

  const segmentStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      buildProgress.value,
      [0, 0.5, 1],
      [0.3, 1.1, 1],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      buildProgress.value,
      [0, 1],
      [-50, 0],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      buildProgress.value,
      [0, 0.3, 1],
      [0, 0.8, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.segment, segmentStyle]}>
      {/* Main plank */}
      <View style={[styles.plank, { backgroundColor: SharedColors.bridge }]}>
        {/* Wood grain details */}
        <View style={styles.woodGrain} />
        <View style={[styles.woodGrain, styles.woodGrain2]} />
      </View>
      
      {/* Side rails with player color */}
      <View style={[styles.rail, styles.railLeft, { backgroundColor: playerColors.primary }]} />
      <View style={[styles.rail, styles.railRight, { backgroundColor: playerColors.primary }]} />
      
      {/* Connection points */}
      <View style={[styles.connector, styles.connectorLeft]} />
      <View style={[styles.connector, styles.connectorRight]} />
    </Animated.View>
  );
}

interface BridgeProps {
  pastSegments: number;
  presentSegments: number;
  totalLength: number;
  latestSegmentOwner?: PlayerRole;
}

export function Bridge({
  pastSegments,
  presentSegments,
  totalLength,
  latestSegmentOwner,
}: BridgeProps) {
  const allSegments = [];
  
  // Build segments from past side
  for (let i = 0; i < pastSegments; i++) {
    const isLatest = latestSegmentOwner === 'past' && i === pastSegments - 1;
    allSegments.push(
      <BridgeSegmentView
        key={`past-${i}`}
        position={i}
        earnedBy="past"
        isNew={isLatest}
        totalSegments={totalLength}
      />
    );
  }

  // Build segments from present side (from the other end)
  for (let i = 0; i < presentSegments; i++) {
    const isLatest = latestSegmentOwner === 'present' && i === presentSegments - 1;
    allSegments.push(
      <BridgeSegmentView
        key={`present-${i}`}
        position={totalLength - 1 - i}
        earnedBy="present"
        isNew={isLatest}
        totalSegments={totalLength}
      />
    );
  }

  return (
    <View style={styles.bridgeContainer}>
      <View style={styles.bridgeTrack}>
        {allSegments}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bridgeContainer: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bridgeTrack: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    minHeight: 60,
  },
  segment: {
    width: 36,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plank: {
    width: 32,
    height: 40,
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: SharedColors.bridgeShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  woodGrain: {
    position: 'absolute',
    left: 4,
    top: 8,
    width: 24,
    height: 2,
    backgroundColor: SharedColors.bridgeLight,
    opacity: 0.4,
    borderRadius: 1,
  },
  woodGrain2: {
    top: 20,
    width: 20,
    left: 8,
  },
  rail: {
    position: 'absolute',
    width: 4,
    height: 48,
    borderRadius: 2,
    top: 1,
  },
  railLeft: {
    left: 0,
  },
  railRight: {
    right: 0,
  },
  connector: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SharedColors.bridgeShadow,
    top: '50%',
    marginTop: -3,
  },
  connectorLeft: {
    left: -3,
  },
  connectorRight: {
    right: -3,
  },
});

export default Bridge;
