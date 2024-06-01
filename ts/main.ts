
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
let currentFirefoxLimitCount: number | null = null


// Drag Panel Variables
var isDown = false;
var offset = [0, 0];

//Minimize Variables
var minimized = false;
var oldSizeWidth = "";
var oldSizeHeight = "";



var panel: HTMLDivElement | null = null;

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
    let style = document.getElementById("com-limitlost-limiter-style");

    if (style != null) {
        style.remove();
    }

    style = document.createElement("style");
    style.id = "com-limitlost-limiter-style"

    style.innerHTML = `
    #com-limitlost-limiter-panel table,#com-limitlost-limiter-panel tr,#com-limitlost-limiter-panel td{
        border:unset;
        outline:unset;
        background-color:unset;
        background:unset;
    }

    #com-limitlost-limiter-panel {
        color: black;
        display: flex;
        flex-direction: column;
        position: fixed;
        left: 10%;
        top: 10%;
        resize: both;
        z-index: 2147483647;
        border: 1px solid black;
        background-color: rgba(230, 230, 230, 0.8);
        overflow: hidden;
        min-height: 2rem;
        min-width: 3rem;
        border-radius: 0.5rem;
        border-bottom-right-radius: 0;
    }
    #com-limitlost-limiter-panel.transition{
        transition: width 0.2s, height 0.2s;
    }
    #com-limitlost-limiter-top-bar {
        width: 100%;
        height: 2rem;
        background-color: rgba(255, 255, 255, 0.8);
        display: flex;
        justify-content: center;
        flex-direction: row;
        box-sizing: border-box;
    }
    #com-limitlost-limiter-top-bar-button {
        height: 100%;
        aspect-ratio: 1/1;
        background-color: transparent;
        border: none;
        padding: 0.25rem;
        text-decoration: none;
    }
    #com-limitlost-limiter-top-bar-button:hover {
        opacity: 0.7;
    }
    #com-limitlost-limiter-top-bar-button:active {
        opacity: 0.5;
    }
    #com-limitlost-limiter-top-bar-button svg {
        height:100%; 
        aspect-ratio: 1/1;
    }
    #com-limitlost-limiter-top-bar-button svg path {
        height:100%; 
        aspect-ratio: 1/1;
        color:#000000 !important;
        fill:#000000 !important;
        stroke:#000000 !important;
    }
    #com-limitlost-limiter-content {
        display: flex;
        flex-direction: column;
        width: 100%;
        overflow: scroll;
        flex-grow: 1;
        padding: 0.5rem;
        width: fit-content;
    }
    `

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

    content.append("00:00:00");
    content.append("00:00:00");

    panel.appendChild(content);



    document.body.appendChild(panel);

    panel.style.left = `calc(90% - ${panel.clientWidth}px)`;



    console.log("Created")
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

    if (first && page_settings != null) {
        createPanel();
        first = false;
    }

    //         browser.runtime.sendMessage(`volume;${audio.volume}`);

    //         sendResponse(`${id};${result}`);



}

browser.runtime.onMessage.addListener(messageListener)