import React from 'react';
import { mockThingFrom, setStringNoLocale } from '@inrupt/solid-client';
import { schema } from 'rdf-namespaces';

import Editor from '../components/Editor';

export default {
  title: 'Components/Editor',
  component: Editor,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

const Template = (args) => <Editor {...args} />

export const Foo = Template.bind({});
Foo.args = {
  body: [{
    children: [
      {text: "FOOBAR"}
    ]
  }],
};

/*
export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Button',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Button',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Button',
};
*/
