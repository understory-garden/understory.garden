import { useField, Form, FormikProps, Formik } from 'formik';


export function Input({ className = '', ...props }) {
  const [field, meta, helpers] = useField(props);

  const validationClassName = meta.touched ? (meta.error ? 'error' : 'success') : ('')
  return (
    <div className="flex flex-col">
      <input className={`ipt ${validationClassName} ${className}`} {...props} />
      {meta.error && (<span className="text-2xs uppercase text-ember pl-4">{meta.error.toString()}</span>)}
    </div>
  )
}