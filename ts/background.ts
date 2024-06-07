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
    /**
     * In Milliseconds
     */
    var firefoxBreakTimeLeft: number | null = null;
    var totalWebsiteUseTime: Map<string, PageTimeData> = new Map();
    var currentUsed: string | null = null;
    /**
     * In Milliseconds
     */
    var lastTimeUpdate = nowUtcMillis();
    /**
     * In Milliseconds, The Moment when extension was activated
     */
    var startTime = nowUtcMillis();

    function loadTimeData() {
        browser.storage.local.get(["totalWebsiteUseTime",
            "totalFirefoxUseTime", "lastTimeUpdate", "firefoxBreakTimeLeft"]).then((result) => {
                totalWebsiteUseTime = new Map(JSON.parse(result["totalWebsiteUseTime"]))
                totalFirefoxUseTime = result["totalFirefoxUseTime"] ?? 0;
                lastTimeUpdate = result["lastTimeUpdate"] ?? nowUtcMillis();
                firefoxBreakTimeLeft = result["firefoxBreakTimeLeft"] ?? null;
            });
    }
    await loadTimeData();

    function saveTimeData() {
        browser.storage.local.set({
            "totalWebsiteUseTime": JSON.stringify(Array.from(totalWebsiteUseTime.entries())),
            "totalFirefoxUseTime": totalFirefoxUseTime,
            "lastTimeUpdate": lastTimeUpdate,
            "firefoxBreakTimeLeft": firefoxBreakTimeLeft,
        });
    }

    function resetTimeData() {
        totalFirefoxUseTime = 0;
        totalWebsiteUseTime = new Map();
        saveTimeData();
    }
    function resetTimeDataCheck(currentTimeMillis: number) {
        if (lastTimeUpdate < currentTimeMillis && settings.resetTimeCountAfter! > 0) {
            let diff = currentTimeMillis - lastTimeUpdate
            //Reset Check
            if (diff > settings.resetTimeCountAfter! * 3600 * 1000) {
                lastTimeUpdate = currentTimeMillis
                resetTimeData();
            }
        }
    }
    resetTimeDataCheck(startTime)



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
        let foundBreakTimeLeft: number | null = null;

        for (const iterator of settings.websiteTimeLimit!) {
            let key = iterator[0]
            let value = iterator[1]
            if (value.regex) {
                let regex = new RegExp(key);
                if (regex.test(url)) {
                    found = key;
                    let timeData = totalWebsiteUseTime.get(found);
                    if (timeData == null) {
                        timeData = new PageTimeData(false)
                        timeData.regex_key = true;
                        totalWebsiteUseTime.set(key, timeData)
                    }
                    foundTime = timeData.timeCounted
                    foundBreakTimeLeft = timeData.breakTimeLeft
                    matchedUrl = true;
                    break;
                }
            } else {
                if (hostname.endsWith(key)) {
                    found = key;
                    let timeData = totalWebsiteUseTime.get(found);
                    if (timeData == null) {
                        timeData = new PageTimeData(false)
                        timeData.regex_key = true;
                        totalWebsiteUseTime.set(key, timeData)
                    }
                    foundTime = timeData.timeCounted
                    foundBreakTimeLeft = timeData.breakTimeLeft
                    matchedUrl = true;
                    break;
                }
            }
        }

        if (!matchedUrl) {
            for (const iterator of totalWebsiteUseTime) {
                let key = iterator[0]
                let value = iterator[1]
                if (!value.regex_key) {
                    if (hostname.endsWith(key)) {
                        found = key;
                        foundTime = value.timeCounted
                        foundBreakTimeLeft = value.breakTimeLeft
                        matchedUrl = true;
                        break;
                    }
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

        let breakActive = false;

        if (firefoxBreakTimeLeft != null) {
            message.break = BreakType.Firefox;
            message.breakTimeLeft = firefoxBreakTimeLeft;
            breakActive = true;
        }
        else if (foundBreakTimeLeft != null) {
            message.break = BreakType.Website;
            message.breakTimeLeft = foundBreakTimeLeft;
            breakActive = true;
        }

        if (!breakActive) {
            message.break = BreakType.None;
        }

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

        //Firefox Break Update
        if (firefoxBreakTimeLeft != null) {
            lastTimeUpdate = now;
            if (firefoxBreakTimeLeft > 0) {
                firefoxBreakTimeLeft -= diff;
                if (firefoxBreakTimeLeft <= 0) {
                    firefoxBreakTimeLeft = null;
                    totalFirefoxUseTime = 0;
                }
            }
            if (currentUsed != null) {
                let message = new MessageFromBackground();
                if (firefoxBreakTimeLeft != null) {
                    message.break = BreakType.Firefox;
                    message.breakTimeLeft = firefoxBreakTimeLeft;
                } else {
                    message.break = BreakType.None;
                }
                browser.tabs.sendMessage(currentPage!, message);
            }
            return;
        }

        //Website Break Update
        if (currentUsed != null) {
            let pageData = totalWebsiteUseTime.get(currentUsed);
            if (pageData != null && pageData.breakTimeLeft != null) {
                lastTimeUpdate = now;
                if (pageData.breakTimeLeft > 0) {
                    pageData.breakTimeLeft -= diff;
                    if (pageData.breakTimeLeft <= 0) {
                        pageData.breakTimeLeft = null;
                    }
                }
                let message = new MessageFromBackground();
                if (pageData.breakTimeLeft != null) {
                    message.break = BreakType.Website;
                    message.breakTimeLeft = pageData.breakTimeLeft;
                } else {
                    message.break = BreakType.None;
                }
                browser.tabs.sendMessage(currentPage!, message);
                return;
            }
        }

        if (!settings.countTimeOnLostFocus && !firefoxActive) {
            lastTimeUpdate = now;
            return;
        }

        if (diff > 3 * 60_000) {
            //Skip potential computer sleep time
            resetTimeDataCheck(now);
            lastTimeUpdate = now;
            return;
        }

        lastTimeUpdate = now;

        if (firefoxActive || settings.countTimeOnLostFocus) {
            totalFirefoxUseTime += diff;

            if (currentUsed != null) {
                let message = new MessageFromBackground();

                //Check For Firefox Time Limit
                if (settings.firefoxTimeLimit! > 0) {
                    let timeLimitMillis = settings.firefoxTimeLimit! * 60_000
                    if (totalFirefoxUseTime > timeLimitMillis) {
                        message.firefoxToBreakTimeLeft = -1;

                        message.break = BreakType.Firefox;
                        if (settings.firefoxBreakTime! > 0) {
                            firefoxBreakTimeLeft = settings.firefoxBreakTime! * 60_000;
                        } else {
                            firefoxBreakTimeLeft = -1;
                        }
                        message.breakTimeLeft = firefoxBreakTimeLeft;
                    } else {
                        message.firefoxToBreakTimeLeft = timeLimitMillis - totalFirefoxUseTime;
                    }
                }

                //Check For Website Time Limit
                let pageLimitData = settings.websiteTimeLimit!.get(currentUsed);
                if (pageLimitData != null) {
                    if (pageLimitData.limitTime > 0) {
                        let timeLimitMillis = pageLimitData.limitTime * 60_000
                        let websiteUseTime = totalWebsiteUseTime.get(currentUsed)!
                        let timeCounted = websiteUseTime.timeCounted ?? 0

                        if (timeCounted > timeLimitMillis) {
                            message.websiteToBreakTimeLeft = -1;

                            message.break = BreakType.Website;
                            if (pageLimitData.breakTime > 0) {
                                websiteUseTime.breakTimeLeft = pageLimitData.breakTime * 60_000;
                            } else {
                                websiteUseTime.breakTimeLeft = -1;
                            }
                            message.breakTimeLeft = websiteUseTime.breakTimeLeft;
                        } else {
                            message.websiteToBreakTimeLeft = timeLimitMillis - timeCounted;
                        }
                    }
                }



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
    var timeUpdateInterval = setInterval(timeUpdate, settings.updateTimerPerMiliseconds!)

    function autoSave() {
        saveTimeData();
    }
    setInterval(autoSave, 1000)

    browser.windows.onFocusChanged.addListener((windowId) => {
        if (windowId == browser.windows.WINDOW_ID_NONE) {
            firefoxActive = false;
        } else {
            resetTimeDataCheck(nowUtcMillis());
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
            if (currentPage != null) {
                if (message.settings.firefoxTimeLimit != settings.firefoxTimeLimit) {
                    let response = new MessageFromBackground();
                    response.firefoxToBreakTimeLeft = message.settings!.firefoxTimeLimit! * 60_000 - totalFirefoxUseTime;
                    browser.tabs.sendMessage(currentPage, response);
                }
                let totalUseTime = totalWebsiteUseTime.get(currentUsed!);
                if (totalUseTime != null) {
                    let oldLimitTime = message.settings.websiteTimeLimit?.get(currentUsed!);
                    let newLimitTime = settings.websiteTimeLimit?.get(currentUsed!)

                    if (oldLimitTime?.limitTime != newLimitTime?.limitTime) {
                        let response = new MessageFromBackground();
                        if (newLimitTime != null) {
                            response.websiteToBreakTimeLeft = newLimitTime!.limitTime * 60_000 - totalUseTime.timeCounted;
                        } else {
                            response.websiteToBreakTimeLeft = -1;
                        }
                        browser.tabs.sendMessage(currentPage, response);
                    }
                }
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

        if (message.stopBreak == true) {
            //Firefox Update
            if (firefoxBreakTimeLeft != null) {
                firefoxBreakTimeLeft = null;
                totalFirefoxUseTime = 0;
                if (currentPage != null) {
                    let message = new MessageFromBackground()
                    message.break = BreakType.None;
                    browser.tabs.sendMessage(currentPage!, message)
                }
                saveTimeData();
            }
            //Website Update
            if (currentUsed != null) {
                let pageData = totalWebsiteUseTime.get(currentUsed);
                if (pageData != null && pageData.breakTimeLeft != null) {
                    pageData.breakTimeLeft = null;
                    let message = new MessageFromBackground()
                    message.break = BreakType.None;
                    browser.tabs.sendMessage(currentPage!, message)
                    saveTimeData();
                }
            }
        }

        if (message.resetTimeCountFirefox == true) {
            totalFirefoxUseTime = 0;
            if (firefoxBreakTimeLeft != null) {
                firefoxBreakTimeLeft = null;
                if (currentPage != null) {
                    let message = new MessageFromBackground()
                    message.break = BreakType.None;
                    browser.tabs.sendMessage(currentPage!, message)
                }
            }
            saveTimeData();
        }

        if (message.resetTimeCountPage == true) {
            let pageData = totalWebsiteUseTime.get(currentUsed!)
            if (pageData != null) {
                pageData.timeCounted = 0;
                if (pageData.breakTimeLeft != null) {
                    pageData.breakTimeLeft = null;
                    let message = new MessageFromBackground()
                    message.break = BreakType.None;
                    browser.tabs.sendMessage(currentPage!, message)
                }
            }
            saveTimeData();
        }
    }
    browser.runtime.onMessage.addListener(handleContentMessage);

}
background()
