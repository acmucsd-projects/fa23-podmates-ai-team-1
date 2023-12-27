const webpack = require("webpack");

module.exports = function override(config, env) {
    config.resolve.fallback = {
        "fs": false,
          "tls": false,
          "net": false,
          "http": false,
          "https": false,
          "zlib": false ,
          "path": false,
          "stream": false,
          "util":  false,
          "crypto": false,
          "buffer": false,
          "assert": false
    };
    
    config.plugins.push(
        new webpack.ProvidePlugin({
            // process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        }),
        new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
            const mod = resource.request.replace(/^node:/, "");
            switch (mod) {
                case "buffer":
                    resource.request = "buffer";
                    break;
                case "stream":
                    resource.request = "readable-stream";
                    break;
                default:
                    throw new Error(`Not found ${mod}`);
            }
        }),
    );
    config.ignoreWarnings = [/Failed to parse source map/];

    return config;
};