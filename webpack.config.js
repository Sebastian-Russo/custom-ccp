/*
Webpack is used to bundle and optimize the code.
*/

const path = require("path");

//--- Plugins ---\\

const HTMLWebpackPlugin = require("html-webpack-plugin"); // Simplifies creation of HTML files to serve your webpack bundles
const CopyWebpackPlugin = require("copy-webpack-plugin"); // Copies individual files or entire directories, which already exist, to the build directory.
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin; // remove/clean your build folder(s)

const less = require("less");



//--- Config ---\\

const CONFIG = {
    /* Indicates which module webpack should use to begin building out its internal dependency graph */
    entry: "./src/index.tsx",

    /* defaults to ./dist/main.js for the main output file and to the ./dist folder for any other generated file. */
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'my-first-webpack.bundle.js',
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
        // {
		// 	test: /\.(pug|jade)$/,
		// 	exclude: /node_modules/,
		// 	loader: "pug-loader",
		// },
        {
			test: /\.(jpg|png|svg|mp3)$/,
			use: {
				loader: "url-loader",
				options: {limit: 25000},
			},
		}],
      },

      /* Plugins can be leveraged to perform a wider range of tasks like bundle optimization, asset management and injection of environment variables.
      In order to use a plugin, you need to require() it and add it to the plugins array. Most plugins are customizable through options.
      Since you can use a plugin multiple times in a configuration for different purposes, you need to create an instance of it by calling it with the new operator.
      */
      plugins: [
        new CleanWebpackPlugin(),
		new CopyWebpackPlugin([{
			// Less -> CSS.
			from: "./src/*.less",
			to: "./[name].css",
			transform: content => less.render(content.toString()).then(out => out.css),
		}, {
			// Anything in /assets, as-is.
			from: "./src/assets/*",
			to: "./assets/[name].[ext]",
		}, {
			// Favicon:
			from: "./src/favicon.ico",
			to: "./favicon.ico",
		}]),
      ]
};

/* By setting the mode parameter to either development, production or none, you can enable webpack's built-in optimizations that correspond to each environment. */
const createConfig = (mode) => {
	if (!['dev', 'prod'].includes(mode)) throw 'Invalid mode.';
	const devmode = mode === 'dev';

	CONFIG.mode = devmode
		? 'development'
		: 'production';

	CONFIG.resolve.alias = {
		"config.json": path.resolve(__dirname, devmode
			? 'src/config-dev.json'
			: 'src/config.json'),
	};

	console.log("CONFIG LOC:", CONFIG.resolve.alias["config.json"])

	if (devmode || true) CONFIG.plugins.push(new CopyWebpackPlugin([{
		flatten: true,
		from: './node_modules/react/umd/react.development.js'
	}, {
		flatten: true,
		from: './node_modules/react-dom/umd/react-dom.development.js'
	}]));

	CONFIG.plugins.push(new HTMLWebpackPlugin({
		template: './src/index.pug',
		custom: {
			react_lib: (devmode || true)
				? '/react.development.js'
				: 'https://unpkg.com/react@16/umd/react.production.min.js',
			react_dom_lib: (devmode || true)
				? '/react-dom.development.js'
				: 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js',
		},
	}));

	return CONFIG;
};

module.exports = (env = {}) => {
	if (env.development) return createConfig('dev');
	if (env.production) return createConfig('prod');
	throw "Please specify development or production.";
};
