const IconButton = ({active=true, className, ...props}) => {
  const activeClasses = active ? "bg-pink-200 hover:bg-pink-100" : "bg-gray-200 hover:bg-gray-100"
  return (
    <button className={`${activeClasses} h-full text-gray-900 px-1 ${className || ''}`} {...props}/>
  )
}

export default IconButton
