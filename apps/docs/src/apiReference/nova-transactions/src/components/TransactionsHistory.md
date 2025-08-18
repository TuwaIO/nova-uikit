[**@tuwaio/nova-uikit**](../../../README.md)

***

# TransactionsHistory()

> **TransactionsHistory**\<`TR`, `T`\>(`props`): `Element`

Defined in: [packages/nova-transactions/src/components/TransactionsHistory.tsx:54](https://github.com/TuwaIO/nova-uikit/blob/ded3074ef357f2ffaf35252f54b4c5cffd22b72b/packages/nova-transactions/src/components/TransactionsHistory.tsx#L54)

A component that displays a scrollable list of transactions for the connected wallet.
It handles states for when a wallet is not connected or when there is no history.

## Type Parameters

### TR

`TR`

### T

`T` *extends* `Transaction`\<`TR`\>

## Parameters

### props

[`WalletInfoModalProps`](../interfaces/WalletInfoModalProps.md)\<`TR`, `T`\> & `object`

## Returns

`Element`

The rendered transaction history section.
