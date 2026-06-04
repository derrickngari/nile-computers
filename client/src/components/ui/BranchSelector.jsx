import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useBranch } from "../../contexts/BranchContext";

const ALL_BRANCHES = {
  id: "all",
  name: "All Branches",
  code: "ALL",
  isAll: true
};

export default function BranchSelector() {
  const { branches, selectedBranch, changeBranch } = useBranch();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const allOptions = [ALL_BRANCHES, ...branches];

  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!selectedBranch) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-outline btn-primary btn-sm gap-2 min-w-[190px] justify-between"
      >
        <span className="text-sm font-medium">{selectedBranch.name}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} 
        />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-72 bg-base-100 border border-base-300 rounded-box shadow-2xl py-1">
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-base-300">
            {allOptions.map((branch) => (
              <button
                key={branch.id}
                onClick={() => {
                  changeBranch(branch);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between
                  ${selectedBranch.id === branch.id 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-base-200"}`}
              >
                <div>
                  <p className="font-medium">{branch.name}</p>
                  {branch.code && branch.id !== "all" && (
                    <p className="text-xs text-base-content/60">{branch.code}</p>
                  )}
                </div>

                {selectedBranch.id === branch.id && (
                  <Check size={16} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}