import React from 'react';
import { mockThingFrom, setStringNoLocale } from '@inrupt/solid-client';
import { schema } from 'rdf-namespaces';
/*
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
  body: [
    { children: [
      {text: "FOOBAR"}
    ]},
    { children: [
      {text: "fuzbaz"}
    ]},
    { children: [
      {text: "fleegix"}
    ]},
  ],
};

export const Image = Template.bind({});
Image.args = {
  body: [
    { type: "image",
      children: [
        {
          "text": ""
        }
      ],
      url: "https://images.unsplash.com/photo-1516222338250-863216ce01ea",
      originalUrl: "https://images.unsplash.com/photo-1516222338250-863216ce01ea",
      alt: "asdf",
      width: 400,
      mime: "image/jpg"}
  ],
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
