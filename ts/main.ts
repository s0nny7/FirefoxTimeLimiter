
/**
 * Helper variable for creating limiter panel only once
 **/
var first = true;

//From server and for server variables
let page_settings: Settings | null = null
let pageData: PageData | null = null;
/**
 * in Milliseconds
 */
let currentPageLimitCount: number | null = null
/**
 * in Milliseconds
 */
let currentPageBreakTimeLeft: number = -1
/**
 * in Milliseconds
 */
let currentFirefoxLimitCount: number | null = null
/**
 * in Milliseconds
 */
let currentFirefoxBreakTimeLeft: number = -1


// Drag Panel Variables
var isDown = false;
var offset = [0, 0];

//Minimize Variables
var minimized = false;
var oldSizeWidth = "";
var oldSizeHeight = "";

//Variables and checks needed for iframe transparency
var colorSchemeMeta: HTMLMetaElement | null = null;
var metaDarkMode = false;
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    metaDarkMode = event.matches;
    if (pageData?.fixTransparency) {
        metaDarkMode = !metaDarkMode
    }
    if (colorSchemeMeta != null) {
        colorSchemeMeta.content = metaDarkMode ? "dark" : "light";
    }
});


let panelContainer: HTMLDivElement | null = null;
var panel: HTMLIFrameElement | null = null;
var currentTimeOnPage: HTMLTableCellElement | null = null;
var currentTimeOnPageRow: HTMLTableRowElement | null = null;
var currentTimeFirefox: HTMLTableCellElement | null = null;
var currentTimeFirefoxRow: HTMLTableRowElement | null = null;
var currentTimeLeftPage: HTMLTableCellElement | null = null;
var currentTimeLeftPageRow: HTMLTableRowElement | null = null;
var currentTimeLeftFirefox: HTMLTableCellElement | null = null;
var currentTimeLeftFirefoxRow: HTMLTableRowElement | null = null;
var animationsCheckBox: HTMLInputElement | null = null;
var darkModeCheckBox: HTMLInputElement | null = null;
var fixTransparencyCheckBox: HTMLInputElement | null = null;

var extended = false;
var beforeExtensionHeight = 0;

//Extended Content Variables
var saveButton: HTMLButtonElement | null = null;

function applyPageData() {
    if (panel != null && pageData != null) {
        if (extended) {
            panel.style.width = pageData.widthExtended + "px";
            panel.style.height = pageData.heightExtended + "px";
        } else {
            panel.style.width = pageData.width + "px";
            panel.style.height = pageData.height + "px";
        }
        if (pageData.positionX != null) {
            panel.style.left = pageData.positionX + "%"
        }
        if (pageData.positionY != null) {
            panel.style.top = pageData.positionY + "%"
        }
        fixTransparencyCheckBox!.checked = pageData.fixTransparency;
        if (colorSchemeMeta != null) {
            metaDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (pageData?.fixTransparency) {
                metaDarkMode = !metaDarkMode
            }
            colorSchemeMeta.content = metaDarkMode ? "dark" : "light";
        }

    }
}
    }
}

function style(doc: Document) {
    let style = doc.createElement("link");

    style.rel = "stylesheet"

    style.href = browser.runtime.getURL("internal.css");

    doc.head.appendChild(style);
}

async function globalStyle() {
    let style = <HTMLLinkElement | null>document.getElementById("com-limitlost-limiter-style");

    if (style != null) {
        return;
    }

    style = document.createElement("link");

    style.id = "com-limitlost-limiter-style"

    style.rel = "stylesheet"

    style.href = browser.runtime.getURL("global.css");

    document.head.appendChild(style);

}
globalStyle()

