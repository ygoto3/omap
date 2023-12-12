const path = require('path');
const { merge } = require('webpack-merge');
const common = require('../../webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    entry: {
        main: './src/main.ts'
    },
    output: {
        path: path.join(__dirname,'demo'),
        filename: '[name].js'
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "demo"),
        },
        compress: true,
        port: 8000
    },
});
