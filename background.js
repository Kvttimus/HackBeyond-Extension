// displays HTML popup to log water
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openWaterLogPopup") {
        chrome.windows.create( {
            url: chrome.runtime.getURL("index.html"),
            type: "popup",
            width: 400,
            height: 330
        });
    }
});

