import { useField, Form, FormikProps, Formik } from 'formik';


export function Input({ className = '', inputClassName = '', ...props }) {
  const [field, meta, helpers] = useField(props);

  const validationClassName = meta.touched ? (meta.error ? 'error' : 'success') : ('')
  return (
    <div className={`flex flex-col ${className}`}>
      <input className={`ipt ${validationClassName} ${inputClassName}`} {...props} />
      {meta.error && (<span className="text-2xs uppercase text-ember pl-4">{meta.error.toString()}</span>)}
    </div>
  )
}

export function IconInput({ icon, className = '', inputClassName = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {icon}
      </div>
      <Input inputClassName={`pl-12 ${inputClassName}`} {...props} />
    </div>
  )
}