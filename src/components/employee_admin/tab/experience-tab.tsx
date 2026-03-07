import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export const ExperienceTab = () => (
  <Card>
    <CardContent className="p-12 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
        <GraduationCap className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Experience Section</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        This section will be available soon. You can save the employee now and
        add experience details later.
      </p>
    </CardContent>
  </Card>
);
