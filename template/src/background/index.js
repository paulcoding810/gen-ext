console.log('background is running')

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'install') {
    return
  }
  chrome.runtime.openOptionsPage()
})

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
})