function iconSvg() {
    return `<svg
viewBox="0 0 24 24"
fill="none"
version="1.1"
id="svg3"
xmlns="http://www.w3.org/2000/svg"
xmlns:svg="http://www.w3.org/2000/svg">
<defs
  id="defs3" />
<path
  style="stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1;stroke-width:0.77043;stroke-dasharray:none;paint-order:normal;fill-opacity:1;stroke-dashoffset:0"
  d="m 12,2.25 c -5.3758852,0 -9.75,4.3741148 -9.75,9.75 0,5.375922 4.3741188,9.75 9.75,9.75 5.375918,0 9.75,-4.374082 9.75,-9.75 0,-5.3758812 -4.374078,-9.75 -9.75,-9.75 z m 0,1.5 c 4.565268,0 8.25,3.6847711 8.25,8.25 0,4.565272 -3.684728,8.25 -8.25,8.25 C 7.4347711,20.25 3.75,16.565268 3.75,12 3.75,7.4347752 7.4347752,3.75 12,3.75 Z"
  id="path1" />
<path
  id="path2"
  style="stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1;stroke-width:0.77043;stroke-dasharray:none;paint-order:normal;fill-opacity:1;stroke-dashoffset:0"
  d="M 12 5.25 A 0.75 0.75 0 0 0 11.25 6 L 11.25 11.98623 A 0.75 0.75 0 0 0 11.46873 12.53127 L 15.708984 16.769531 A 0.75 0.75 0 0 0 16.769531 16.769531 A 0.75 0.75 0 0 0 16.769531 15.708984 L 12.75 11.687578 L 12.75 6 A 0.75 0.75 0 0 0 12 5.25 z " />
</svg>`
}

function formatDuration(millis: number) {
    let currentTime = millis;
    //Tenths of a second
    currentTime = Math.floor(currentTime / 100)
    let secondTenths = currentTime % 10
    //Seconds
    currentTime = Math.floor(currentTime / 10)
    let seconds = currentTime % 60
    //Minutes
    currentTime = Math.floor(currentTime / 60)
    let minutes = currentTime % 60
    //Hours
    currentTime = Math.floor(currentTime / 60)
    let hours = currentTime % 24
    //Days
    currentTime = Math.floor(currentTime / 24)
    let days = currentTime

    //Prefixes
    let secondsPrefix = ""
    if (seconds < 10) {
        secondsPrefix = "0"
    }
    let minutesPrefix = ""
    if (minutes < 10) {
        minutesPrefix = "0"
    }
    //Format
    let formatted = `${minutesPrefix}${minutes}:${secondsPrefix}${seconds}:${secondTenths}`
    if (hours > 0 || days > 0) {
        formatted = `${hours}:${formatted}`
        if (days > 0) {
            formatted = `${days}:${formatted}`
        }
    }
    return formatted
}

