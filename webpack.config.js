const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src") + "/main.tsx",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs",
  },
  externals: {
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "React",
    },
    "react-dom": {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "react-dom",
      root: "ReactDOM",
    },
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              // 指定特定的ts编译配置，为了区分脚本的ts配置
              configFile: path.resolve(__dirname, "./tsconfig.build.json"),
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|woff|woff2|svg|eot|ttf)($|\?)/i,
        use: "url-loader?limit=5000",
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json", ".svg"],
  },
};
