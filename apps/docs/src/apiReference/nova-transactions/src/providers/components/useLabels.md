[**@tuwaio/nova-uikit**](../../../../README.md)

***

# useLabels()

> **useLabels**(): [`TuwaLabels`](../../type-aliases/TuwaLabels.md)

Defined in: [packages/nova-transactions/src/providers/LabelsProvider.tsx:42](https://github.com/TuwaIO/nova-uikit/blob/ded3074ef357f2ffaf35252f54b4c5cffd22b72b/packages/nova-transactions/src/providers/LabelsProvider.tsx#L42)

A custom hook to easily access the i18n labels from any component
within the `LabelsProvider` tree.

## Returns

[`TuwaLabels`](../../type-aliases/TuwaLabels.md)

The complete object of UI labels.

## Example

```ts
const MyComponent = () => {
const labels = useLabels();
return <h1>{labels.walletModal.title}</h1>;
}
```
