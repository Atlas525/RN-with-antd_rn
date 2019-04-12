module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    "@babel/transform-react-jsx-source",
    ["import", { "libraryName": "antd-mobile-rn" }]
  ]
};
