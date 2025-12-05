import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function AddGradePage() {
  return (
    <div className="w-full p-6">
      <form>
        <FieldGroup className="max-w-xl mx-auto">
          <FieldSet>
            <FieldLegend className="font-bold">Create new grade</FieldLegend>

            <FieldGroup className="grid gap-4 grid-cols-2">
              <Field>
                <FieldLabel htmlFor="grade">Grade Name</FieldLabel>
                <Input id="grade" placeholder="eg. I" required />
              </Field>
            </FieldGroup>
            <FieldGroup className="mt-4">
              <FieldSeparator />
              <div className="ml-auto flex  gap-2 items-center">
                <Button type="submit" className="bg-[#3E9E6C]">
                  Save
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
