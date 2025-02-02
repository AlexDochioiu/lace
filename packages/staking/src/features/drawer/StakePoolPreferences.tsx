import { Wallet } from '@lace/cardano';
import { Button, ControlButton, Flex, PIE_CHART_DEFAULT_COLOR_SET, PieChartColor, Text } from '@lace/ui';
import { useTranslation } from 'react-i18next';
import { useOutsideHandles } from '../outside-handles-provider';
import { DelegationCard } from '../overview/DelegationCard';
import { MAX_POOLS_COUNT, useDelegationPortfolioStore } from '../store';
import { PoolDetailsCard } from './PoolDetailsCard';

export const StakePoolPreferencesFooter = () => {
  const { t } = useTranslation();
  const portfolioMutators = useDelegationPortfolioStore((store) => store.mutators);

  return (
    <Flex flexDirection="column" alignItems="stretch" gap="$16">
      <Button.CallToAction
        label={t('drawer.preferences.nextButton')}
        data-testid="preferences-next-button"
        onClick={() =>
          portfolioMutators.executeCommand({
            type: 'DrawerContinue',
          })
        }
        w="$fill"
      />
    </Flex>
  );
};

// eslint-disable-next-line react/no-multi-comp
export const StakePoolPreferences = () => {
  const { t } = useTranslation();
  const {
    balancesBalance,
    walletStoreWalletUICardanoCoin: { symbol },
    compactNumber,
  } = useOutsideHandles();
  const { draftPortfolio, portfolioMutators } = useDelegationPortfolioStore((state) => ({
    activeDrawerStep: state.activeDrawerStep,
    draftPortfolio: state.draftPortfolio || [],
    portfolioMutators: state.mutators,
  }));

  const displayData = draftPortfolio.map(({ name = '-', weight, id }, i) => ({
    color: PIE_CHART_DEFAULT_COLOR_SET[i] as PieChartColor,
    id,
    name,
    weight,
  }));
  const createRemovePoolFromPortfolio = (poolId: Wallet.Cardano.PoolIdHex) => () => {
    portfolioMutators.executeCommand({
      data: poolId,
      type: 'RemoveStakePool',
    });
  };
  const addPoolButtonDisabled = draftPortfolio.length === MAX_POOLS_COUNT;
  const onAddPoolButtonClick = () => {
    portfolioMutators.executeCommand({
      type: 'AddStakePools',
    });
  };

  return (
    <Flex flexDirection="column" gap="$32" alignItems="stretch">
      <DelegationCard
        balance={compactNumber(balancesBalance?.available?.coinBalance || '0')}
        cardanoCoinSymbol={symbol}
        distribution={displayData}
        status="ready"
        showDistribution
      />
      <Flex justifyContent="space-between">
        <Text.Body.Large weight="$semibold">
          {t('drawer.preferences.selectedStakePools', { count: draftPortfolio.length })}
        </Text.Body.Large>
        <ControlButton.Small
          label={t('drawer.preferences.addPoolButton')}
          onClick={onAddPoolButtonClick}
          disabled={addPoolButtonDisabled}
        />
      </Flex>
      <Flex flexDirection="column" gap="$16" pb="$32" alignItems="stretch">
        {displayData.map(({ name, id, color, weight }) => (
          <PoolDetailsCard
            key={id}
            name={name}
            color={color}
            weight={weight}
            onRemove={draftPortfolio.length > 1 ? createRemovePoolFromPortfolio(id) : undefined}
          />
        ))}
      </Flex>
    </Flex>
  );
};
