const path = require("path");

//--- Plugins ---\\

const HTMLWebpackPlugin = require("html-webpack-plugin"); // Simplifies creation of HTML files to serve your webpack bundles
const CopyWebpackPlugin = require("copy-webpack-plugin"); // Copies individual files or entire directories, which already exist, to the build directory.
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // remove/clean your build folder(s)

const less = require("less");

//--- Config ---\\

const CONFIG = {
    /* Indicates which module webpack should use to begin building out its internal dependency graph */
    entry: "./src/index.tsx",

    /* defaults to ./dist/main.js for the main output file and to the ./dist folder for any other generated file. */
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'custom-ccp.bundle.js',
    },

    resolve: {
        extensions: [".ts", ".tsx", ".mjs", ".js"],
        modules: [
            'node_modules',
        ],
    },

    /* Loaders allow webpack to process other types of files and convert them into valid modules that can be consumed by your application and added to the dependency graph. */
    module: {
        rules: [{
            // Typescript files:
            test: /\.ts(x?)$/,
            exclude: /node_modules/,
            loader: "babel-loader",
        },
        {
            test: /\.(pug|jade)$/,
            exclude: /node_modules/,
            loader: "pug-loader",
        },
        {
            test: /\.(jpg|png|svg|mp3)$/,
            use: {
                loader: "url-loader",
                options: { limit: 25000 },
            },
        }],
    },

    /* Plugins can be leveraged to perform a wider range of tasks like bundle optimization, asset management and injection of environment variables.
    In order to use a plugin, you need to require() it and add it to the plugins array. Most plugins are customizable through options.
    Since you can use a plugin multiple times in a configuration for different purposes, you need to create an instance of it by calling it with the new operator.
    */
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                // Less -> CSS.
                { from: "./src/*.less", to: "./[name].css", transform: content => less.render(content.toString()).then(out => out.css) },
                // Anything in /assets, as-is.
                { from: "./src/assets/*", to: "./assets/[name].[ext]" },
                // Favicon:
                { from: "./src/favicon.ico", to: "./favicon.ico" }
            ]
        }),
    ],

    // Controls if and how source maps are generated. Source maps are useful for debugging but can slow down the build process, so it's often beneficial to use different settings for production and development.
    devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'inline-source-map',

    // Enabling hot reloading
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
    },
};

// Create a function to modify CONFIG based on mode
const createConfig = (mode) => {
    console.log("mode:", mode);

    if (!['development', 'staging', 'production'].includes(mode)) throw 'Invalid mode.';

    CONFIG.mode = mode === 'staging' ? 'production' : mode; // Webpack does not have 'staging' mode, use 'production' for staging

    CONFIG.resolve.alias = {
        "config.json": path.resolve(__dirname, mode === 'development'
            ? 'src/config-dev.json'
            : 'src/config.json'),
    };

    console.log("CONFIG LOC:", CONFIG.resolve.alias["config.json"])

    if (mode === "production") CONFIG.plugins.push(new CopyWebpackPlugin({
        patterns: [
            {
                from: path.resolve(__dirname, './node_modules/react/umd/react.production.min.js'),
                to: 'dist/[name][ext]',
            }, {
                from: path.resolve(__dirname, './node_modules/react-dom/umd/react-dom.production.min.js'),
                to: 'dist/[name][ext]',
            }
        ]
    }));

    CONFIG.plugins.push(new HTMLWebpackPlugin({
        template: './src/index.pug',
        custom: {
            react_lib: (mode === "development")
                ? '/react.development.js'
                : 'https://unpkg.com/react@16/umd/react.production.min.js',  // update from react 16 to 18
            react_dom_lib: (mode === "development")
                ? '/react-dom.development.js'
                : 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js',  // update from react 16 to 18
        },
    }));

    return CONFIG;
};

module.exports = (env, argv) => {
    const mode = argv.mode || 'development'; // Default to 'development' if no mode is specified

    return createConfig(mode);
};
