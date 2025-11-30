import DatePicker from "@/components/form/components/date-picker";
import SelectEl from "@/components/form/components/select";
import TextInput from "@/components/form/components/text-input";
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
