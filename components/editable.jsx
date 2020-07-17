import { useState } from 'react'
import { Edit } from "~components/icons"
import { Formik, Form } from 'formik';
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
          <span className="cursor-pointer relative" onClick={() => setEditing(true)}>
            {children}
            <Edit className="absolute -top-1 -right-1 w-2 h-2 text-gray-600" />
          </span>
        )
      }
    </div >
  )
}
