const React = require('react'); const { Text } = require('react-native');
function Ionicons(props){ return React.createElement(Text, { accessibilityLabel: String(props.name) }, ''); }
Ionicons.glyphMap = {};
module.exports = { Ionicons };
