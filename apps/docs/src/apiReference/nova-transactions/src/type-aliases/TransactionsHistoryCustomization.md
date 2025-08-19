[**@tuwaio/nova-uikit**](../../../README.md)

***

# TransactionsHistoryCustomization\<TR, T\>

> **TransactionsHistoryCustomization**\<`TR`, `T`\> = `object`

Defined in: [packages/nova-transactions/src/components/TransactionsHistory.tsx:18](https://github.com/TuwaIO/nova-uikit/blob/6dc34b098cacf0ae15cd1e41a47f4525a2a78768/packages/nova-transactions/src/components/TransactionsHistory.tsx#L18)

Defines the customization options for the TransactionsHistory component.

## Type Parameters

### TR

`TR`

### T

`T` *extends* `Transaction`\<`TR`\>

## Properties

### classNames?

> `optional` **classNames**: `object`

Defined in: [packages/nova-transactions/src/components/TransactionsHistory.tsx:19](https://github.com/TuwaIO/nova-uikit/blob/6dc34b098cacf0ae15cd1e41a47f4525a2a78768/packages/nova-transactions/src/components/TransactionsHistory.tsx#L19)

#### listWrapper?

> `optional` **listWrapper**: `string`

CSS classes for the list's wrapper `div`.

***

### components?

> `optional` **components**: `object`

Defined in: [packages/nova-transactions/src/components/TransactionsHistory.tsx:23](https://github.com/TuwaIO/nova-uikit/blob/6dc34b098cacf0ae15cd1e41a47f4525a2a78768/packages/nova-transactions/src/components/TransactionsHistory.tsx#L23)

#### HistoryItem?

> `optional` **HistoryItem**: `ComponentType`\<[`TransactionHistoryItemProps`](TransactionHistoryItemProps.md)\<`TR`, `T`\>\>

A custom component to use instead of the default `TransactionHistoryItem`.
This should be a component type, not a render function.

#### placeholder()?

> `optional` **placeholder**: (`props`) => `ReactNode`

A render prop to replace the default placeholder component
(e.g., for "Connect Wallet" or "No Transactions").

##### Parameters

###### props

`CustomPlaceholderProps`

##### Returns

`ReactNode`
