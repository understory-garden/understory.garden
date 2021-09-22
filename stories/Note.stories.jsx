import React from 'react';
import { mockThingFrom, setStringNoLocale } from '@inrupt/solid-client';
import { schema } from 'rdf-namespaces';
/*
import Note from '../components/Note';

export default {
  title: 'Components/Note',
  component: Note,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

const Template = (args) => <Note {...args} />;

let note = mockThingFrom("https://example.com/note#it")
note = setStringNoLocale(note, schema.text, `Foo

[this note](http://example.com/note#it)
`)


export const Primary = Template.bind({});
Primary.args = {
  note,
  primary: true,
  label: 'Button',
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
