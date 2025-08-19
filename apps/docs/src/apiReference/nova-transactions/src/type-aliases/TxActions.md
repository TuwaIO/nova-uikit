[**@tuwaio/nova-uikit**](../../../README.md)

***

# TxActions

> **TxActions** = `Record`\<`string`, (...`args`) => `Promise`\<`unknown`\>\>

Defined in: [packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx:44](https://github.com/TuwaIO/nova-uikit/blob/6dc34b098cacf0ae15cd1e41a47f4525a2a78768/packages/nova-transactions/src/components/TrackingTxModal/TrackingTxModal.tsx#L44)

A registry of functions that can be re-executed via the 'Retry' button. The key should match `actionKey` on a transaction.
