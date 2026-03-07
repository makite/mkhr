import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const DocumentTab = () => (
  <Card>
    <CardContent className="p-12 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
        <FileText className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Document Section</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        This section will be available soon. You can save the employee now and
        add documents later.
      </p>
    </CardContent>
  </Card>
);
