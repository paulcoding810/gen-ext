import Storage from './Storage'

const settingsStorage = new Storage('settings')

// const indexedDB = new IndexedDBWrapper('MyAppDB', 'media', 2, [
//   { name: 'urlIndex', keyPath: 'url', options: { unique: true } },
// ])

export { settingsStorage }
