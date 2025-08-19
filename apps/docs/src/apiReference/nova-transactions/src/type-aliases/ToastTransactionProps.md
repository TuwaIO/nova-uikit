[**@tuwaio/nova-uikit**](../../../README.md)

***

# ToastTransactionProps\<TR, T\>

> **ToastTransactionProps**\<`TR`, `T`\> = `object` & `Pick`\<[`WalletInfoModalProps`](../interfaces/WalletInfoModalProps.md)\<`TR`, `T`\>, `"transactionsPool"`\>

Defined in: [packages/nova-transactions/src/components/ToastTransaction.tsx:49](https://github.com/TuwaIO/nova-uikit/blob/c38f885596dc568c4b7c49b3605e683fc88f4470/packages/nova-transactions/src/components/ToastTransaction.tsx#L49)

## Type declaration

### appChains

> **appChains**: `Chain`[]

An array of supported chain objects, used for displaying network information.

### className?

> `optional` **className**: `string`

Optional additional CSS classes for the toast container.

### closeToast?

> `optional` **closeToast**: `ToastContentProps`\[`"closeToast"`\]

Props from `react-toastify` to control the toast itself.

### config?

> `optional` **config**: `Config`

The wagmi config object, required for Speed Up and Cancel functionality.

### customization?

> `optional` **customization**: [`ToastTransactionCustomization`](ToastTransactionCustomization.md)\<`TR`, `T`\>

An object to customize and override the default internal components.

### icon?

> `optional` **icon**: `ReactNode`

An optional custom icon to display instead of the default chain icon.

### openWalletInfoModal()?

> `optional` **openWalletInfoModal**: (`value`) => `void`

A function to open the main wallet info modal. If not provided, the button will not be rendered.

#### Parameters

##### value

`boolean`

#### Returns

`void`

### toastProps?

> `optional` **toastProps**: `ToastContainerProps`

### tx

> **tx**: `T`

The transaction object to display in the toast.

## Type Parameters

### TR

`TR`

### T

`T` *extends* `Transaction`\<`TR`\>
