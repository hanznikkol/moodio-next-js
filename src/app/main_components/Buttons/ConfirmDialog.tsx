"use client";

import * as React from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string
  onConfirm: () => void;
  onCancel: () => void;
  className?: string,
  confirmVariant?: "default" | "destructive" | "outline" | "secondary";
}

export function ConfirmDialog({ 
  open, 
  title, 
  description, 
  confirmLabel = "Confirm", 
  confirmVariant = "default",
  className = "",
  onConfirm, 
  onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => {if(!open) onCancel()}}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title || "Are you sure?"}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} className={className}  onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
