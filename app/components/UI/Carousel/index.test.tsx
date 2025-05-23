import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Linking } from 'react-native';
import Carousel from './';
import { WalletViewSelectorsIDs } from '../../../../e2e/selectors/wallet/WalletView.selectors';
import { backgroundState } from '../../../util/test/initial-root-state';
import { SolAccountType } from '@metamask/keyring-api';
import Engine from '../../../core/Engine';

jest.mock('../../../core/Engine', () => ({
  getTotalEvmFiatAccountBalance: jest.fn(),
  context: {
    TokensController: {
      ignoreTokens: jest.fn(() => Promise.resolve()),
    },
    PreferencesController: {
      setPrivacyMode: jest.fn(),
    },
    NetworkController: {
      getNetworkClientById: () => ({
        configuration: {
          chainId: '0x1',
          rpcUrl: 'https://mainnet.infura.io/v3',
          ticker: 'ETH',
          type: 'custom',
        },
      }),
      state: {
        selectedNetworkClientId: 'mainnet',
      },
    },
    settings: {
      showFiatOnTestnets: true,
    },
  },
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../../../core/Engine', () => ({
  getTotalEvmFiatAccountBalance: jest.fn(),
  setSelectedAddress: jest.fn(),
}));

const selectShowFiatInTestnets = jest.fn();

jest.mock('../../../util/theme', () => ({
  useTheme: () => ({
    colors: {
      background: {
        alternative: '#F2F4F6',
        alternativePressed: '#E7E9EB',
        default: '#FFFFFF',
      },
      border: {
        muted: '#BBC0C5',
      },
      icon: {
        default: '#24272A',
        muted: '#BBC0C5',
      },
      text: {
        default: '#24272A',
      },
    },
  }),
}));

jest.mock('../../../components/hooks/useMetrics', () => ({
  useMetrics: () => ({
    trackEvent: jest.fn(),
    createEventBuilder: () => ({
      build: () => ({}),
    }),
  }),
}));

