/* @flow */

'use strict';

// SIMPLE_UI | SIMPLE_LIGHT_UI | MODERN_UI
global.UI_STYLE = 'SIMPLE_LIGHT_UI';

const { AppRegistry } = require('react-native');
const VerbozeControl = require('./VerbozeControl');

AppRegistry.registerComponent('VerbozeControl', () => VerbozeControl);
