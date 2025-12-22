import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Platform, Text, type StyleProp, type TextStyle } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type WebSymbolName =
  | 'arrow_back'
  | 'chat_bubble_outline'
  | 'swap_horiz'
  | 'close'
  | 'hourglass_empty'
  | 'auto_awesome'
  | 'photo_camera'
  | 'home'
  | 'send'
  | 'code'
  | 'chevron_right'
  | 'help';

const WEB_MAPPING: Partial<Record<IoniconName, WebSymbolName>> = {
  'chevron-back': 'arrow_back',
  'chatbubble-outline': 'chat_bubble_outline',
  'swap-horizontal-outline': 'swap_horiz',
  close: 'close',
  'hourglass-outline': 'hourglass_empty',
  'sparkles-outline': 'auto_awesome',
  'camera-outline': 'photo_camera',
};

export function AppIcon({
  name,
  size = 24,
  color,
  style,
}: {
  name: IoniconName;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
}) {
  if (Platform.OS === 'web') {
    const symbolName: WebSymbolName = WEB_MAPPING[name] ?? 'help';
    return (
      <Text
        style={[
          {
            fontFamily: 'Material Symbols Outlined',
            fontSize: size,
            color,
            fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' ${Math.round(size)}`,
          },
          style,
        ]}
      >
        {symbolName}
      </Text>
    );
  }

  return <Ionicons color={color} size={size} name={name} style={style} />;
}
