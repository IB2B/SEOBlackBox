"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
  variant?: "default" | "ghost" | "filled";
  dropdownSize?: "sm" | "md" | "lg";
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  error = false,
  icon,
  className,
  id,
  variant = "default",
  dropdownSize = "md",
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Size classes
  const sizeClasses = {
    sm: "h-9 px-3 py-1.5 text-xs",
    md: "h-11 px-4 py-2.5 text-sm",
    lg: "h-12 px-4 py-3 text-sm",
  };

  // Variant classes
  const variantClasses = {
    default: cn(
      "border-border/50 bg-background/80",
      "hover:border-violet-400/50 hover:bg-background"
    ),
    ghost: cn(
      "border-transparent bg-muted/50",
      "hover:bg-muted hover:border-border/30"
    ),
    filled: cn(
      "border-transparent bg-muted",
      "hover:bg-muted/80"
    ),
  };

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        } else {
          setIsOpen(true);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : options.length - 1
          );
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  // Reset highlighted index when opening
  React.useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, options, value]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          // Base styles
          "group flex items-center w-full rounded-lg border font-medium transition-all duration-200",
          // Size
          sizeClasses[dropdownSize],
          // Variant
          variantClasses[variant],
          // Focus ring
          "focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border/50",
          // Error state
          error && "border-red-400 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400",
          // Open state
          isOpen && "ring-2 ring-violet-500/20 border-violet-500 bg-background"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* Icon */}
        {icon && (
          <span className={cn(
            "mr-2.5 transition-colors duration-200",
            "text-muted-foreground/50 group-hover:text-muted-foreground",
            isOpen && "text-violet-500"
          )}>
            {icon}
          </span>
        )}

        {/* Selected Value */}
        <span className={cn(
          "flex-1 text-left truncate",
          !selectedOption && "text-muted-foreground/50 font-normal"
        )}>
          {selectedOption?.label || placeholder}
        </span>

        {/* Chevron */}
        <div className={cn(
          "ml-2 flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200",
          isOpen ? "bg-violet-500/15" : "bg-muted/60 group-hover:bg-violet-500/10"
        )}>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 transition-all duration-200",
            isOpen ? "text-violet-500 rotate-180" : "text-muted-foreground group-hover:text-violet-600"
          )} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className={cn(
            "absolute z-[100] w-full mt-1.5 py-1.5 rounded-lg border bg-background shadow-xl",
            "border-border/50",
            "max-h-60 overflow-auto",
            "animate-in fade-in-0 slide-in-from-top-2 duration-150"
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors duration-100",
                  isHighlighted && "bg-violet-500/10",
                  isSelected && "text-violet-600 dark:text-violet-400"
                )}
              >
                {/* Option Icon */}
                {option.icon && (
                  <span className={cn(
                    "text-muted-foreground",
                    isSelected && "text-violet-500"
                  )}>
                    {option.icon}
                  </span>
                )}

                {/* Option Content */}
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "block truncate text-sm",
                    isSelected && "font-medium"
                  )}>
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="block text-xs text-muted-foreground truncate">
                      {option.description}
                    </span>
                  )}
                </div>

                {/* Check Mark */}
                {isSelected && (
                  <Check className="w-4 h-4 text-violet-500 shrink-0" />
                )}
              </li>
            );
          })}

          {options.length === 0 && (
            <li className="px-3 py-6 text-sm text-muted-foreground text-center">
              No options available
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
