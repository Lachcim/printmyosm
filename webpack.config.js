import path from "node:path";
import HtmlWebpackPlugin from "html-webpack-plugin";

const src = path.resolve(import.meta.dirname, "frontend");
const dist = path.resolve(import.meta.dirname, "dist");

export default {
    entry: "./main.jsx",
    context: src,
    target: "web",
    output: {
        filename: "printmyosm.js",
        path: dist,
        assetModuleFilename: path => path.filename.replace("frontend/", "")
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-react"]
                    }
                }
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.svg$/,
                exclude: /node_modules/,
                type: "asset/resource"
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "index.html"
        })
    ],
    resolve: {
        extensions: [".js", ".jsx", ".css", ".scss"]
    },
    experiments: {
        outputModule: true
    },
    externalsType: "module"
};
