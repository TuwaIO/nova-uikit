[**@tuwaio/nova-uikit**](../../../README.md)

***

# WalletInfoModal()

> **WalletInfoModal**\<`TR`, `T`\>(`props`): `null` \| `Element`

Defined in: [packages/nova-transactions/src/components/WalletInfoModal/WalletInfoModal.tsx:69](https://github.com/TuwaIO/nova-uikit/blob/c42b60dded49bd6a07eb5a3854c09ac76349f6d8/packages/nova-transactions/src/components/WalletInfoModal/WalletInfoModal.tsx#L69)

The main modal component for displaying wallet information and transaction history.
It is highly customizable through the `customization` prop and supports full Radix UI Dialog customization.

## Type Parameters

### TR

`TR`

### T

`T` *extends* `Transaction`\<`TR`\>

## Parameters

### props

[`WalletInfoModalProps`](../interfaces/WalletInfoModalProps.md)\<`TR`, `T`\> & `object`

The component props.

## Returns

`null` \| `Element`

The rendered modal or null if not open.
