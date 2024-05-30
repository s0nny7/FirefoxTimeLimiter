
function nowUtcMillis() {
    let date = new Date();
    //Converted From Minutes To Milliseconds
    let timezoneDiff = date.getTimezoneOffset() * 60 * 1000
    //If you're time is later than UTC then timezoneDiff is negative
    return date.getTime() + timezoneDiff
}
// Drag Panel Variables
var isDown = false;
var offset = [0, 0];
function style() {
    let style = document.getElementById("com-limitlost-limiter-style");

    if (style != null) {
        style.remove();
    }

    style = document.createElement("style");
    style.id = "com-limitlost-limiter-style"

    style.innerHTML = `
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
        background-color: rgba(255, 255, 255, 0.8);
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
  style="color:#000000;fill:#000000;stroke-linecap:round;stroke-linejoin:round;stroke:#000000;stroke-opacity:1;stroke-width:0.77043;stroke-dasharray:none;paint-order:normal;fill-opacity:1;stroke-dashoffset:0"
      d="m 12,2.25 c -5.3758852,0 -9.75,4.3741148 -9.75,9.75 0,5.375922 4.3741188,9.75 9.75,9.75 5.375918,0 9.75,-4.374082 9.75,-9.75 0,-5.3758812 -4.374078,-9.75 -9.75,-9.75 z m 0,1.5 c 4.565268,0 8.25,3.6847711 8.25,8.25 0,4.565272 -3.684728,8.25 -8.25,8.25 C 7.4347711,20.25 3.75,16.565268 3.75,12 3.75,7.4347752 7.4347752,3.75 12,3.75 Z"
      id="path1" />
   <path
      id="path2"
  style="stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1;stroke-width:0.77043;stroke-dasharray:none;paint-order:normal;fill-opacity:1;stroke-dashoffset:0"
      d="M 12 5.25 A 0.75 0.75 0 0 0 11.25 6 L 11.25 11.98623 A 0.75 0.75 0 0 0 11.46873 12.53127 L 15.708984 16.769531 A 0.75 0.75 0 0 0 16.769531 16.769531 A 0.75 0.75 0 0 0 16.769531 15.708984 L 12.75 11.687578 L 12.75 6 A 0.75 0.75 0 0 0 12 5.25 z " />
 </svg>`
}

function createPanel() {
    let old = document.getElementById("com-limitlost-limiter-panel")
    //Remove Old Panel If it Already Exists
    if (old != null) {
        old.remove();
    }

    //Add Static limiter panel above everything
    let panel = document.createElement("div");
    panel.id = "com-limitlost-limiter-panel";
    
    //Create Elements Inside of Panel
    let content = document.createElement("div");
    let topBar = document.createElement("div");

    //Top Bar
    topBar.id = "com-limitlost-limiter-top-bar"

    //Drag Panel Events
    topBar.addEventListener('mousedown', function (e) {
        isDown = true;
        offset = [
            panel.offsetLeft - e.clientX,
            panel.offsetTop - e.clientY
        ];
    }, true);

    document.addEventListener('mouseup', function () {
        isDown = false;
    }, true);

    document.addEventListener('mousemove', function (event) {
        if (isDown) {
            panel.style.left = (event.clientX + offset[0]) + 'px';
            panel.style.top = (event.clientY + offset[1]) + 'px';
            panel.style.right = "";
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







function messageListener(message: any, sender: browser.runtime.MessageSender, sendResponse: ((response?: any) => boolean | void | Promise<any>)) {

    let message_str = <string>message;

    //         browser.runtime.sendMessage(`volume;${audio.volume}`);

    //         sendResponse(`${id};${result}`);



}

browser.runtime.onMessage.addListener(messageListener)

createPanel();