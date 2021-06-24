/* eslint-disable */

/**
 * This file is required for tsconfig paths to work in node
 */
const path = require('path')
const tsConfig = require('./tsconfig.json')
const tsConfigPaths = require('tsconfig-paths')

const baseUrl = path.join(__dirname, 'dist')

tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
})
