import ReactLoader from 'react-loader-spinner'
import ReactDOM from 'react-dom'

export const Loader = (props) => <ReactLoader type="Puff" color="purple" {...props} />

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body)
}
