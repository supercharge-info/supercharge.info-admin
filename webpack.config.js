const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/main/script/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
        clean: true
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            //
            // https://webpack.js.org/loaders/css-loader/
            // https://webpack.js.org/loaders/style-loader/
            //
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            //
            // This is here only so that webpack doesn't try to process font files referenced by bootstrap css.
            //
            {
                test: /(\.woff?|\.woff2?|\.ttf?|\.eot?|\.svg?$)/,
                loader: 'url-loader'
            }
        ]
    },
    plugins: [

        //
        // https://github.com/jantimon/html-webpack-plugin
        //
        // Copies our HTML to the build directory and also minifies it, AND insert into
        // the HEAD section references to our generated JS and CSS source files.
        //
        new HtmlWebpackPlugin({
            template: 'src/main/html/index.html',
            inject: false,
            // https://github.com/kangax/html-minifier#options-quick-reference
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                conservativeCollapse: true,
                preserveLineBreaks: true
            }
        }),
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            "window.jQuery": "jquery"
        })
    ],
    //
    // Dev server config options here: https://webpack.js.org/configuration/dev-server/
    // https://github.com/webpack/webpack-dev-server
    devServer: {
        // All content is served from in-memory web-packed version of source files, we should not get anything
        // from contentBase.
        compress: false,
        port: 9292,
        https: false,
        proxy: [
            {
                context: ['/service'],
                target: 'https://test.supercharge.info/service',
                secure: false,
                changeOrigin: true,
                pathRewrite: {'^/service': ''},
                logLevel: 'debug',
            },
        ]
    }
};
