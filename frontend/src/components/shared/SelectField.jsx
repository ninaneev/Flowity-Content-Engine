import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Drop-in replacement for <select className="select">.
 * Hides the native arrow and shows an animated ChevronDown instead.
 *
 * Props:
 *   options  – array of { value, label } objects
 *   value, onChange, name, required, disabled – passed to native select
 *   selectClassName – extra classes for the <select> element
 *   wrapperClassName – extra classes for the wrapper <div>
 */
export default function SelectField({
  name,
  value,
  onChange,
  options = [],
  required,
  disabled,
  selectClassName = "",
  wrapperClassName = "",
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`select pr-8 ${selectClassName}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none transition-transform duration-200 ${
          focused ? "rotate-180" : ""
        }`}
      />
    </div>
  );
}
