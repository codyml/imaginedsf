/*
* Theme style constants used by styled-components.
*/


//  Colors
const colors = {
  lightBlack: '#333',
  darkerGrey: '#414042',
  darkGrey: '#58595b',
  lightGrey: '#cecece',
  lighterGrey: '#d8d8d8',
  panelBackground: '#efefef',
};

//  Opacities
const opacities = {
  linkHover: 0.8,
};

//  Transition Durations
const transitionDurations = {
  linkHover: '.2s',
};

//  Z-indices
const zIndices = {
  LoadingMessage: 500,
  Header: 400,
  LeafletMap: 100,
  Panel: 200,
  VisibleMapArea: 200,
  Modal: 300,
};

//  Shadows
const shadows = {
  Panel: '0 5px 20px rgba(0, 0, 0, 0.15)',
};

//  Radii
const radii = {
  standard: '5px',
};

export default {
  colors,
  opacities,
  transitionDurations,
  zIndices,
  shadows,
  radii,
};
