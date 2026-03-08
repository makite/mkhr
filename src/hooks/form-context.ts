import DatePicker from "@/components/form/date-picker";
import SelectEl from "@/components/form/select";
import TextInput from "@/components/form/text-input";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext: fieldContext,
  formContext: formContext,
  fieldComponents: {
    TextInput: TextInput,
    DatePicker: DatePicker,
    SelectEl: SelectEl,
  },
  formComponents: {},
});
