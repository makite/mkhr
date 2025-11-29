import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "../components/ui/textarea";
import { Link } from "react-router";

export default function AddPositionPage() {
  return (
    <div className="w-full p-6">
      <form>
        <FieldGroup className="max-w-xl mx-auto">
          <FieldSet>
            <FieldLegend className="font-bold">Create new postion</FieldLegend>

            <FieldGroup className="grid gap-4 grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Position Name</FieldLabel>
                <Input id="name" placeholder="Developer" required />
              </Field>
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
                <FieldLabel htmlFor="rank">Rank</FieldLabel>
                <Input id="rank" placeholder="10" type="number" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="salary">Salary</FieldLabel>
                <Input
                  id="salary"
                  placeholder="15,000"
                  type="number"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Add any Description about the position"
                  className="resize-none"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category">Postion Category</FieldLabel>
                <Select defaultValue="IT" required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select postion category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="LIMAT">LIMAT</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex">
                <Checkbox id="is_active" />
                <FieldLabel htmlFor="is_active" className="ml-2">
                  Is Active
                </FieldLabel>
              </div>
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
