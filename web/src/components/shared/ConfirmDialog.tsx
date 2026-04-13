import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, variant = "danger" }: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80">
        <div className={`px-6 py-5 ${isDanger ? "bg-gradient-to-r from-[#4a1a1a] via-[#3e1616] to-[#601a0f]" : "bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460]"}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDanger ? "bg-red-500/20" : "bg-amber-500/20"}`}>
              {isDanger ? <Trash2 className="h-6 w-6 text-red-400" /> : <AlertTriangle className="h-6 w-6 text-amber-400" />}
            </div>
            <div>
              <DialogHeader className="p-0 space-y-0">
                <DialogTitle className="text-white text-lg font-bold">{title}</DialogTitle>
                <DialogDescription className="text-white/60 text-sm mt-0.5">{description}</DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="px-6 pt-4 pb-5">
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false); }}>Confirmar</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
