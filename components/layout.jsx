export function Space({ className, ...props }) {
  return <div className={`flex flex-column bg-gradient-tl-background w-screen h-screen p-6 ${className}`} {...props} />
}

export function Flow({ className, ...props }) {
  return <div className={`flex flex-row h-84 ${className}`} {...props} />
}

export function Module({ className, ...props }) {
  return <div className={`w-84 m-6 p-6 rounded-lg bg-white bg-opacity-25 border-white border-opacity-25 border-solid border-8 relative ${className}`} {...props} />
}
