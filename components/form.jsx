import { Field } from 'formik';

export function TextField({ className = '', ...rest }) {
  return (
    <Field name="text" className={`rounded opacity-75 leading-tite border-2 border-white focus:outline-none focus:border-purple-500 ${className}`} {...rest} />
  )
}
