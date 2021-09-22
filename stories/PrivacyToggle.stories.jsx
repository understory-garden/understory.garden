import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { PrivacyToggle } from '../components/toggles';

export default {
  title: 'Components/PrivacyToggle',
  component: PrivacyToggle,
  parameters: {
    backgrounds: { default: 'dark'}
  },
  argTypes: {
  }
};

const Template = (args) => <PrivacyToggle {...args}/>

export const PrivacyTogglePrivate = Template.bind({});
PrivacyTogglePrivate.args = {
  enabled: false,
  label: 'PrivacyToggle/Private',
};

export const PrivacyTogglePublic = Template.bind({});
PrivacyTogglePublic.args = {
  enabled: true,
  label: 'PrivacyToggle/Public',
};

export const ToggleablePrivacyToggle = function (){
  const [enabled, setEnabled] = React.useState(false)
  return (<PrivacyToggle enabled={enabled} setEnabled={setEnabled}/>)
}
ToggleablePrivacyToggle.args = {
  label: 'PrivacyToggle/Toggleable'
}
