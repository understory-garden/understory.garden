import { useState } from 'react'
import { Formik, Field, Form } from 'formik';
import { Edit } from "~components/icons"
import { TextField } from "~components/form"

export function EditableText({ save, placeholder, className, value, children, ...rest }) {
  const [editing, setEditing] = useState(false)
  return (
    <div className={`inline ${className}`} {...rest}>
      {editing ? (
        <Formik
          initialValues={{
            text: value,
          }}
          onSubmit={async ({ text }) => {
            await save(text)
            setEditing(false)
          }}
        >
          <Form className="inline">
            <TextField name="text" placeholder={placeholder} autoFocus onBlur={() => setEditing(false)}
            />
          </Form>
        </Formik>
      ) : (
          <span className="cursor-pointer" onClick={() => setEditing(true)}>
            {children}
            <sup><Edit className="text-micro text-gray-600" /></sup>
          </span>
        )
      }
    </div >
  )
}
