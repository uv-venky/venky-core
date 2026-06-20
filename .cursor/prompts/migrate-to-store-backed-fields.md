# Migrate form fields to store-backed

Use this prompt in a **consuming project** (e.g. demo, metro-one-*) to migrate existing controlled form fields to store-backed (`store` + `attributeCode`). Run from the project root.

---

## Prompt (copy below)

Migrate form input fields from controlled (`value`/`onChange`) to **store-backed** (`store` + `attributeCode`) where it’s a straightforward binding. Follow the patterns in `venky-core` and the project’s `.cursor` rules/skills.

**Scope**

- Find all components that:
  - Receive a `store` prop (e.g. `Store<Entity>`)
  - Use `useCurrentRowSync(store)` and render input components from `venky-core/ui` (e.g. `TextInput`, `NumberInput`, `DateInputField`, `SelectInput`, `BooleanInput`, `TextareaInput`, `PasswordInput`) with `value={row.xxx}` and `onChange={(v) => store.setValue('xxx', v)}` (or `onValueChange`, `onSelect` for combobox/select).
- Focus on: edit forms, add/edit dialogs, and any form that binds store current row to inputs.

**Migration rules**

1. **Simple 1:1 binding**  
   Replace:
   - `value={row.fieldName ?? ''}` (or similar) + `onChange={(v) => store.setValue('fieldName', v)}`  
   with:
   - `store={store}` and `attributeCode="fieldName"`.
   - Keep other props: `label`, `required`, `disabled`, `helpText`, `labelOnTop`, `showTime` (DateInputField), etc. Do **not** pass `value`, `onChange`, or `isDirty` when using store-backed.

2. **Normalize on blur**  
   If the field is normalized (e.g. trim, lowercase for email/userName) and the **only** logic in the handler is something like `store.setValue('field', value?.trim().toLowerCase())`, migrate to store-backed and add:
   - `transformValue={(v) => v?.trim().toLowerCase() ?? undefined}` (or the equivalent for that field).
   - Use this only when the transform applies to **this attribute only** (no syncing to another field).

3. **Keep controlled when**
   - The handler syncs another field (e.g. sets `userName` when `email` changes).
   - The handler has conditional logic beyond a single transform (e.g. different `setValue` based on other state).
   - The component is not bound to the store’s current row (e.g. no `useCurrentRowSync` or different rowId).

4. **SelectInput / ComboboxInput / LookupInput**  
   Same idea: if the only thing the handler does is `store.setValue('field', v)`, use `store={store}` and `attributeCode="fieldName"`. For ComboboxInput/LookupInput, keep `options`, `getLabel`, `getValue`, `placeholder`, etc., and drop `value`/`onSelect` in favor of store-backed.

5. **BooleanInput / CheckboxInput / SwitchInput**  
   Migrate to `store={store}` and `attributeCode="fieldName"` when the handler only calls `store.setValue('fieldName', value)`.

6. **DateInputField with showTime**  
   Use `store={store}`, `attributeCode="fieldName"`, and keep `showTime` (and other props). Remove `value`/`onChange`/`isDirty`.

7. **Optional dates (null)**  
   Store-backed still works; the store holds `null`/empty. Keep `helpText` etc.; do not pass `value`/`onChange`.

**After migrating**

- Remove any manual `isDirty={store.isRowAttributeDirty(...)}` for those fields; store-backed components derive dirty state.
- Ensure the component still uses `useCurrentRowSync(store)` and early-return when `!row` (or equivalent).
- Run typecheck and lint; fix any type or prop errors.

**Do not**

- Change components that don’t receive a store or don’t bind to the current row.
- Add store-backed to fields that need custom sync or multi-field logic; leave those controlled.
- Migrate table cell editors or inline editors unless they use the same store + current row pattern and simple binding.

Apply this migration across the codebase and list the files and components you changed.
