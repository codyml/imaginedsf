var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    
    entry: './assets-src/index.js',
    output: {
        filename: 'script.js',
        path: path.resolve(__dirname, 'imaginedsf-custom-theme/assets'),
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [ 'css-loader', 'sass-loader' ],
                })
            },
        ]
    },
    plugins: [
        new ExtractTextPlugin('styles.css')
    ],

};