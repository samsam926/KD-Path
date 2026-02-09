import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function AddVisitDialog({
  currentPatient,
  clinicalParameters,
  handleAddVisit,
}: {
  currentPatient: any
  clinicalParameters: any[]
  handleAddVisit: () => void
}) {
  const [showAddVisitDialog, setShowAddVisitDialog] = useState(false)
  const [newVisitData, setNewVisitData] = useState<Record<string, string>>({})

  return (
    <div>
      {/* Add Visit Dialog */}
      <Dialog open={showAddVisitDialog} onOpenChange={setShowAddVisitDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Visit for {currentPatient?.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="col-span-3">
              <Label htmlFor="visitDate">Visit Date</Label>
              <Input
                id="visitDate"
                type="date"
                value={
                  newVisitData.visitDate ||
                  new Date().toISOString().split("T")[0]
                }
                onChange={(e) =>
                  setNewVisitData((prev) => ({
                    ...prev,
                    visitDate: e.target.value,
                  }))
                }
              />
            </div>

            {clinicalParameters.map((param) => (
              <div key={param.key}>
                <Label htmlFor={param.key}>
                  {param.label} {param.unit && `(${param.unit})`}
                </Label>
                <Input
                  id={param.key}
                  type="number"
                  step="0.1"
                  placeholder={`${param.normalRange.min}-${param.normalRange.max}`}
                  value={newVisitData[param.key] || ""}
                  onChange={(e) =>
                    setNewVisitData((prev) => ({
                      ...prev,
                      [param.key]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}

            <div className="col-span-3">
              <Label htmlFor="notes">Clinical Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter clinical observations and notes..."
                value={newVisitData.notes || ""}
                onChange={(e) =>
                  setNewVisitData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddVisitDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddVisit}>Add Visit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
