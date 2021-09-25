import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import NewNote from '../components/modals/NewNote';

export default {
  title: 'Modals/NewNote',
  component: NewNote,
  argTypes: {
  }
};

const Template = (args) => <NewNote {...args} />

export const DefaultNewNoteModal = Template.bind({});
DefaultNewNoteModal.args = {
  label: 'NewNote/Default',
};

export const PublicNewNoteModal = Template.bind({});
PublicNewNoteModal.args = {
  label: 'NewNote/Public',
  isPublic: true
};

