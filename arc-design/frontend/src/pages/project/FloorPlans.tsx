import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FloorPlans() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Floor Plans (Phase 5)</h1>
          <p className="text-muted-foreground mt-1">Upload GA drawings and match zones</p>
        </div>
        <Button>Upload GA PDF</Button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="col-span-1 border-r pr-4 space-y-2 text-sm">
          <div className="font-semibold mb-4 text-primary">Unmatched Zones</div>
          <div className="p-2 border rounded-md shadow-sm bg-background">○ Z-L1-01</div>
          <div className="p-2 border rounded-md shadow-sm bg-background">○ Z-L1-02</div>
          <div className="font-semibold mt-6 mb-4 text-green-600 dark:text-green-500">Matched Zones</div>
          <div className="text-muted-foreground italic pl-2">None</div>
        </div>
        <div className="col-span-3">
          <Card className="h-[600px] flex items-center justify-center bg-muted/30 border-dashed border-2">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground font-medium">PDF Viewer (pdfjs-dist + react-konva)</div>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Upload a general arrangement PDF to map zones to the physical floor plan.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
