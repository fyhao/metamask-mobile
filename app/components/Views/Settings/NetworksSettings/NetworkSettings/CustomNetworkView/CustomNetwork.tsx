import React, { memo } from 'react';
import NetworkModals from '../../../../../UI/NetworkModal';
import { View, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import WarningIcon from 'react-native-vector-icons/FontAwesome';
import { toHex } from '@metamask/controller-utils';
import CustomText from '../../../../../Base/Text';
import EmptyPopularList from '../emptyList';
import { useNavigation } from '@react-navigation/native';
import { strings } from '../../../../../../../locales/i18n';
import { useTheme } from '../../../../../../util/theme';
import { PopularList } from '../../../../../../util/networks/customNetworks';
import createStyles from '../styles';
import { CustomNetworkProps, Network } from './CustomNetwork.types';
import {
  selectChainId,
  selectNetworkConfigurations,
} from '../../../../../../selectors/networkController';
import AvatarNetwork from '../../../../../../component-library/components/Avatars/Avatar/variants/AvatarNetwork';
import { AvatarSize } from '../../../../../../component-library/components/Avatars/Avatar';
import { isNetworkUiRedesignEnabled } from '../../../../../../util/networks/isNetworkUiRedesignEnabled';
import { useSafeChains } from '../../../../../../components/hooks/useSafeChains';
import { isNonEvmChainId } from '../../../../../../core/Multichain/utils';
import { NetworkConfiguration } from '@metamask/network-controller';
import { MultichainNetworkConfiguration } from '@metamask/multichain-network-controller';

const CustomNetwork = ({
  showPopularNetworkModal,
  isNetworkModalVisible,
  closeNetworkModal,
  selectedNetwork,
  toggleWarningModal,
  showNetworkModal,
  switchTab,
  shouldNetworkSwitchPopToWallet,
  onNetworkSwitch,
  showAddedNetworks,
  customNetworksList,
  displayContinue,
  showCompletionMessage = true,
  hideWarningIcons = false,
}: CustomNetworkProps) => {
  const networkConfigurations = useSelector(selectNetworkConfigurations);
  const selectedChainId = useSelector(selectChainId);
  const { safeChains } = useSafeChains();
  const supportedNetworkList = (customNetworksList ?? PopularList).map(
    (networkConfiguration: Network) => {
      const isAdded = Object.values(networkConfigurations).some(
        (
          savedNetwork: NetworkConfiguration | MultichainNetworkConfiguration,
        ) => {
          if (
            isNonEvmChainId(networkConfiguration.chainId) ||
            isNonEvmChainId(savedNetwork.chainId) ||
            ('isEvm' in savedNetwork && savedNetwork.isEvm === false)
          ) {
            return false;
          }

          return (
            toHex(savedNetwork.chainId) === toHex(networkConfiguration.chainId)
          );
        },
      );
      return {
        ...networkConfiguration,
        isAdded,
      };
    },
  );

  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = createStyles();
  const filteredPopularList = showAddedNetworks
    ? supportedNetworkList
    : supportedNetworkList.filter((n) => !n.isAdded);

  if (filteredPopularList.length === 0 && showCompletionMessage) {
    return (
      <EmptyPopularList goToCustomNetwork={() => switchTab?.goToPage?.(1)} />
    );
  }

  return (
    <>
      {isNetworkModalVisible && (
        <NetworkModals
          showPopularNetworkModal={showPopularNetworkModal}
          isVisible={isNetworkModalVisible}
          onClose={closeNetworkModal}
          networkConfiguration={selectedNetwork}
          navigation={navigation}
          shouldNetworkSwitchPopToWallet={shouldNetworkSwitchPopToWallet}
          onNetworkSwitch={onNetworkSwitch}
          safeChains={safeChains}
        />
      )}
      {filteredPopularList.map((networkConfiguration, index) => (
        <TouchableOpacity
          key={index}
          style={styles.popularNetwork}
          onPress={() => showNetworkModal(networkConfiguration)}
        >
          <View style={styles.popularWrapper}>
            <View style={styles.popularNetworkImage}>
              <AvatarNetwork
                name={networkConfiguration.nickname}
                size={AvatarSize.Sm}
                imageSource={
                  networkConfiguration.rpcPrefs.imageSource ||
                  (networkConfiguration.rpcPrefs.imageUrl
                    ? {
                        uri: networkConfiguration.rpcPrefs.imageUrl,
                      }
                    : undefined)
                }
              />
            </View>
            <CustomText bold={!isNetworkUiRedesignEnabled()}>
              {networkConfiguration.nickname}
            </CustomText>
          </View>
          <View style={styles.popularWrapper}>
            {!hideWarningIcons &&
            toggleWarningModal &&
            networkConfiguration.warning ? (
              <WarningIcon
                name="warning"
                size={14}
                color={colors.icon.alternative}
                style={styles.icon}
                onPress={toggleWarningModal}
              />
            ) : null}
            {displayContinue &&
            networkConfiguration.chainId === selectedChainId ? (
              <CustomText link>{strings('networks.continue')}</CustomText>
            ) : (
              <CustomText link>
                {networkConfiguration.isAdded
                  ? strings('networks.switch')
                  : strings('networks.add')}
              </CustomText>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
};

export default memo(CustomNetwork);
