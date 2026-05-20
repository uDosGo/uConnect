/** @type {import('electron-builder').Configuration} */
const config = {
  appId: 'com.udos.views',
  productName: 'udoui',
  directories: {
    output: 'dist/electron-app',
    app: '.'
  },
  files: [
    'index.html',
    'assets/**/*',
    'fonts/**/*',
    'public/**/*',
    'package.json'
  ],
  extraResources: [
    {
      from: 'node_modules/electron/dist/electron',
      to: 'electron'
    }
  ],
  mac: {
    target: 'dmg',
    icon: 'public/icon.png',
    category: 'public.app-category.developer-tools'
  },
  dmg: {
    contents: [
      {
        x: 130,
        y: 220,
        type: 'file'
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications'
      }
    ],
    window: {
      width: 540,
      height: 380
    }
  },
  win: {
    target: 'nsis'
  },
  linux: {
    target: 'AppImage'
  }
}

module.exports = config