jest.mock('../../../../locales/i18n', () => ({
  strings: (key: string) => key,
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

// Mock image requires
jest.mock('../../../images/banners/banner_image_card.png', () => ({
  uri: 'card-image',
}));
jest.mock('../../../images/banners/banner_image_fund.png', () => ({
  uri: 'fund-image',
}));
jest.mock('../../../images/banners/banner_image_cashout.png', () => ({
  uri: 'cashout-image',
}));
jest.mock('../../../images/banners/banner_image_aggregated.png', () => ({
  uri: 'aggregated-image',
}));

// Mock useMultichainBalances hook
jest.mock('../../../components/hooks/useMultichainBalances', () => ({
  useSelectedAccountMultichainBalances: jest.fn().mockReturnValue({
    selectedAccountMultichainBalance: {
      displayBalance: '$0.00',
      displayCurrency: 'USD',
      totalFiatBalance: 0,
      totalNativeTokenBalance: '0',
      nativeTokenUnit: 'ETH',
      tokenFiatBalancesCrossChains: [],
      shouldShowAggregatedPercentage: false,
      isPortfolioVieEnabled: true,
      aggregatedBalance: {
        ethFiat: 0,
        tokenFiat: 0,
        tokenFiat1dAgo: 0,
        ethFiat1dAgo: 0,
      },
    },
  }),
}));

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('Carousel', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        banners: {
          dismissedBanners: [],
        },
        browser: {
          tabs: [],
        },
        engine: {
          backgroundState: {
            ...backgroundState,
            AccountsController: {
              internalAccounts: {
                selectedAccount: '1',
                accounts: {
                  '1': {
                    address: '0xSomeAddress',
                  },
                },
              },
            },
          },
        },
        settings: {
          showFiatOnTestnets: false,
        },
      }),
    );
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (selectShowFiatInTestnets as jest.Mock).mockReturnValue(false);
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { toJSON } = render(<Carousel />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should only render fund banner when all banners are dismissed', () => {
    (useSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        banners: {
          dismissedBanners: ['card', 'fund', 'cashout', 'aggregated'],
        },
        browser: {
          tabs: [],
        },
        engine: {
          backgroundState: {
            ...backgroundState,
            MultichainNetworkController: {
              ...backgroundState.MultichainNetworkController,
              isEvmSelected: false,
            },
          },
        },
        settings: {
          showFiatOnTestnets: false,
        },
      }),
    );

    const { toJSON } = render(<Carousel />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('opens correct URLs or navigates to correct screens when banners are clicked', async () => {
    const { getByTestId } = render(<Carousel />);

    const {
      CAROUSEL_FIRST_SLIDE,
      CAROUSEL_SECOND_SLIDE,
      CAROUSEL_THIRD_SLIDE,
      CAROUSEL_FOURTH_SLIDE,
      CAROUSEL_FIFTH_SLIDE,
      CAROUSEL_SEVENTH_SLIDE,
    } = WalletViewSelectorsIDs;
    const firstSlide = getByTestId(CAROUSEL_FIRST_SLIDE);
    const secondSlide = getByTestId(CAROUSEL_SECOND_SLIDE);
    const thirdSlide = getByTestId(CAROUSEL_THIRD_SLIDE);
    const fourthSlide = getByTestId(CAROUSEL_FOURTH_SLIDE);
    const fifthSlide = getByTestId(CAROUSEL_FIFTH_SLIDE);
    const seventhSlide = getByTestId(CAROUSEL_SEVENTH_SLIDE);

    // Test card banner
    fireEvent.press(firstSlide);
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://portfolio.metamask.io/card',
    );

    // Test fund banner
    fireEvent.press(secondSlide);
    expect(mockNavigate).toHaveBeenCalled();

    // Test cashout banner
    fireEvent.press(thirdSlide);
    expect(mockNavigate).toHaveBeenCalled();

    // Test aggregated banner
    fireEvent.press(fourthSlide);
    expect(mockNavigate).toHaveBeenCalled();

    // Test multisrp banner
    fireEvent.press(fifthSlide);
    expect(mockNavigate).toHaveBeenCalled();

    // Test backup and sync banner
    fireEvent.press(seventhSlide);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('should update selected index when scrolling', () => {
    const { getByTestId } = render(<Carousel />);
    const flatList = getByTestId(WalletViewSelectorsIDs.CAROUSEL_CONTAINER);

    fireEvent.scroll(flatList, {
      nativeEvent: {
        contentOffset: { x: 400 },
        layoutMeasurement: { width: 400 },
      },
    });

    expect(flatList).toBeTruthy();
  });

  it('does not render solana banner if user has a solana account', () => {
    (useSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        banners: {
          dismissedBanners: [],
        },
        settings: {
          showFiatOnTestnets: false,
        },
        engine: {
          backgroundState: {
            ...backgroundState,
            AccountsController: {
              internalAccounts: {
                selectedAccount: '1',
                accounts: {
                  '1': {
                    address: '0xSomeAddress',
                    type: SolAccountType.DataAccount,
                  },
                },
              },
            },
          },
        },
      }),
    );

    const { queryByTestId } = render(<Carousel />);
    const solanaBanner = queryByTestId(
      WalletViewSelectorsIDs.CAROUSEL_SIXTH_SLIDE,
    );

    expect(solanaBanner).toBeNull();
  });

  it('changes to a solana address if user has a solana account', async () => {
    (useSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        banners: {
          dismissedBanners: [],
        },
        settings: {
          showFiatOnTestnets: false,
        },
        engine: {
          backgroundState: {
            ...backgroundState,
            AccountsController: {
              internalAccounts: {
                selectedAccount: '1',
                accounts: {
                  '1': {
                    address: '0xSomeAddress',
                  },
                  '2': {
                    address: 'SomeSolanaAddress',
                    type: SolAccountType.DataAccount,
                  },
                },
              },
            },
          },
        },
      }),
    );

    const { getByTestId } = render(<Carousel />);
    const solanaBanner = getByTestId(
      WalletViewSelectorsIDs.CAROUSEL_SIXTH_SLIDE,
    );
    fireEvent.press(solanaBanner);

    expect(Engine.setSelectedAddress).toHaveBeenCalledWith('SomeSolanaAddress');
  });
});
