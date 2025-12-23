/**
 * QR Scanner Screen
 * Placeholder for camera-based QR code scanning
 * Will scan physical cards to load questions
 */

import { PastColors, PresentColors, SharedColors } from '@/constants/theme';
import { useGame } from '@/context/GameContext';
import { inferTimePeriodFromQuestionId } from '@/data/questionBank';
import type { TimePeriod } from '@/types/game';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const { game } = useGame();
  const [permission, requestPermission] = useCameraPermissions();
  const hasPermission = Boolean(permission?.granted);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastScanAtRef = useRef<number>(0);
  const [manualValue, setManualValue] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [isWebScanning, setIsWebScanning] = useState(false);
  const webVideoRef = useRef<HTMLVideoElement | null>(null);
  const webScannerControlsRef = useRef<{ stop: () => void } | null>(null);
  const webReaderRef = useRef<any>(null);

  const currentColors = game?.currentTurn === 'past' ? PastColors : PresentColors;
  const timePeriodLabel = game?.currentTurn === 'past' ? 'Прошлого' : 'Настоящего';

  const parseTimePeriodFromRaw = useCallback((raw: string): TimePeriod | null => {
    const trimmed = raw.trim();
    if (trimmed.length === 0) return null;

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          const obj = parsed as Record<string, unknown>;
          const tp = obj.timePeriod;
          if (tp === 'past' || tp === 'present') return tp;
        }
      } catch {
        return null;
      }
    }

    try {
      const url = new URL(trimmed);
      const tp = url.searchParams.get('timePeriod');
      if (tp === 'past' || tp === 'present') return tp;
    } catch {
      return null;
    }

    return null;
  }, []);

  const parseQuestionId = useCallback((raw: string): string | null => {
    const trimmed = raw.trim();
    if (trimmed.length === 0) return null;

    // QR can contain JSON like {"id":"card_001", ...} or {"questionId":"43"}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          const obj = parsed as Record<string, unknown>;

          const directQuestionId = obj.questionId;
          if (typeof directQuestionId === 'string' && /^\d+$/.test(directQuestionId.trim())) {
            return directQuestionId.trim();
          }
          if (typeof directQuestionId === 'number' && Number.isFinite(directQuestionId)) {
            return String(directQuestionId);
          }

          const id = obj.id;
          if (typeof id === 'string') {
            const idTrimmed = id.trim();
            if (/^\d+$/.test(idTrimmed)) return idTrimmed;
            const m = idTrimmed.match(/card_(\d+)/i);
            if (m?.[1]) return String(parseInt(m[1], 10));
          }
        }
      } catch {
        // ignore
      }
    }

    // QR can be just a number like "43"
    if (/^\d+$/.test(trimmed)) return trimmed;

    // Or a deep link / URL like bridgetime://question?questionId=43
    try {
      const url = new URL(trimmed);
      const q = url.searchParams.get('questionId');
      if (q && /^\d+$/.test(q.trim())) return q.trim();
    } catch {
      // ignore
    }

    // Or any text containing questionId=NUMBER
    const match = trimmed.match(/questionId\s*=\s*(\d+)/i);
    if (match?.[1]) return match[1];

    return null;
  }, []);

  const handleOpenQuestion = useCallback(
    (raw: string) => {
      const now = Date.now();
      if (isProcessing) return;
      if (now - lastScanAtRef.current < 1200) return;

      setScanError(null);

      if (!game) {
        setScanError('Нет активной игры. Вернитесь на главный экран и начните игру заново.');
        return;
      }

      const questionId = parseQuestionId(raw);
      if (!questionId) {
        console.warn('Unsupported QR payload (expected number / questionId / JSON):', raw);
        setScanError('Не удалось распознать QR-код. Попробуйте еще раз.');
        return;
      }

      const scannedPeriod = parseTimePeriodFromRaw(raw) ?? inferTimePeriodFromQuestionId(questionId);
      if (!scannedPeriod) {
        setScanError('Не удалось определить эпоху карты. Попробуйте другой QR-код.');
        return;
      }

      const expectedPeriod: TimePeriod = game.currentTurn;
      if (scannedPeriod !== expectedPeriod) {
        setScanError(
          `Сейчас ход игрока из ${expectedPeriod === 'past' ? 'Прошлого' : 'Настоящего'}. ` +
            `Нельзя сканировать карту из ${scannedPeriod === 'past' ? 'Прошлого' : 'Настоящего'}.`
        );
        return;
      }

      lastScanAtRef.current = now;
      setIsProcessing(true);

      router.replace({
        pathname: '/question',
        params: { questionId },
      });
    },
    [game, isProcessing, parseQuestionId, parseTimePeriodFromRaw]
  );

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      handleOpenQuestion((result?.data ?? '').toString());
    },
    [handleOpenQuestion]
  );

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    if (!isWebScanning) {
      webScannerControlsRef.current?.stop?.();
      webScannerControlsRef.current = null;
      return;
    }

    const videoEl = webVideoRef.current;
    if (!videoEl) {
      return;
    }

    setScanError(null);

    let cancelled = false;

    (async () => {
      try {
        const BarcodeDetectorCtor = (globalThis as any)?.BarcodeDetector;
        if (!BarcodeDetectorCtor) {
          throw new Error('BarcodeDetector API not supported');
        }

        if (!webReaderRef.current) {
          webReaderRef.current = new BarcodeDetectorCtor({ formats: ['qr_code'] });
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        videoEl.srcObject = stream;
        await videoEl.play();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          stream.getTracks().forEach((t) => t.stop());
          throw new Error('Canvas not available');
        }

        let rafId: number | null = null;
        let lastDetectAt = 0;

        const loop = () => {
          if (cancelled) return;
          rafId = requestAnimationFrame(loop);

          const now = Date.now();
          if (now - lastDetectAt < 300) return;
          lastDetectAt = now;

          const vw = videoEl.videoWidth;
          const vh = videoEl.videoHeight;
          if (!vw || !vh) return;

          canvas.width = vw;
          canvas.height = vh;
          ctx.drawImage(videoEl, 0, 0, vw, vh);

          webReaderRef.current
            .detect(canvas)
            .then((codes: any[]) => {
              const raw = codes?.[0]?.rawValue;
              if (raw) {
                handleOpenQuestion(String(raw));
              }
            })
            .catch(() => {
              return;
            });
        };

        loop();

        webScannerControlsRef.current = {
          stop: () => {
            if (rafId != null) cancelAnimationFrame(rafId);
            try {
              const s = videoEl.srcObject as MediaStream | null;
              s?.getTracks?.().forEach((t) => t.stop());
            } catch {
              // ignore
            }
            videoEl.srcObject = null;
          },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setScanError(
          'Не удалось запустить камеру в браузере. Проверьте, что сайт открыт по HTTPS и вы дали разрешение на камеру.\n' +
            msg
        );
        setIsWebScanning(false);
      }
    })();

    return () => {
      cancelled = true;
      webScannerControlsRef.current?.stop?.();
      webScannerControlsRef.current = null;
    };
  }, [handleOpenQuestion, isWebScanning]);

  const handleRequestPermission = useCallback(() => {
    requestPermission();
  }, [requestPermission]);

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Сканировать карту</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      {/* Camera viewfinder */}
      <View style={styles.cameraContainer}>
        <Animated.View entering={FadeIn.delay(200)} style={styles.viewfinder}>
          {Platform.OS === 'web' ? (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionTitle}>Сканер в браузере</Text>
              <Text style={styles.permissionText}>
                Нажмите «Включить камеру», разрешите доступ и наведите на QR-код.
                Если камера недоступна — используйте ручной ввод.
              </Text>

              <View style={styles.webVideoWrap}>
                <video
                  ref={webVideoRef}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }}
                  muted
                  playsInline
                  autoPlay
                />
                {!isWebScanning && (
                  <View pointerEvents="none" style={styles.webVideoOverlay}>
                    <Text style={styles.webVideoOverlayText}>Камера выключена</Text>
                  </View>
                )}
              </View>

              <Pressable
                style={styles.permissionButton}
                onPress={() => setIsWebScanning((v) => !v)}
              >
                <Text style={styles.permissionButtonText}>
                  {isWebScanning ? 'Выключить камеру' : 'Включить камеру'}
                </Text>
              </Pressable>

              <TextInput
                value={manualValue}
                onChangeText={setManualValue}
                placeholder="Например: 43 или bridgetime://question?questionId=43"
                placeholderTextColor="rgba(255,255,255,0.6)"
                style={styles.manualInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                style={styles.permissionButton}
                onPress={() => handleOpenQuestion(manualValue)}
                disabled={manualValue.trim().length === 0}
              >
                <Text style={styles.permissionButtonText}>Открыть</Text>
              </Pressable>
            </View>
          ) : hasPermission ? (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            />
          ) : (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionTitle}>Нужен доступ к камере</Text>
              <Text style={styles.permissionText}>
                Разрешите доступ, чтобы сканировать QR-коды на картах.
              </Text>
              <Pressable style={styles.permissionButton} onPress={handleRequestPermission}>
                <Text style={styles.permissionButtonText}>Разрешить</Text>
              </Pressable>
            </View>
          )}

          {/* Scanning frame */}
          <View pointerEvents="none" style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>

          {isProcessing && (
            <View pointerEvents="none" style={styles.processingOverlay}>
              <Text style={styles.processingText}>Открываю вопрос…</Text>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Instructions */}
      <Animated.View
        entering={FadeInUp.delay(300)}
        style={[styles.instructionsCard, { backgroundColor: currentColors.background }]}
      >
        <Text style={[styles.instructionTitle, { color: currentColors.text }]}>
          Возьмите карту из {timePeriodLabel} эпохи
        </Text>
        <Text style={[styles.instructionText, { color: currentColors.textLight }]}>
          Наведите камеру на QR-код на карте. Вопрос откроется автоматически.
        </Text>
        {scanError && (
          <Text style={[styles.scanErrorText, { color: currentColors.text }]}>{scanError}</Text>
        )}
      </Animated.View>

      {/* Bottom actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 20 }]}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  viewfinder: {
    width: SCREEN_WIDTH - 80,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 20,
  },
  scanFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: SharedColors.riverLight,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: SharedColors.success,
    top: '50%',
  },
  permissionContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  manualInput: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  webVideoWrap: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  webVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  webVideoOverlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  instructionsCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanErrorText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomActions: {
    padding: 20,
  },
  simulateButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  simulateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
});