function createContent() {
    let panelDocument = panel!.contentWindow!.document;

    // Current Time On Page
    currentTimeOnPage = <HTMLTableCellElement>panelDocument.getElementById("current-time-on-page")!;
    currentTimeOnPageRow = <HTMLTableRowElement>currentTimeOnPage.parentElement!;

    if (page_settings?.showCurrentTimeWebsite) {
        if (currentPageLimitCount != null) {
            currentTimeOnPage.innerText = formatDuration(currentPageLimitCount);
        } else {
            currentTimeOnPage.innerText = "Limit is not counted on this page";
        }

    } else {
        currentTimeOnPageRow.style.display = "none";
    }

    // Page Time Left Until Break
    currentTimeLeftPage = <HTMLTableCellElement>panelDocument.getElementById("current-time-left-on-page")!;
    currentTimeLeftPageRow = <HTMLTableRowElement>currentTimeLeftPage.parentElement!;

    if (currentPageBreakTimeLeft > 0) {
        currentTimeLeftPage.innerText = formatDuration(currentPageBreakTimeLeft);
    } else {
        currentTimeLeftPageRow.style.display = "none";
    }

    // Current Time In Firefox
    currentTimeFirefox = <HTMLTableCellElement>panelDocument.getElementById("current-time-on-firefox")!;
    currentTimeFirefoxRow = <HTMLTableRowElement>currentTimeFirefox.parentElement!;

    if (page_settings?.showCurrentTimeFirefox && currentFirefoxLimitCount != null) {
        currentTimeFirefox.innerText = formatDuration(currentFirefoxLimitCount);
    } else {
        currentTimeFirefox.parentElement!.style.display = "none";
    }

    // Firefox Time Left Until Break
    currentTimeLeftFirefox = <HTMLTableCellElement>panelDocument.getElementById("current-time-left-on-firefox")!
    currentTimeLeftFirefoxRow = <HTMLTableRowElement>currentTimeLeftFirefox.parentElement!;

    if (currentFirefoxBreakTimeLeft > 0) {
        currentTimeLeftFirefox.innerText = formatDuration(currentFirefoxBreakTimeLeft);
    } else {
        currentTimeLeftFirefoxRow.style.display = "none";
    }

    //Extended Content Variables
    let extendedDivParent = panelDocument.createElement("extended-content");
    let extendedDiv = panelDocument.getElementById("extended-content-internal")!;
    // Extend Button

    let extendButton = panelDocument.getElementById("extend-button")!;

    extendButton.onclick = () => {
        let rect = panelContainer!.getBoundingClientRect()
        if (extended) {
            extendButton.innerText = "Extend";
            panelContainer!.classList.add("com-limitlost-limiter-transition");
            extendedDivParent.style.setProperty("height", "0px", "important");

            panelContainer!.style.setProperty("height", beforeExtensionHeight + "px", "important");
        } else {
            panelContainer!.style.height = rect.height + "px";
            extendButton.innerText = "Hide";
            panelContainer!.classList.add("com-limitlost-limiter-transition");
            extendedDivParent.style.setProperty("height", extendedDiv.offsetHeight + "px", "important");
            panelContainer!.style.setProperty("height", beforeExtensionHeight + extendedDiv.offsetHeight + "px", "important");
        }
        extended = !extended;
    }

    //Debug: Reload Button
    let reloadButton = panelDocument.getElementById("reload-button")!
    if (page_settings?.debugMode) {
        reloadButton.onclick = () => {
            let message = new MessageForBackground();
            message.debugReload = true;

            browser.runtime.sendMessage(message);
        }
    } else {
        reloadButton.style.display = "none";
    }

    // Save Button
    saveButton = <HTMLButtonElement>panelDocument.getElementById("save-button")!;

    // Animations Checkbox
    animationsCheckBox = <HTMLInputElement>panelDocument.getElementById("animations-checkbox")!;
    animationsCheckBox.onchange = () => {
        saveNeeded();
        page_settings!.animations = animationsCheckBox?.checked ?? false;

        panelContainer!.classList.toggle("com-limitlost-limiter-animated", page_settings!.animations!)
        panelDocument!.body.parentElement!.classList.toggle("no-animations", !page_settings!.animations!);
    }

    //Dark Mode Checkbox
    darkModeCheckBox = <HTMLInputElement>panelDocument.getElementById("dark-mode-checkbox")!;
    darkModeCheckBox.onchange = () => {
        saveNeeded();
        page_settings!.darkMode = darkModeCheckBox?.checked ?? false;
        panelDocument!.body.parentElement!.classList.toggle("dark-mode", page_settings!.darkMode);
    }
    //Fix Transparency Checkbox
    fixTransparencyCheckBox = <HTMLInputElement>panelDocument.getElementById("fix-transparency-checkbox")!;
    fixTransparencyCheckBox.onchange = () => {
        pageData!.fixTransparency = fixTransparencyCheckBox?.checked ?? false;

        metaDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (pageData?.fixTransparency) {
            metaDarkMode = !metaDarkMode
        }
        colorSchemeMeta!.content = metaDarkMode ? "dark" : "light";

        pageDataUpdate();
    }


    //Reset Time Count On Page Button
    let resetTimeCountOnPageButton = panelDocument.getElementById("reset-page-time")!;
    resetTimeCountOnPageButton.onclick = () => {
        let message = new MessageForBackground(document.URL);
        message.resetTimeCountPage = true;

        browser.runtime.sendMessage(message);
    }


    //Reset Break Time On Firefox Button
    let resetTimeCountOnFirefoxButton = panelDocument.getElementById("reset-firefox-time")!;
    resetTimeCountOnFirefoxButton.onclick = () => {
        let message = new MessageForBackground(document.URL);
        message.resetTimeCountFirefox = true;

        browser.runtime.sendMessage(message);
    }

    extendedDivParent.style.height = extendedDiv.offsetHeight + "px";
}


