const IconButton = ({active=true, className, ...props}) => {
  const activeClasses = active ? "text-black bg-gray-200 hover:bg-gray-300" : "text-gray-600 bg-white hover:bg-gray-100"
  return (
    <button className={`${activeClasses} px-1 ${className || ''}`} {...props}/>
  )
}

export default IconButton
