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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router";

export default function AddEmpscalePage() {
  return (
    <div className="w-full p-6">
      <form>
        <FieldGroup className="max-w-xl mx-auto">
          <FieldSet>
            <FieldLegend className="font-bold">
              Create employee scale
            </FieldLegend>

            <FieldGroup className="grid gap-4 grid-cols-2">
              <Field>
                <FieldLabel htmlFor="grade">Grade</FieldLabel>
                <Select defaultValue="1" required>
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">I</SelectItem>
                    <SelectItem value="2">II</SelectItem>
                    <SelectItem value="3">III</SelectItem>
                    <SelectItem value="4">IV</SelectItem>
                    <SelectItem value="5">V</SelectItem>
                    <SelectItem value="6">VI</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="scale">Scale</FieldLabel>
                <Select defaultValue="1" required>
                  <SelectTrigger id="scale">
                    <SelectValue placeholder="Select Scale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="salary">Salary</FieldLabel>
                <Input id="salary" placeholder="15000" type="number" required />
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