async function createPanel() {

    let old = document.getElementById("com-limitlost-limiter-panel-container")
    //Remove Old Panel If it Already Exists
    if (old != null) {
        old.remove();
    }

    panelContainer = document.createElement("div");
    panelContainer.id = "com-limitlost-limiter-panel-container"

    //Add Static limiter panel above everything
    panel = document.createElement("iframe");

    panel.onload = () => {
        let innerWindow = panel!.contentWindow!
        let innerDocument = innerWindow.document

        //Dark mode meta update
        metaDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (pageData?.fixTransparency) {
            metaDarkMode = !metaDarkMode
        }
        colorSchemeMeta = innerDocument.getElementById("meta-color-scheme") as HTMLMetaElement;
        colorSchemeMeta.content = metaDarkMode ? "dark" : "light";

        style(innerDocument);

        let topBar = innerDocument.getElementById("top-bar")!;

        //Drag Panel Events
        topBar.addEventListener('mousedown', function (e) {
            if (e.button != 0) {
                return;
            }
            isDown = true;
            offset = [
                panelContainer!.offsetLeft - e.screenX,
                panelContainer!.offsetTop - e.screenY
            ];
        }, true);

        function mouseUp() {
            isDown = false;
        }

        function mouseMove(event: MouseEvent) {
            if (isDown) {

                let leftOffsetPx = event.screenX + offset[0];
                let topOffsetPx = event.screenY + offset[1];

                let leftOffset;
                //Left Bounds check
                if (leftOffsetPx + panel!.offsetWidth > window.innerWidth) {
                    leftOffset = (window.innerWidth - panelContainer!.offsetWidth) / window.innerWidth * 100
                } else if (leftOffsetPx < 0) {
                    leftOffset = 0
                } else {
                    leftOffset = leftOffsetPx / window.innerWidth * 100
                }


                let topOffset;
                //Top bounds check
                if (topOffsetPx + panelContainer!.offsetHeight > window.innerHeight) {
                    topOffsetPx = (window.innerHeight - panelContainer!.offsetHeight) / window.innerHeight * 100
                } else if (topOffsetPx < 0) {
                    topOffset = 0
                } else {
                    topOffset = topOffsetPx / window.innerHeight * 100
                }


                panelContainer!.style.setProperty("left", leftOffset + '%', "important");
                panelContainer!.style.setProperty("top", topOffset + '%', "important");
            }
        }

        document.addEventListener('mouseup', mouseUp, true);

        innerDocument.addEventListener('mouseup', function () {
            isDown = false;
        }, true);

        innerDocument.addEventListener('mousemove', mouseMove, true);

        let topBarButton = innerDocument.getElementById("top-bar-button")!;
        topBarButton.onclick = function () {
            if (!minimized) {
                if (panelContainer!.style.width == "") {
                    panelContainer!.style.setProperty("width", innerWindow.innerWidth + "px", "important");
                }
                if (panelContainer!.style.height == "") {
                    panelContainer!.style.setProperty("height", innerWindow.innerHeight + "px", "important");
                }
                panelContainer!.classList.add("com-limitlost-limiter-transition");
                oldSizeWidth = panelContainer!.style.width;
                oldSizeHeight = panelContainer!.style.height;
                panelContainer!.style.setProperty("width", "0px", "important");
                panelContainer!.style.setProperty("height", "0px", "important");
                panelContainer!.style.setProperty("resize", "none", "important");
            } else {
                panelContainer!.classList.add("com-limitlost-limiter-transition");
                panelContainer!.style.setProperty("width", oldSizeWidth, "important");
                panelContainer!.style.setProperty("height", oldSizeHeight, "important");
                panelContainer!.style.resize = "";
            }


            minimized = !minimized
        }

        createContent();

        beforeExtensionHeight = innerWindow.innerHeight;
        panelContainer!.style.setProperty("left", `calc(90% - ${panel!.clientWidth}px)`, "important");
        panelContainer!.style.setProperty("height", beforeExtensionHeight + "px", "important");
        panelContainer!.style.setProperty("width", `${innerWindow.innerWidth}px`, "important");
    }

    panelContainer.appendChild(panel);
    document.body.appendChild(panelContainer);

    panel.src = browser.runtime.getURL("panel.html");

    panel.id = "com-limitlost-limiter-panel";

    //Remove transition class when resizing
    panelContainer.addEventListener('mousedown', function (e) {
        if (e.target == panelContainer) {
            panelContainer!.classList.remove("com-limitlost-limiter-transition")
        }
    });

}

