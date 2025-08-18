[**@tuwaio/nova-uikit**](../../../README.md)

***

# TxActions

> **TxActions** = `Record`\<`string`, (...`args`) => `Promise`\<`unknown`\>\>

Defined in: [packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx:44](https://github.com/TuwaIO/nova-uikit/blob/ded3074ef357f2ffaf35252f54b4c5cffd22b72b/packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx#L44)

A registry of functions that can be re-executed via the 'Retry' button. The key should match `actionKey` on a transaction.
