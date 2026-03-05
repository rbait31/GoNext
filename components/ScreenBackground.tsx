/**
 * Обёртка экрана: при светлой теме — ImageBackground,
 * при тёмной — View (без фонового изображения)
 */

import { View, ImageBackground, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { BACKGROUND_IMAGE } from '@/lib/backgroundAsset';

type Props = {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export function ScreenBackground({ style, children }: Props) {
  const theme = useTheme();

  if (theme.dark) {
    return (
      <View
        style={[
          { flex: 1, backgroundColor: theme.colors.background },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={[{ flex: 1 }, style]}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}
