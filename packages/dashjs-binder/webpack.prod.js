const path = require('path');
const { merge } = require('webpack-merge');
const common = require('../../webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    entry: {
        llib: './src/index.ts'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
});
