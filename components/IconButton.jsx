const IconButton = ({active=true, className, ...props}) => {
  const activeClasses = active ? "text-white bg-gray-700 hover:bg-gray-600" : "text-white bg-gray-900 hover:bg-gray-800"
  return (
    <button className={`${activeClasses} px-1 ${className || ''}`} {...props}/>
  )
}

export default IconButton
