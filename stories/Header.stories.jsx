import React from 'react';

import Header from '../components/Header';

export default {
  title: 'Components/Header',
  component: Header,
  argTypes: {
  }
};

const Template = (args) => <Header {...args} />

export const DashboardHeader = Template.bind({});
DashboardHeader.args = {
  label: 'Header/Dashboard',
};

export const DashboardHeaderDrawerOpen = Template.bind({});
DashboardHeaderDrawerOpen.args = {
  label: 'Header/DashboardDrawerOpen',
  drawerOpen: true
};

