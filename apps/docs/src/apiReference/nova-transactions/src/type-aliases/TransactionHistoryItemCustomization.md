[**@tuwaio/nova-uikit**](../../../README.md)

***

# TransactionHistoryItemCustomization\<TR, T\>

> **TransactionHistoryItemCustomization**\<`TR`, `T`\> = `object`

Defined in: [packages/nova-transactions/src/components/TransactionHistoryItem.tsx:32](https://github.com/TuwaIO/nova-uikit/blob/c38f885596dc568c4b7c49b3605e683fc88f4470/packages/nova-transactions/src/components/TransactionHistoryItem.tsx#L32)

Defines the structure for the `customization` prop, allowing users to override
default sub-components with their own implementations for a history item.

## Type Parameters

### TR

`TR`

### T

`T` *extends* `Transaction`\<`TR`\>

## Properties

### components?

> `optional` **components**: `object`

Defined in: [packages/nova-transactions/src/components/TransactionHistoryItem.tsx:33](https://github.com/TuwaIO/nova-uikit/blob/c38f885596dc568c4b7c49b3605e683fc88f4470/packages/nova-transactions/src/components/TransactionHistoryItem.tsx#L33)

#### description()?

> `optional` **description**: (`props`) => `ReactNode`

Override the default description component.

##### Parameters

###### props

`CustomStatusAwareTextProps`

##### Returns

`ReactNode`

#### icon()?

> `optional` **icon**: (`props`) => `ReactNode`

Override the default chain icon.

##### Parameters

###### props

`CustomIconProps`

##### Returns

`ReactNode`

#### statusBadge()?

> `optional` **statusBadge**: (`props`) => `ReactNode`

Override the default status badge component.

##### Parameters

###### props

`CustomStatusBadgeProps`\<`TR`, `T`\>

##### Returns

`ReactNode`

#### timestamp()?

> `optional` **timestamp**: (`props`) => `ReactNode`

Override the default timestamp component.

##### Parameters

###### props

`CustomTimestampProps`

##### Returns

`ReactNode`

#### title()?

> `optional` **title**: (`props`) => `ReactNode`

Override the default title component.

##### Parameters

###### props

`CustomStatusAwareTextProps`

##### Returns

`ReactNode`

#### transactionKey()?

> `optional` **transactionKey**: (`props`) => `ReactNode`

Override the default component for displaying transaction keys/hashes.

##### Parameters

###### props

`CustomTransactionKeyProps`\<`TR`, `T`\>

##### Returns

`ReactNode`
