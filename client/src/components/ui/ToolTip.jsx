import { useState } from "react"

function ToolTip({ children, text, isCollapsed }) {
  const [show, setShow] = useState(false)

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && isCollapsed && (
        <div className="absolute left-full ml-1 z-50 hidden md:block whitespace-nowrap rounded-lg bg-base-300 border border-gray-400/40 px-2 py-1 text-sm text-base-content shadow-lg">
          {text}
        </div>
      )}
    </div>
  )
}

export default ToolTip
