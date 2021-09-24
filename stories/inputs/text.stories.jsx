import React from 'react';
import { Formik } from 'formik';
import { Input } from '../../components/inputs';
import * as Yup from 'yup';

export default {
  component: Input,
  title: 'Components/Inputs/Text'
}


export const Empty = () => <Formik><Input name="example" placeholder="Enter text..." /></Formik>

export const Entry = () => <Formik><Input name="example" value="Some text" /></Formik>

export const EntrySuccess = () => (
  <Formik initialTouched={{ example: true }}>
    <Input name="example" value="good input" />
  </Formik>
)

export const Fail = () => (
  <Formik initialTouched={{ example: true }} initialErrors={{example: "this input is bad and it should feel bad!"}}>
    <Input name="example" value="bad input" />
  </Formik>
)