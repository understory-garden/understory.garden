const iconFromPath = (path) => ({className, ...props}) => (
  <svg xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 20 20" fill="currentColor"
       className={`h-5 w-5 ${className || ''}`} {...props}>
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

export const HomeIcon = iconFromPath(
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
)

export const CoverImageIcon = iconFromPath(
    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
)

export const ProfileImageIcon = iconFromPath(
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
)

export const MailIcon = iconFromPath(
  <>
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </>
)

export const ReportIcon = iconFromPath(
  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
)

export const ExternalLinkIcon = iconFromPath(
  <>
    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
  </>
)

export const FormatBold = ({className, ...props}) => (
  <div className={`w-5 h-5 leading-tight font-bold ${className || ''}`} {...props}>
    b
  </div>
)

export const FormatItalic = ({className, ...props}) => (
  <div className={`w-5 h-5 leading-tight italic ${className || ''}`} {...props}>
    i
  </div>
)

export const FormatUnderlined = ({className, ...props}) => (
  <div className={`w-5 h-5 leading-none underline ${className || ''}`} {...props}>
    u
  </div>
)

export const ConceptIcon = ({className, ...props}) => (
  <div className={`w-5 h-5 leading-none ${className || ''}`} {...props}>
    [[
  </div>
)

export const Eyeslash = ({className}) => (
  <svg className={`w-5 h-5 ${className}`} viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.736 7.64a.37.37 0 0 1-.265-.11 2.166 2.166 0 0 1 3.06-3.06.375.375 0 0 1 0 .53L5 7.53a.37.37 0 0 1-.265.11zM6 4.585A1.417 1.417 0 0 0 4.77 6.7L6.7 4.77c-.21-.12-.45-.185-.7-.185z" fill="#6B7280"/>
    <path d="M2.8 9.255a.38.38 0 0 1-.245-.09A7.257 7.257 0 0 1 1.13 7.5c-.53-.825-.53-2.17 0-3C2.35 2.59 4.125 1.49 6 1.49c1.1 0 2.185.38 3.135 1.095a.375.375 0 0 1-.45.6c-.82-.62-1.75-.945-2.685-.945-1.615 0-3.16.97-4.24 2.665-.375.585-.375 1.605 0 2.19s.805 1.09 1.28 1.5c.155.135.175.37.04.53a.363.363 0 0 1-.28.13zM6 10.51a4.937 4.937 0 0 1-1.94-.4.375.375 0 0 1 .29-.69c.53.225 1.084.34 1.644.34 1.615 0 3.16-.97 4.24-2.665.375-.585.375-1.605 0-2.19a7.122 7.122 0 0 0-.505-.7.38.38 0 0 1 .055-.53c.16-.13.395-.11.53.055.195.24.385.5.555.77.53.825.53 2.17 0 3C9.65 9.41 7.874 10.51 6 10.51z" fill="#6B7280"/>
    <path d="M6.346 8.135a.379.379 0 0 1-.37-.305.368.368 0 0 1 .3-.435c.55-.1 1.01-.56 1.11-1.11a.38.38 0 0 1 .44-.3c.205.04.34.235.3.44-.16.865-.85 1.55-1.71 1.71-.025-.005-.045 0-.07 0zM1 11.375a.37.37 0 0 1-.264-.11.377.377 0 0 1 0-.53L4.47 7A.377.377 0 0 1 5 7a.377.377 0 0 1 0 .53l-3.735 3.735a.37.37 0 0 1-.265.11zM7.264 5.11A.37.37 0 0 1 7 5a.377.377 0 0 1 0-.53L10.734.735a.377.377 0 0 1 .53 0 .377.377 0 0 1 0 .53L7.53 5a.37.37 0 0 1-.265.11z" fill="#6B7280"/>
  </svg>

)