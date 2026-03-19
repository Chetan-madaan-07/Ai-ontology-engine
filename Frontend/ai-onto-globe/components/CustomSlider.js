import React from 'react';

const CustomSlider = ({ label, min = 1, max = 100, step = 1, value, onChange }) => {
  
  // Intercept the change event to add our heavy logging before passing it up
  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    console.log(`[CustomSlider - ${label}] Dragged to value: ${newValue}`);
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-2 w-full my-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          {label}
        </label>
        {/* Dynamic value display pill */}
        <span className="text-xs font-mono font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
          {value}
        </span>
      </div>
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full cursor-pointer"
        // Note: The actual visual styling for the track and thumb is handled by our globals.css!
      />
    </div>
  );
};

export default CustomSlider;