import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";
import { useNavigate } from "react-router";

export default function PlaceholderPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="border-dashed border-2 border-gray-300">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Construction className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle className="text-2xl text-gray-700">
              Page Under Construction
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              This page is currently being developed and will be available soon.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Features coming soon:
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Comprehensive dashboard with analytics</li>
                <li>• Advanced filtering and search</li>
                <li>• Export and reporting capabilities</li>
                <li>• Real-time updates and notifications</li>
              </ul>
            </div>
            <Button 
              onClick={() => navigate("/system-admin/dashboard")}
              variant="outline"
              className="mt-6"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
