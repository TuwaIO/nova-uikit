[**@tuwaio/nova-uikit**](../../../README.md)

***

# TransactionKey()

> **TransactionKey**\<`TR`, `T`\>(`props`): `null` \| `Element`

Defined in: [packages/nova-transactions/src/components/TransactionKey.tsx:43](https://github.com/TuwaIO/nova-uikit/blob/c42b60dded49bd6a07eb5a3854c09ac76349f6d8/packages/nova-transactions/src/components/TransactionKey.tsx#L43)

A component that intelligently displays the relevant keys and hashes for a transaction.
It handles different tracker types (EVM, Gelato, Safe) and statuses (e.g., replaced transactions).

## Type Parameters

### TR

`TR`

### T

`T` *extends* `Transaction`\<`TR`\>

## Parameters

### props

[`ToastTransactionKeyProps`](../interfaces/ToastTransactionKeyProps.md)\<`TR`, `T`\>

The component props.

## Returns

`null` \| `Element`

The rendered component.
