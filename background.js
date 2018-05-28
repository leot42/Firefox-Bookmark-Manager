(() => {
    /**
     * Opens a new tab and loads main page into it.
     */
    
    const openMainPage = () => {
        browser.tabs.create({
            // "url": "./mainPage/mainPage.html"
            "url": "./tempPage/mainPageTemp.html"
        });
    }
     
    /**
     * Add openMyPage as a listener on the browser button action
     */
    
    browser.browserAction.onClicked.addListener(openMainPage);
    
})();
