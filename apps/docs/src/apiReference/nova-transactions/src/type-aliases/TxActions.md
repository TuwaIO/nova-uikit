[**@tuwaio/nova-uikit**](../../../README.md)

***

# TxActions

> **TxActions** = `Record`\<`string`, (...`args`) => `Promise`\<`unknown`\>\>

Defined in: [packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx:44](https://github.com/TuwaIO/nova-uikit/blob/c42b60dded49bd6a07eb5a3854c09ac76349f6d8/packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx#L44)

A registry of functions that can be re-executed via the 'Retry' button. The key should match `actionKey` on a transaction.
