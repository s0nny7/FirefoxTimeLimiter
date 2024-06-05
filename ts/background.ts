async function background() {
    var settings = new Settings();
    await settings.load();

    var generalPageData: Map<string, PageData> = new Map();

    let saved = await browser.storage.local.get(["generalPageData"]);

    if (saved["generalPageData"] != null) {

        generalPageData = new Map(JSON.parse(saved["generalPageData"]));
    }

    function savePageData() {
        let parsed = JSON.stringify(Array.from(generalPageData.entries()));
        browser.storage.local.set({
            "generalPageData": parsed,
        })
    }

    var firefoxActive = true;

    /**
     * In Milliseconds
     */
    var totalFirefoxUseTime = 0;
    var totalWebsiteUseTime: Map<string, PageTimeData> = new Map();
    var currentUsed: string | null = null;
    /**
     * In Milliseconds
     */
    var lastTimeUpdate = nowUtcMillis();

    async function pageCanBeLimited(tabId: number) {
        try {
            //Check can page be edited by extension
            let results = await browser.tabs.executeScript(tabId, {
                code: `document.designMode;`
            });
            // results is an array of results for each frame in the tab
            // We're only interested in the result for the top-level frame
            if (results[0] !== "on") {
                //Page can't be edited
                return false;
            }
        } catch (error) {
            //Error means that page can be edited (missing host permissions error appears)
        }
        return true;
    }

    async function initializePage(tabId: number, hostname: string, url: string) {
        let found = null

        let matchedUrl = false;
        //Milliseconds
        let foundTime = 0;

        for (const iterator of totalWebsiteUseTime) {
            let key = iterator[0]
            let value = iterator[1]
            if (value.regex_key) {
                let regex = new RegExp(key);
                if (regex.test(url)) {
                    found = key;
                    foundTime = value.timeCounted
                    matchedUrl = true;
                    break;
                }
            } else {
                if (hostname.endsWith(key)) {
                    found = key;
                    foundTime = value.timeCounted
                    matchedUrl = true;
                    break;
                }
            }
        }

        if (!matchedUrl) {
            found = hostname
            totalWebsiteUseTime.set(found, new PageTimeData(true));
        }

        currentUsed = found

        let message = new MessageFromBackground();
        message.pageTimeUpdate = foundTime;
        message.firefoxTimeUpdate = totalFirefoxUseTime;
        message.pageData = generalPageData.get(found!) ?? new PageData();

        message.settings = settings;

        browser.tabs.sendMessage(tabId, message);
    }

    async function pageHandle(tabId: number) {
        let pageData = await browser.tabs.get(tabId);
        let url = pageData.url!
        let hostname = new URL(url).hostname;
        if (hostname == "") {
            currentUsed = null;
            currentPage = null;
            return;
        }
        currentPage = tabId;


        if (pageData.status != "complete") {
            pageLoading = true;
            //Page handling will be done after status update
            return;
        } else {
            pageLoading = false;
        }



        initializePage(tabId, hostname, url)
    }
    /**
     * Tab ID
     */
    var currentPage: number | null = null;
    var pageLoading = false;
    browser.tabs.getCurrent().then(async (tab) => {
        if (tab == null) {
            return;
        }
        if (tab.id == null) {
            return;
        }

        if (!await pageCanBeLimited(tab.id)) {
            return;
        }

        await pageHandle(tab.id)

    })


    function timeUpdate() {
        let now = nowUtcMillis();
        let diff = now - lastTimeUpdate;
        lastTimeUpdate = now;

        if (!settings.countTimeOnLostFocus && !firefoxActive) {
            return;
        }
        if (firefoxActive || settings.countTimeOnLostFocus) {
            totalFirefoxUseTime += diff;

            if (currentUsed != null) {
                let message = new MessageFromBackground();

                let pageData = totalWebsiteUseTime.get(currentUsed);
                if (pageData != null) {
                    pageData.timeCounted += diff;
                    message.pageTimeUpdate = pageData.timeCounted;
                }

                if (pageLoading) {
                    return;
                }

                message.firefoxTimeUpdate = totalFirefoxUseTime;
                browser.tabs.sendMessage(currentPage!, message);
            }




        }
    }
    var timeUpdateInterval = setInterval(timeUpdate, 100)
    browser.windows.onFocusChanged.addListener((windowId) => {
        if (windowId == browser.windows.WINDOW_ID_NONE) {
            firefoxActive = false;
        } else {
            firefoxActive = true;
        }
    })
    //Send update on tab change
    browser.tabs.onActivated.addListener(async (activeInfo) => {

        if (!await pageCanBeLimited(activeInfo.tabId)) {
            return;
        }

        await pageHandle(activeInfo.tabId)
    })
    //Wait for the page load
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        if (changeInfo.status == "complete" && currentPage == tabId) {
            pageHandle(tabId)
        }
    })



    async function handleContentMessage(m: any) {
        let message = <MessageForBackground>m

        if (message.debugReload == true) {
            browser.browsingData.removeCache({ since: 0 });
            browser.tabs.reload(currentPage!);
        }

        if (message.settings != null) {
            if (message.settings.updateTimerPerMiliseconds != settings.updateTimerPerMiliseconds) {
                clearInterval(timeUpdateInterval)
                timeUpdateInterval = setInterval(timeUpdate, message.settings.updateTimerPerMiliseconds!)
            }
            settings = Object.assign(new Settings(), message.settings);
            settings.save();
        }

        if (message.pageData != null) {
            generalPageData.set(new URL(message.pageUrl).hostname, message.pageData);
            savePageData()
        }

        if (message.initializationRequest == true && currentPage != null) {
            initializePage(currentPage, new URL(message.pageUrl).hostname, message.pageUrl)
        }
    }
    browser.runtime.onMessage.addListener(handleContentMessage);

}
background()
