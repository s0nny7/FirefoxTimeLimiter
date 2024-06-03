
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



var panel: HTMLDivElement | null = null;
var currentTimeOnPage: HTMLDivElement | null = null;
var currentTimeFirefox: HTMLDivElement | null = null;
var currentTimeLeftPage: HTMLDivElement | null = null;
var currentTimeLeftFirefox: HTMLDivElement | null = null;
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
    }
}

function style() {

    if (document.getElementById("com-limitlost-limiter-style") != null) {
        return;
    }

    let style = document.createElement("link");
    style.id = "com-limitlost-limiter-style"

    style.rel = "stylesheet"

    style.href = browser.runtime.getURL("limiter.css");

    document.head.appendChild(style);
}
style()

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

function createRow(id: string, name: string, parent: HTMLTableElement, padding_bottom: string = "0.2rem") {
    let row = document.createElement("tr");
    row.id = id;
    let name_obj = document.createElement("td");
    name_obj.style.paddingBottom = padding_bottom;
    name_obj.innerText = name;
    row.appendChild(name_obj);
    let data = document.createElement("td");
    data.style.paddingBottom = padding_bottom;
    data.style.paddingLeft = "0.5rem";
    row.appendChild(data);

    parent.appendChild(row);

    return data;
}

function createCheckBoxRow(name: string, checked: boolean) {
    let row = document.createElement("label");
    row.classList.add("com-limitlost-limiter-checkbox-row");
    row.style.display = "flex";
    row.style.flexDirection = "row";
    row.style.gap = "0.5rem";
    row.style.alignItems = "center";

    let checkbox = document.createElement("input");
    checkbox.style.display = "none";
    checkbox.type = "checkbox";
    checkbox.checked = checked;
    row.appendChild(checkbox);

    let fakeCheckbox = document.createElement("div");
    fakeCheckbox.classList.add("com-limitlost-limiter-fake-checkbox");


    row.appendChild(fakeCheckbox);

    let nameElement = document.createElement("div");
    nameElement.innerText = name;
    row.appendChild(nameElement);

    return row;
}

function createContent(content: HTMLDivElement) {
    let table = document.createElement("table");
    table.style.border = "none";
    table.style.outline = "none";

    // Current Time On Page
    currentTimeOnPage = createRow("com-limitlost-limiter-website-time-row", "Website:", table);

    if (page_settings?.showCurrentTimeWebsite) {
        if (currentPageLimitCount != null) {
            currentTimeOnPage.innerText = formatDuration(currentPageLimitCount);
        } else {
            currentTimeOnPage.innerText = "Limit is not counted on this page";
        }

    } else {
        currentTimeOnPage.parentElement!.style.display = "none";
    }

    // Page Time Left Until Break
    currentTimeLeftPage = createRow("com-limitlost-limiter-website-time-left-row", "Break Starts In:", table, "0.5rem");
    if (currentPageBreakTimeLeft > 0) {
        currentTimeLeftPage.innerText = formatDuration(currentPageBreakTimeLeft);
    } else {
        currentTimeLeftPage.parentElement!.style.display = "none";
    }

    // Current Time In Firefox
    currentTimeFirefox = createRow("com-limitlost-limiter-firefox-time-row", "Firefox: ", table);

    if (page_settings?.showCurrentTimeFirefox && currentFirefoxLimitCount != null) {
        currentTimeFirefox.innerText = formatDuration(currentFirefoxLimitCount);
    } else {
        currentTimeFirefox.parentElement!.style.display = "none";
    }
    // Firefox Time Left Until Break
    currentTimeLeftFirefox = createRow("com-limitlost-limiter-firefox-time-left-row", "Break Starts In:", table, "0.5rem");
    if (currentFirefoxBreakTimeLeft > 0) {
        currentTimeLeftFirefox.innerText = formatDuration(currentFirefoxBreakTimeLeft);
    } else {
        currentTimeLeftFirefox.parentElement!.style.display = "none";
    }

    content.appendChild(table);

    //Extended Content Variables
    let extendedDivParent = document.createElement("div");
    let extendedDiv = document.createElement("div");
    // Extend Button

    let button = document.createElement("button");
    button.innerText = "Extend";
    button.style.width = "100%";
    button.style.marginBottom = "0.25rem";

    button.onclick = () => {
        let rect = panel!.getBoundingClientRect()
        if (extended) {
            button.innerText = "Extend";
            panel!.classList.add("transition");
            extendedDivParent.style.height = "0px";

            panel!.style.height = beforeExtensionHeight + "px";
        } else {
            panel!.style.height = rect.height + "px";
            button.innerText = "Hide";
            panel!.classList.add("transition");
            extendedDivParent.style.height = extendedDiv.offsetHeight + "px";
            panel!.style.height = (beforeExtensionHeight + extendedDiv.offsetHeight) + "px";
        }
        extended = !extended;
    }

    content.appendChild(button);

    // Extended Content
    extendedDivParent.id = "com-limitlost-limiter-extended-content";
    extendedDivParent.style.height = extendedDiv.offsetHeight + "px";

    extendedDiv.id = "com-limitlost-limiter-extended-content-internal";
    extendedDivParent.appendChild(extendedDiv);

    // Save Button
    saveButton = document.createElement("button");
    saveButton.innerText = "Save";
    saveButton.style.width = "100%";
    saveButton.style.marginBottom = "0.5rem";

    extendedDiv.appendChild(saveButton);

    //Disable Animations

    let row = createCheckBoxRow("Animations", true);
    row.style.marginBottom = "0.5rem";

    extendedDiv.appendChild(row);


    //Reset Time Count On Page Button
    let resetTimeCountOnPageButton = document.createElement("button");
    resetTimeCountOnPageButton.innerText = "Reset Page Time Count";
    resetTimeCountOnPageButton.style.width = "100%";
    resetTimeCountOnPageButton.onclick = () => {
        let message = new MessageForBackground(document.URL);
        message.resetTimeCountPage = true;

        browser.runtime.sendMessage(message);
    }

    extendedDiv.appendChild(resetTimeCountOnPageButton);


    //Reset Break Time On Firefox Button
    let resetTimeCountOnFirefoxButton = document.createElement("button");
    resetTimeCountOnFirefoxButton.innerText = "Reset Firefox Time Count";
    resetTimeCountOnFirefoxButton.style.width = "100%";
    resetTimeCountOnFirefoxButton.onclick = () => {
        let message = new MessageForBackground(document.URL);
        message.resetTimeCountFirefox = true;

        browser.runtime.sendMessage(message);
    }

    extendedDiv.appendChild(resetTimeCountOnFirefoxButton);

    content.appendChild(extendedDivParent);
}


