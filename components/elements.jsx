import ReactLoader from 'react-loader-spinner'
import ReactDOM from 'react-dom'

const PASSIONFLOWER = '#944c7d'
const ECHEVERIA = '#9fae6f'

export const Loader = (props) => {
  return (
    <ReactLoader
      type="MutatingDots"
      color={PASSIONFLOWER}
      secondaryColor={ECHEVERIA}
      height={120}
      width={120}
      {...props} />
  )
}

// This loader is soothing to look at, but slow, so only use for things with a long wait (like gate deploys)
export const PatientLoader = (props) => {
  return (
    <ReactLoader
      type="Rings"
      color={PASSIONFLOWER}
      secondaryColor={ECHEVERIA}
      height={120}
      width={120}
      {...props} />
  )
}

export const InlineLoader = (props) => {
  return (
    <ReactLoader
      type="ThreeDots"
      color={PASSIONFLOWER}
      secondaryColor={ECHEVERIA}
      {...props} />
  )
}

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body)
}
