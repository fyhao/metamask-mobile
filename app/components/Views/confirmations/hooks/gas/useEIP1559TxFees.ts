import { useMemo } from 'react';
import { TransactionMeta } from '@metamask/transaction-controller';

import { hexToDecimal } from '../../../../../util/conversions';

export const useEIP1559TxFees = (
  transactionMeta: TransactionMeta,
): {
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
} => {
  const hexMaxFeePerGas = transactionMeta?.txParams?.maxFeePerGas;
  const hexMaxPriorityFeePerGas =
    transactionMeta?.txParams?.maxPriorityFeePerGas;

  return useMemo(() => {
    const maxFeePerGas = hexMaxFeePerGas
      ? hexToDecimal(hexMaxFeePerGas).toString()
      : '0';
    const maxPriorityFeePerGas = hexMaxPriorityFeePerGas
      ? hexToDecimal(hexMaxPriorityFeePerGas).toString()
      : '0';

    return { maxFeePerGas, maxPriorityFeePerGas };
  }, [hexMaxFeePerGas, hexMaxPriorityFeePerGas]);
};
