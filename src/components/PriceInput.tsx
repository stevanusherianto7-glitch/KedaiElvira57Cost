import * as React from "react";
import { Input } from "@/components/ui/input";

export const PriceInput = ({ value, onChange, className, placeholder, onFocus, onBlur }: { value: number | undefined, onChange: (val: number) => void, className?: string, placeholder?: string, onFocus?: () => void, onBlur?: () => void }) => {
  const [displayValue, setDisplayValue] = React.useState(value ? value.toLocaleString('id-ID') : "");

  React.useEffect(() => {
    // Only update displayValue if it's different from the current numeric value
    const currentNum = parseInt(displayValue.replace(/\D/g, ''), 10) || 0;
    if (value !== currentNum) {
      setDisplayValue(value ? value.toLocaleString('id-ID') : "");
    }
  }, [value]);

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={displayValue}
      placeholder={placeholder}
      onChange={(e) => {
        const rawValue = e.target.value.replace(/\D/g, ''); // Remove all non-digits
        if (rawValue === "") {
          setDisplayValue("");
          onChange(0);
          return;
        }
        const numValue = parseInt(rawValue, 10) || 0;
        setDisplayValue(numValue.toLocaleString('id-ID'));
        onChange(numValue);
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      className={className}
    />
  );
};
