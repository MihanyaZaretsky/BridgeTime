/**
 * BridgeVisualization - Modern bridge design for the main game screen
 * Features a calm, wooden bridge spanning a river with subtle animations
 */

import { PastColors, SharedColors } from '@/constants/theme';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BridgeVisualizationProps {
  pastProgress: number;
  presentProgress: number;
  totalLength: number;
}

export function BridgeVisualization({
  pastProgress,
  presentProgress,
  totalLength,
}: BridgeVisualizationProps) {
  // Calculate bridge completion
  const totalBuilt = pastProgress + presentProgress;
  const completionPercentage = totalLength > 0 ? (totalBuilt / totalLength) * 100 : 0;

  // Create planks array
  const planks = [];
  for (let i = 0; i < totalLength; i++) {
    const isPastBuilt = i < pastProgress;
    const isPresentBuilt = i >= totalLength - presentProgress;
    const isBuilt = isPastBuilt || isPresentBuilt;
    
    planks.push(
      React.createElement(View, {
        key: i,
        style: [
          styles.plank,
          isBuilt && styles.plankBuilt,
          isPastBuilt && styles.pastPlank,
          isPresentBuilt && styles.presentPlank,
        ]
      })
    );
  }

  return React.createElement(View, { style: styles.container },
    // River
    React.createElement(View, { style: styles.river },
      // Water surface with subtle shimmer
      React.createElement(View, { style: styles.waterSurface }),
      // Deeper water
      React.createElement(View, { style: styles.deepWater })
    ),
    
    // Bridge structure
    React.createElement(View, { style: styles.bridgeContainer },
      // Bridge base
      React.createElement(View, { style: styles.bridgeBase }),
      
      // Bridge planks
      React.createElement(View, { style: styles.bridgePlanks }, planks),
      
      // Bridge rails
      React.createElement(View, { style: styles.rails })
    ),

    // Progress indicator
    React.createElement(View, { style: styles.progressContainer },
      React.createElement(Text, { style: styles.progressText },
        `${completionPercentage.toFixed(0)}% Complete`
      )
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  river: {
    position: 'absolute',
    width: '100%',
    height: 80,
    overflow: 'hidden',
  },
  waterSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: SharedColors.riverLight,
    opacity: 0.7,
  },
  deepWater: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SharedColors.riverDeep,
  },
  bridgeContainer: {
    position: 'absolute',
    width: '90%',
    height: 60,
    zIndex: 2,
  },
  bridgeBase: {
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0,
    height: 15,
    backgroundColor: PastColors.primary,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bridgePlanks: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 35,
  },
  plank: {
    width: 20,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    opacity: 0.3,
    borderWidth: 1,
    borderColor: SharedColors.border,
  },
  plankBuilt: {
    opacity: 1,
    backgroundColor: PastColors.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pastPlank: {
    backgroundColor: PastColors.secondary,
  },
  presentPlank: {
    backgroundColor: PastColors.secondary,
  },
  rails: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: PastColors.primary,
    borderRadius: 2,
  },
  progressContainer: {
    position: 'absolute',
    bottom: -40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: SharedColors.riverDeep,
  },
});

export default BridgeVisualization;