function messageListener(m: any, sender: browser.runtime.MessageSender, sendResponse: ((response?: any) => boolean | void | Promise<any>)) {

    let message = <MessageFromBackground>m;
    if (message.settings != null) {
        page_settings = message.settings;
    }
    if (message.pageData != null) {
        pageData = message.pageData
        applyPageData();
    }
    if (message.pageTimeUpdate != null) {
        currentPageLimitCount = message.pageTimeUpdate;
        if (currentTimeOnPage != null) {
            currentTimeOnPage.innerText = formatDuration(currentPageLimitCount);
        }
    }
    if (message.firefoxTimeUpdate != null) {
        currentFirefoxLimitCount = message.firefoxTimeUpdate;
        if (currentTimeFirefox != null) {
            currentTimeFirefox.innerText = formatDuration(currentFirefoxLimitCount);
        }
    }
    if (message.websiteToBreakTimeLeft != null) {
        if (currentPageBreakTimeLeft < 0 && message.websiteToBreakTimeLeft > 0 && currentTimeLeftPage != null) {
            //Unhide Time Left To Break
            currentTimeLeftPage.parentElement!.style.display = "";
        }
        currentPageBreakTimeLeft = message.websiteToBreakTimeLeft;
        if (currentTimeLeftPage != null) {
            if (currentPageBreakTimeLeft < 0) {
                //Hide Time Left To Break
                currentTimeLeftPage.parentElement!.style.display = "none";
            }
            currentTimeLeftPage.innerText = formatDuration(currentPageBreakTimeLeft);
        }
    }
    if (message.firefoxToBreakTimeLeft != null) {
        if (currentFirefoxBreakTimeLeft < 0 && message.firefoxToBreakTimeLeft > 0 && currentTimeLeftFirefox != null) {
            //Unhide Time Left To Break
            currentTimeLeftFirefox.parentElement!.style.display = "";
        }
        currentFirefoxBreakTimeLeft = message.firefoxToBreakTimeLeft;
        if (currentTimeLeftFirefox != null) {
            if (currentFirefoxBreakTimeLeft < 0) {
                //Hide Time Left To Break
                currentTimeLeftFirefox.parentElement!.style.display = "none";
            }
            currentTimeLeftFirefox.innerText = formatDuration(currentFirefoxBreakTimeLeft);
        }
    }

    if (message.alert) {
        alert(message.alert)
    }

    if (first && page_settings != null) {
        createPanel();
        first = false;
    }

    //         browser.runtime.sendMessage(`volume;${audio.volume}`);

    //         sendResponse(`${id};${result}`);



}

browser.runtime.onMessage.addListener(messageListener)