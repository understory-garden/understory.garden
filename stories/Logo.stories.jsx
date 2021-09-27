import React from 'react';
import { Formik } from 'formik';
import { Logo } from '../components/logo';

export default {
  component: Logo,
  title: 'Components/Logo',
  parameters: {
    background: {default: 'dark'}
  }
}


export const HeaderLogo = () => <Logo/>
HeaderLogo.args = {
  label: 'Logo/Header'
}
