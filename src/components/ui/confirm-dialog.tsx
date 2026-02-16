"use client";

import React, { useState, useCallback, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmDialogOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef?.(false);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleCancel}
        >
          <div
            className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl border animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="p-6 text-center">
              {/* Icon */}
              <div
                className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                  options.variant === "destructive"
                    ? "bg-red-100 dark:bg-red-900/20"
                    : "bg-amber-100 dark:bg-amber-900/20"
                }`}
              >
                {options.icon || (
                  options.variant === "destructive" ? (
                    <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                  )
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold mb-2">{options.title}</h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-6">{options.description}</p>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleCancel}>
                  {options.cancelLabel || "Cancel"}
                </Button>
                <Button
                  variant={options.variant === "destructive" ? "destructive" : "default"}
                  onClick={handleConfirm}
                >
                  {options.confirmLabel || "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  }
  return context.confirm;
}

/**
 * Standalone confirmation dialog component
 */
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl border animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="p-6 text-center">
          <div
            className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              variant === "destructive"
                ? "bg-red-100 dark:bg-red-900/20"
                : "bg-amber-100 dark:bg-amber-900/20"
            }`}
          >
            {variant === "destructive" ? (
              <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{description}</p>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
