const iconFromPath = (path) => ({className, ...props}) => (
  <svg xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 20 20" fill="currentColor"
       className={`w-4 ${className || ''}`} {...props}>
    {path}
  </svg>
)

export const DragIcon = iconFromPath(
  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
)

export const AddIcon = iconFromPath(
  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
)

export const EditIcon = iconFromPath(
  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
)

export const ArrowRight = iconFromPath(
  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
)

export const LinkIcon = iconFromPath(
  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
)

export const FormatBold = ({className, ...props}) => (
  <div className={`w-4 font-bold ${className || ''}`} {...props}>
    b
  </div>
)

export const FormatItalic = ({className, ...props}) => (
  <div className={`w-4 italic ${className || ''}`} {...props}>
    i
  </div>
)

export const FormatUnderlined = ({className, ...props}) => (
  <div className={`w-4 underline ${className || ''}`} {...props}>
    u
  </div>
)
