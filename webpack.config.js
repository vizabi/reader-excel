const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = () => ({
    mode: 'production',
    entry: {
        'vizabi-excel-reader': './src/index-frontend.ts'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'vizabi-excel-reader.js',
        libraryTarget: 'var',
        library: 'ExcelReader'
    },
    performance: {hints: false},
    target: 'web',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: 'pre'
            },
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [new CleanWebpackPlugin(['dist'])]
});
