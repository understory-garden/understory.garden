const buttonClasses = 'transition duration-150 ease-in-out bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded'
export default function Button({className, ...props}){
  return (<button className={`${buttonClasses} ${className}`}
                  {...props}/>)
}
