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
import { Link } from "react-router";

export default function AddScalePage() {
  return (
    <div className="w-full p-6">
      <form>
        <FieldGroup className="max-w-xl mx-auto">
          <FieldSet>
            <FieldLegend className="font-bold">Create new scale</FieldLegend>

            <FieldGroup className="grid gap-4 grid-cols-2">
              <Field>
                <FieldLabel htmlFor="grade">Scale Name</FieldLabel>
                <Input id="grade" placeholder="eg. 1" required />
              </Field>
            </FieldGroup>
            <FieldGroup className="mt-4">
              <FieldSeparator />
              <div className="ml-auto flex  gap-2 items-center">
                <Button type="submit" className="bg-[#3E9E6C]">
                  Save
                </Button>
                <Link to="/hr/settings">
                  <Button variant="outline" className="ml-2">
                    Cancel
                  </Button>
                </Link>
              </div>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
