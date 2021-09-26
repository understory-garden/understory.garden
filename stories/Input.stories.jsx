import React from 'react';
import { Formik } from 'formik';
import { Input } from '../components/inputs';
import { Search as SearchIcon } from '../components/icons';

export default {
  component: Input,
  title: 'Components/Input'
}


export const Empty = () => <Formik><Input type="text" name="example" placeholder="Enter text..." /></Formik>

export const Entry = () => <Formik><Input type="text" name="example" value="Some text" /></Formik>

export const EntrySuccess = () => (
  <Formik initialTouched={{ example: true }}>
    <Input type="text" name="example" value="good input" />
  </Formik>
)

export const Fail = () => (
  <Formik initialTouched={{ example: true }} initialErrors={{ example: "this input is bad and it should feel bad!" }}>
    <Input type="text" name="example" value="bad input" />
  </Formik>
)
