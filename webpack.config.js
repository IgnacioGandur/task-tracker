const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');



module.exports = 
{
    mode: 'development',
    entry: './src/index.js',
    devtool: 'inline-source-map',
    devServer:
    {
        static: './dist',
    },
    plugins:
    [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            hash: true,
        }),
        new FaviconsWebpackPlugin('./src/icons/icon.png'),
    ],
    output: 
    {
        filename:'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean:true,
    },
    module:
    {
        rules: [
            {
                test: /\.css$/i,
                use : ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
};