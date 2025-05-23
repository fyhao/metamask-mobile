import type { ThemeColors, ThemeTypography } from '@metamask/design-tokens';
import Icon, {
  IconName,
  IconSize,
} from '../../../../app/component-library/components/Icons/Icon';
import React from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import Device from '../../../../app/util/device';
import { strings } from '../../../../locales/i18n';
import { useTheme } from '../../../util/theme';
import StyledButton from '../StyledButton';
import {
  getFontFamily,
  TextVariant,
} from '../../../component-library/components/Texts/Text';

interface SDKFeedbackProps {
  onConfirm: () => void;
}

const createStyles = (
  colors: ThemeColors,
  typography: ThemeTypography,
  _safeAreaInsets: EdgeInsets,
) =>
  StyleSheet.create({
    root: {
      backgroundColor: colors.background.default,
      paddingTop: 7,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      minHeight: 50,
      paddingBottom: Device.isIphoneX() ? 20 : 0,
    },
    icon: {
      alignSelf: 'center',
      color: colors.warning.default,
      lineHeight: 56,
    },
    title: {
      ...typography.lHeadingMD,
      fontFamily: getFontFamily(TextVariant.HeadingMD),
      textAlign: 'center',
    } as TextStyle,
    info: {
      padding: 20,
      ...typography.sBodyMD,
      fontFamily: getFontFamily(TextVariant.BodyMD),
    } as TextStyle,
    action: {
      marginLeft: 20,
      marginRight: 20,
      marginBottom: 20,
    },
  });

export const SDKFeedback = ({ onConfirm }: SDKFeedbackProps) => {
  const safeAreaInsets = useSafeAreaInsets();

  const { colors, typography } = useTheme();
  const styles = createStyles(colors, typography, safeAreaInsets);

  return (
    <View style={styles.root}>
      <Icon
        name={IconName.Warning}
        size={IconSize.Xl}
        color={colors.warning.default}
        style={styles.icon}
      />
      <Text style={styles.title}>{strings('sdk_feedback_modal.title')}</Text>
      <Text style={styles.info}>{strings('sdk_feedback_modal.info')}</Text>
      <View style={styles.action}>
        <StyledButton type={'confirm'} onPress={onConfirm}>
          {strings('sdk_feedback_modal.ok')}
        </StyledButton>
      </View>
    </View>
  );
};

export default SDKFeedback;
