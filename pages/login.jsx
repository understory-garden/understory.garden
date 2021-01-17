import { useState } from 'react'
import { Formik, Field, Form } from 'formik';
import { fetch } from 'solid-auth-fetcher'
import * as Yup from 'yup';
import Nav from '../components/nav'

import { sendMagicLink } from '../utils/fetch'

const SignupSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Too Short!')
    .max(50, 'Too Long!')
    .required('username is equired'),
  email: Yup.string()
    .email('invalid email')
    .required('email is required'),
});

export default function RegistrationPage(){
  const [success, setSuccess] = useState()
  const onSubmit = async ({username, email}) => {
    const result = await sendMagicLink(username, email)
    if (result && (result.status == 200)) {
      setSuccess(true)
    } else {
      setSuccess(false)
    }
    console.log(result)
  }
  return (
    <div className="page text-center p-6">
      <Nav/>
      <h3 className="text-5xl mt-12 mb-6">
        get a magic login link
      </h3>
      <p className="text-xl mb-12">
        please enter your the username and email with which you registered
      </p>
      {(success !== undefined) && (
        <div className="text-4xl text-purple-300 mb-12">
          {
            success ? (
              <>
                <h3 className="mb-6">
                  success! a magic link has been sent to your email.
                </h3>
                <h3>please click the link to log in.</h3>
              </>
            ) : (
              <h3>hm, something has gone wrong. did you use the right username and email?</h3>
            )
          }
        </div>
      )}

      <Formik
        initialValues={{
          username: '',
          email: '',
        }}
        validationSchema={SignupSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched }) => (

        <Form>
          <div className="flex flex-col">
            <label className="text-2xl mb-6" htmlFor="username">username</label>
            <Field id="username" name="username"
                   className="bg-gray-800 py-2 px-2"
                   placeholder="what's your username" />
            {errors.username && touched.username ? <div className="text-red-500">{errors.username}</div> : null}

            <label className="text-2xl mb-6 mt-12" htmlFor="email">email</label>
            <Field
              className="bg-gray-800 border-0"
              id="email"
              name="email"
              placeholder="what's your email"
              type="email"
            />
            {errors.email && touched.email ? <div className="text-red-500">{errors.email}</div> : null}

            <button className="btn mt-12 text-4xl py-6" type="submit">
              send me a magic login link
            </button>
          </div>
        </Form>
        )}
      </Formik>
    </div>
  )
}
