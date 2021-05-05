import { useState } from 'react'
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import Nav from '../components/nav'

import { sendMagicLink } from '../utils/fetch'

const SignupSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Too Short!')
    .max(50, 'Too Long!')
    .required('username is required'),
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
    <div className="text-center max-w-5xl mx-auto">
      <Nav/>
      <h3 className="text-3xl mb-3 text-gray-700">🌻🌿🌱 Welcome to Understory Garden! 🌱🌿🌻 </h3>
      <h3 className="text-lg mb-3 text-gray-600">
        You can create an Understory Garden account using the form below.
      </h3>
      <h3 className="text-lg mb-3 text-gray-600">
        Understory Garden is currently in early alpha - we cannot make any guarantees about the stability of the service
        or the safety of your data. As a result, please treat this as a sandbox.
      </h3>
      <h3 className="text-lg mb-3 text-gray-600">
        After signing up below, we'll send you a "magic login link" that will allow you to log into the service once. If you are
        logged out, you'll be able to log back in using the login form on <a href="https://understory.garden">the home page</a> but
        you will need to go through the "forgot password" flow before you'll be able to fully log in. We look forward to making
        this user experience cleaner in the near future.
      </h3>
      <h3 className="text-lg text-gray-600 mb-12">By creating an account you agree to be bound by our <a href="/tos">Terms of Service</a></h3>.
      <h3 className="text-3xl mb-6"> Create Your Account </h3>
      {(success !== undefined) && (
        <div className="text-2xl text-purple-300 mb-12">
          {
            success ? (
              <>
                <h3 className="mb-6">
                  success! a magic link has been sent to your email.
                </h3>
                <h3>please click the link to log in.</h3>
              </>
            ) : (
              <h3>hm, something has gone wrong. most likely, a user with that username already exists.</h3>
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
            <Field id="username" name="username"
                   type="text"
                   className="rounded text-2xl mb-3"
                   placeholder="pick a username" />
            {errors.username && touched.username ? <div className="text-red-500">{errors.username}</div> : null}

            <Field
              className="rounded text-2xl"
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
