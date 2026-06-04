import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

export default function NavbarToggleButton({ isCollapsed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="btn outline-0 bg-transparent border-0 btn-sm gap-2 transition-all duration-200 hover:bg-base-200"
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={
        isCollapsed ? "Show sidebar navigation" : "Hide sidebar navigation"
      }
    >
      {isCollapsed ? (
        <PanelLeftOpen size={18} className="text-primary" />
      ) : (
        <PanelLeftClose size={18} />
      )}
    </button>
  );
}