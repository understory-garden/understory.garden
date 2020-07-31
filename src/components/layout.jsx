export function Space({ className = '', ...props }) {
  return <div className={`flex flex-col pl-6 ${className}`} {...props} />
}

export function Flow({ className = '', ...props }) {
  return <div className={`flex flex-row h-84 overflow-x-scroll ${className}`} {...props} />
}

export function Module({ className = '', ...props }) {
  return <div className={`w-84 m-6 p-6 rounded-lg bg-white bg-opacity-25 border-white border-opacity-25 border-solid border-8 relative flex-shrink-0 flex flex-col overflow-y-scroll ${className}`} {...props} />
}

export const ModuleHeader = (props) => (
  <div className="absolute top-0 left-0 right-0 pb-2 bg-white bg-opacity-25 flex flex-row" {...props} />
)