function createPanel() {
    let old = document.getElementById("com-limitlost-limiter-panel")
    //Remove Old Panel If it Already Exists
    if (old != null) {
        old.remove();
    }

    //Add Static limiter panel above everything
    panel = document.createElement("div");
    panel.id = "com-limitlost-limiter-panel";

    //Remove transition class when resizing
    panel.addEventListener('mousedown', function (e) {
        if (e.target == panel) {
            panel!.classList.remove("transition")
        }
    });

    //Create Elements Inside of Panel
    let content = document.createElement("div");
    let topBar = document.createElement("div");

    //Top Bar
    topBar.id = "com-limitlost-limiter-top-bar"

    let topBarButton = document.createElement("button");
    topBarButton.id = "com-limitlost-limiter-top-bar-button"
    topBarButton.innerHTML = iconSvg();

    topBarButton.onclick = function () {
        if (!minimized) {
            if (panel!.style.width == "") {
                panel!.style.width = panel!.offsetWidth + "px"
            }
            if (panel!.style.height == "") {
                panel!.style.height = panel!.offsetHeight + "px"
            }
            panel!.classList.add("transition");
            oldSizeWidth = panel!.style.width;
            oldSizeHeight = panel!.style.height;
            panel!.style.width = "0px";
            panel!.style.height = "0px";
            panel!.style.resize = "none";
        } else {
            panel!.classList.add("transition");
            panel!.style.width = oldSizeWidth;
            panel!.style.height = oldSizeHeight;
            panel!.style.resize = "";
        }


        minimized = !minimized
    }

    topBar.appendChild(topBarButton);

    //Drag Panel Events
    topBar.addEventListener('mousedown', function (e) {
        if (e.button != 0) {
            return;
        }
        isDown = true;
        offset = [
            panel!.offsetLeft - e.clientX,
            panel!.offsetTop - e.clientY
        ];
    }, true);

    document.addEventListener('mouseup', function () {
        isDown = false;
    }, true);

    document.addEventListener('mousemove', function (event) {
        if (isDown) {
            let leftOffsetPx = event.clientX + offset[0];
            let topOffsetPx = event.clientY + offset[1];

            let leftOffset;
            //Left Bounds check
            if (leftOffsetPx + panel!.offsetWidth > window.innerWidth) {
                leftOffset = (window.innerWidth - panel!.offsetWidth) / window.innerWidth * 100
            } else if (leftOffsetPx < 0) {
                leftOffset = 0
            } else {
                leftOffset = leftOffsetPx / window.innerWidth * 100
            }


            let topOffset;
            //Top bounds check
            if (topOffsetPx + panel!.offsetHeight > window.innerHeight) {
                topOffsetPx = (window.innerHeight - panel!.offsetHeight) / window.innerHeight * 100
            } else if (topOffsetPx < 0) {
                topOffset = 0
            } else {
                topOffset = topOffsetPx / window.innerHeight * 100
            }


            panel!.style.left = leftOffset + '%';
            panel!.style.top = topOffset + '%';
        }
    }, true);

    panel.appendChild(topBar);

    //Content
    content.id = "com-limitlost-limiter-content";

    createContent(content);

    panel.appendChild(content);

    document.body.appendChild(panel);
    beforeExtensionHeight = panel!.offsetHeight;

    panel.style.left = `calc(90% - ${panel.clientWidth}px)`;

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

    if (first && page_settings != null) {
        createPanel();
        first = false;
    }

    //         browser.runtime.sendMessage(`volume;${audio.volume}`);

    //         sendResponse(`${id};${result}`);



}

browser.runtime.onMessage.addListener(messageListener)