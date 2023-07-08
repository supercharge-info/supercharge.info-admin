const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = env => {
    const config = {
        //
        // Dev server config options here: https://webpack.js.org/configuration/dev-server/
        // https://github.com/webpack/webpack-dev-server
        devServer: {
            // Adjusting parameters can be done by adding args to "npm run start" -- for example:
            // npm run start -- --env port=9393 --env open --env hosts=subdomain1.www.dev.supercharge.info,subdomain2.www.dev.supercharge.info
            compress: false,
            port: env.port ?? 9292,
            host: env.open ? "0.0.0.0" : "localhost",
            allowedHosts: env.hosts?.split(",") ?? ["localhost"],
            https: false,
            proxy: [
                {
                    context: ['/service', '/images'],
                    target: env.api ?? 'https://test.supercharge.info',
                    secure: false,
                    changeOrigin: true,
                    logLevel: 'debug'
                }
            ]
        },
        entry: './src/main/script/main.js',
        infrastructureLogging: {
            debug: env.api && [name => name.includes('webpack-dev-server')]
        },
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
                    use: [MiniCssExtractPlugin.loader, 'css-loader']
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
        output: {
            filename: '[name].[chunkhash:8].js',
            path: path.resolve(__dirname, 'build'),
            clean: true
        },
        //
        // https://webpack.js.org/configuration/optimization/
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendor'
                    }
                }
            }
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
                filename: 'index.html',
                inject: 'head',
                // https://github.com/kangax/html-minifier#options-quick-reference
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    preserveLineBreaks: true
                }
            }),
            //
            // Makes some references globally available.
            //
            new webpack.ProvidePlugin({
                jQuery: "jquery",
                $: "jquery"
            }),
            new ESLintPlugin(),
            new MiniCssExtractPlugin({
                filename: '[name].[chunkhash:8].css'
            })
        ]
    };
    if (env.WEBPACK_SERVE) {
        console.log("Using config:");
        console.log(config.devServer);
    }
    return config;
};
