[**@tuwaio/nova-uikit**](../../../README.md)

***

# TxActions

> **TxActions** = `Record`\<`string`, (...`args`) => `Promise`\<`unknown`\>\>

Defined in: [packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx:44](https://github.com/TuwaIO/nova-uikit/blob/c38f885596dc568c4b7c49b3605e683fc88f4470/packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx#L44)

A registry of functions that can be re-executed via the 'Retry' button. The key should match `actionKey` on a transaction.
