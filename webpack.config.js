var path = require('path');

module.exports = {
  entry: "./main/main.js",
  output: {
  	filename: "./lib/bundle.js"
  },
  devtool: 'source-map',
  resolve: {
  extensions: ['.js', '.jsx', '*']
}
};
