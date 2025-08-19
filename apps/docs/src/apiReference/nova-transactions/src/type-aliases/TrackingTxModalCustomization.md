[**@tuwaio/nova-uikit**](../../../README.md)

***

# TrackingTxModalCustomization\<TR, T\>

> **TrackingTxModalCustomization**\<`TR`, `T`\> = `object`

Defined in: [packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx:50](https://github.com/TuwaIO/nova-uikit/blob/c38f885596dc568c4b7c49b3605e683fc88f4470/packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx#L50)

Defines the customization options for the TrackingTxModal.
Allows overriding modal behavior, animations, and individual UI components.

## Type Parameters

### TR

`TR`

### T

`T` *extends* `Transaction`\<`TR`\>

## Properties

### components?

> `optional` **components**: `object`

Defined in: [packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx:56](https://github.com/TuwaIO/nova-uikit/blob/c38f885596dc568c4b7c49b3605e683fc88f4470/packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx#L56)

A record of custom components to override parts of the modal's UI.

#### errorBlock()?

> `optional` **errorBlock**: (`props`) => `ReactNode`

##### Parameters

###### props

[`TxErrorBlockProps`](TxErrorBlockProps.md)

##### Returns

`ReactNode`

#### footer()?

> `optional` **footer**: (`props`) => `ReactNode`

##### Parameters

###### props

`CustomFooterProps`

##### Returns

`ReactNode`

#### header()?

> `optional` **header**: (`props`) => `ReactNode`

##### Parameters

###### props

`CustomHeaderProps`

##### Returns

`ReactNode`

#### infoBlock()?

> `optional` **infoBlock**: (`props`) => `ReactNode`

##### Parameters

###### props

[`TxInfoBlockProps`](TxInfoBlockProps.md)\<`TR`, `T`\>

##### Returns

`ReactNode`

#### progressIndicator()?

> `optional` **progressIndicator**: (`props`) => `ReactNode`

##### Parameters

###### props

[`TxProgressIndicatorProps`](../interfaces/TxProgressIndicatorProps.md)

##### Returns

`ReactNode`

#### statusVisual()?

> `optional` **statusVisual**: (`props`) => `ReactNode`

##### Parameters

###### props

[`TxStatusVisualProps`](TxStatusVisualProps.md)

##### Returns

`ReactNode`

***

### modalProps?

> `optional` **modalProps**: `Partial`\<`ComponentPropsWithoutRef`\<*typeof* `Dialog.Content`\>\>

Defined in: [packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx:52](https://github.com/TuwaIO/nova-uikit/blob/c38f885596dc568c4b7c49b3605e683fc88f4470/packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx#L52)

Custom props to pass to the underlying Radix UI `Dialog.Content` component.

***

### motionProps?

> `optional` **motionProps**: `MotionProps`

Defined in: [packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx:54](https://github.com/TuwaIO/nova-uikit/blob/c38f885596dc568c4b7c49b3605e683fc88f4470/packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx#L54)

Custom Framer Motion animation properties for the modal's entrance and exit.
