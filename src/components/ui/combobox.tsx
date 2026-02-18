"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Search } from "lucide-react";

export interface ComboBoxOption {
  value: string;
  label: string;
}

export interface ComboBoxProps {
  options: ComboBoxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
}

export function ComboBox({
  options,
  value,
  onChange,
  placeholder = "Search or type...",
  disabled = false,
  error = false,
  icon,
  className,
  id,
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Display value: show selected label when closed, search text when open
  const displayValue = isOpen ? search : selectedOption?.label || value || "";

  // Filter options by search
  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Check if typed text matches no existing option exactly
  const isCustomValue =
    search.trim().length > 0 &&
    !options.some((opt) => opt.label.toLowerCase() === search.trim().toLowerCase());

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When opening, set search to current display text
  React.useEffect(() => {
    if (isOpen) {
      setSearch(selectedOption?.label || value || "");
      setHighlightedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll highlighted into view
  React.useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      const item = items[highlightedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  const selectOption = (opt: ComboBoxOption) => {
    onChange(opt.value);
    setSearch("");
    setIsOpen(false);
  };

  const selectCustom = () => {
    const trimmed = search.trim();
    if (trimmed) {
      onChange(trimmed);
      setSearch("");
      setIsOpen(false);
    }
  };

  // Total items in the list (filtered + possible custom)
  const totalItems = filtered.length + (isCustomValue ? 1 : 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < totalItems - 1 ? prev + 1 : 0
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : totalItems - 1
          );
        }
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          if (isCustomValue && highlightedIndex === 0) {
            selectCustom();
          } else {
            const idx = isCustomValue
              ? highlightedIndex - 1
              : highlightedIndex;
            if (filtered[idx]) {
              selectOption(filtered[idx]);
            }
          }
        } else if (isOpen && isCustomValue) {
          selectCustom();
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger / Input */}
      <div
        className={cn(
          "group flex items-center w-full rounded-lg border font-medium transition-all duration-200",
          "h-11 px-4 py-2.5 text-sm",
          "border-border/50 bg-background/80",
          "hover:border-violet-400/50 hover:bg-background",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500",
          disabled &&
            "cursor-not-allowed opacity-50 hover:border-border/50",
          error &&
            "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20 hover:border-red-400",
          isOpen && "ring-2 ring-violet-500/20 border-violet-500 bg-background"
        )}
        onClick={() => {
          if (!disabled) setIsOpen(true);
        }}
      >
        {icon && (
          <span
            className={cn(
              "mr-2.5 transition-colors duration-200",
              "text-muted-foreground/50 group-hover:text-muted-foreground",
              isOpen && "text-violet-500"
            )}
          >
            {icon}
          </span>
        )}

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            "flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50 placeholder:font-normal min-w-0"
          )}
        />

        <div
          className={cn(
            "ml-2 flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200",
            isOpen
              ? "bg-violet-500/15"
              : "bg-muted/60 group-hover:bg-violet-500/10"
          )}
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-all duration-200",
              isOpen
                ? "text-violet-500 rotate-180"
                : "text-muted-foreground group-hover:text-violet-600"
            )}
          />
        </div>
      </div>

      {/* Dropdown List */}
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
          {/* Custom value option */}
          {isCustomValue && (
            <li
              role="option"
              aria-selected={false}
              onClick={selectCustom}
              onMouseEnter={() => setHighlightedIndex(0)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors duration-100",
                highlightedIndex === 0 && "bg-violet-500/10"
              )}
            >
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate">
                Add &quot;{search.trim()}&quot;
              </span>
            </li>
          )}

          {/* Existing options */}
          {filtered.map((option, index) => {
            const listIndex = isCustomValue ? index + 1 : index;
            const isSelected = option.value === value;
            const isHighlighted = listIndex === highlightedIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setHighlightedIndex(listIndex)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors duration-100",
                  isHighlighted && "bg-violet-500/10",
                  isSelected && "text-violet-600 dark:text-violet-400"
                )}
              >
                <span
                  className={cn(
                    "flex-1 min-w-0 truncate text-sm",
                    isSelected && "font-medium"
                  )}
                >
                  {option.label}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4 text-violet-500 shrink-0" />
                )}
              </li>
            );
          })}

          {filtered.length === 0 && !isCustomValue && (
            <li className="px-3 py-6 text-sm text-muted-foreground text-center">
              No options found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
