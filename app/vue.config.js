const path = require('path')

const projectRoot = path.resolve(__dirname)

module.exports = {
  devServer: {
    port: 8080
  },
  chainWebpack (config) {
    config.resolve.alias
      .set('@', projectRoot)
      .set('./@', projectRoot)
  }
}
