class PageLimitData {
    regex: boolean = false;
    limitMillis: number;

    breakMillis: number = -1;
    constructor(limitMillis: number) {
        this.limitMillis = limitMillis;
    }
}

class PageData {
    positionX: number | null = null;
    positionY: number | null = null;
    height: number | null = null;
    width: number | null = null;
    heightExtended: number | null = null;
    widthExtended: number | null = null;
    constructor() {
    }
}

class PageBreakData {
    lengthMillis: number;
    constructor(lengthMillis: number) {
        this.lengthMillis = lengthMillis;
    }
}


class Settings {

    generalPageData: Map<string, PageData> | null = null;

    updateTimerPerMiliseconds: number | null = null;
    animations: boolean | null = null;
    darkMode: boolean | null = null;
    countTimeOnLostFocus: boolean | null = null;
    showCurrentTimeFirefox: boolean | null = null;
    showCurrentTimeWebsite: boolean | null = null;
    firefoxTimeLimit: number | null = null;
    firefoxBreakTime: number | null = null;
    websiteTimeLimit: Map<string, PageLimitData> | null = null;
    breakTime: boolean | null = null;
    transparency: number | null = null;
    backgroundTransparency: number | null = null;

    constructor() {
    }

    default() {
        this.generalPageData = this.generalPageData ?? new Map();
        this.updateTimerPerMiliseconds = this.updateTimerPerMiliseconds ?? 100;
        this.animations = this.animations ?? true;
        this.darkMode = this.darkMode ?? false;
        this.countTimeOnLostFocus = this.countTimeOnLostFocus ?? false;
        this.showCurrentTimeFirefox = this.showCurrentTimeFirefox ?? true;
        this.showCurrentTimeWebsite = this.showCurrentTimeWebsite ?? true;
        this.firefoxTimeLimit = this.firefoxTimeLimit ?? -1;
        this.firefoxBreakTime = this.firefoxBreakTime ?? -1;
        this.websiteTimeLimit = this.websiteTimeLimit ?? new Map();
        this.breakTime = this.breakTime ?? false;
        this.transparency = this.transparency ?? 1;
        this.backgroundTransparency = this.backgroundTransparency ?? 0.8;
    }

    async load() {
        let saved = await browser.storage.local.get(["generalPageData",
            "animations",
            "darkMode",
            "countTimeOnLostFocus",
            "showCurrentTimeFirefox",
            "showCurrentTimeWebsite",
            "firefoxTimeLimit",
            "websiteTimeLimit",
            "breakTime",
            "firefoxBreakTime",
            "websiteBreakTime",
            "transparency",
            "backgroundTransparency"]);

        if (saved["generalPageData"] != null) {
            this.generalPageData = JSON.parse(saved["generalPageData"]);
        }
        this.updateTimerPerMiliseconds = saved["updateTimerPerMiliseconds"];
        this.animations = saved["animations"];
        this.darkMode = saved["darkMode"];
        this.countTimeOnLostFocus = saved["countTimeOnLostFocus"];
        this.showCurrentTimeFirefox = saved["showCurrentTimeFirefox"];
        this.showCurrentTimeWebsite = saved["showCurrentTimeWebsite"];
        this.firefoxTimeLimit = saved["firefoxTimeLimit"];
        this.firefoxBreakTime = saved["firefoxBreakTime"];
        if (saved["websiteTimeLimit"] != null) {
            this.websiteTimeLimit = JSON.parse(saved["websiteTimeLimit"]);
        }
        this.breakTime = saved["breakTime"];
        this.transparency = saved["transparency"];
        this.backgroundTransparency = saved["backgroundTransparency"];

        this.default()
    }

    save() {
        let generalPageData = JSON.stringify(this.generalPageData);
        let websiteTimeLimit = JSON.stringify(this.websiteTimeLimit);
        browser.storage.local.set({
            "generalPageData": generalPageData,
            "updateTimerPerMiliseconds": this.updateTimerPerMiliseconds,
            "animations": this.animations,
            "darkMode": this.darkMode,
            "countTimeOnLostFocus": this.countTimeOnLostFocus,
            "showCurrentTimeFirefox": this.showCurrentTimeFirefox,
            "showCurrentTimeWebsite": this.showCurrentTimeWebsite,
            "firefoxTimeLimit": this.firefoxTimeLimit,
            "firefoxBreakTime": this.firefoxBreakTime,
            "websiteTimeLimit": websiteTimeLimit,
            "breakTime": this.breakTime,
            "transparency": this.transparency,
            "backgroundTransparency": this.backgroundTransparency
        });

    }
}