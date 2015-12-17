'use strict';

var webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    path = require('path'),
    srcPath = path.join(__dirname, 'src', 'app');

module.exports = {
    target: 'web',
    cache: true,
    entry: {
        app: path.join(srcPath, 'app.ts'),
        common: [
            'angular2/bundles/angular2-polyfills.js'
        ]
    },
    resolve: {
        root: srcPath,
        extensions: ['', '.js', '.less', '.ts'],
        modulesDirectories: ['node_modules', 'src']
    },
    output: {
        path: path.join(__dirname, 'build'),
        publicPath: '',
        filename: '[name].js',
        pathInfo: true
    },

    module: {
        loaders: [
            {test: /\.ts$/, loader: 'ts-loader?transpileOnly=true'},
            {test: /\.css$/, loader: "style!css" },
            {test: /\.less$/, loader: "style!css!less"},
            {test: /\.html/, loader: "html-loader"},
            {test: /\.(jpe?g|png|gif|svg)$/i, loader: "file"}
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('common', 'common.js'),
        new HtmlWebpackPlugin({
            inject: true,
            template: 'src/app/index.html'
        }),
        new webpack.NoErrorsPlugin()
    ],

    debug: true,
    devtool: 'eval-cheap-module-source-map',
    devServer: {
        contentBase: './tmp',
        historyApiFallback: true
    }
};