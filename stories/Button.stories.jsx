import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Button } from '../components/buttons';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
  },
};

const Template = (args) => <Button {...args}>Button</Button>;

export const FilledRound = Template.bind({});
FilledRound.args = {
  className: "btn-md btn-filled btn-round",
  label: 'Filled/Round',
};

export const FilledSquare = Template.bind({});
FilledSquare.args = {
  className: "btn-md btn-filled btn-square",
  label: 'Filled/Square',
};

export const EmphasisRound = Template.bind({});
EmphasisRound.args = {
  className: "btn-md btn-emphasis btn-round",
  label: 'Emphasis/Round',
};

export const EmphasisSquare = Template.bind({});
EmphasisSquare.args = {
  className: "btn-md btn-emphasis btn-square",
  label: 'Emphasis/Square',
}

export const NotificationSquare = Template.bind({});
NotificationSquare.args = {
  className: "btn-md btn-notification",
  label: 'Notification/Square',
}

export const TransparentRound = Template.bind({});
TransparentRound.args = {
  className: "btn-md btn-transparent btn-round",
  label: 'Transparent/Square',
}

export const TransparentSquare = Template.bind({});
TransparentSquare.args = {
  className: "btn-md btn-transparent btn-square",
  label: 'Transparent/Square',
}
