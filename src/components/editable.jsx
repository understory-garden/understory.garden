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
          <span className="cursor-pointer inline-flex flex-row" onClick={() => setEditing(true)}>
            {children}
            <Edit className="w-3 h-3 text-gray-900" />
          </span>
        )
      }
    </div >
  )
}
