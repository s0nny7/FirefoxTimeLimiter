class PageLimitData {
    url: string;
    limitMillis: number;
    constructor(url: string, limitMillis: number) {
        this.url = url;
        this.limitMillis = limitMillis;
    }
}

class PageData {
    url: string;
    positionX: number | null;
    positionY: number | null;
    height: number | null;
    width: number | null;
    heightExtended: number | null;
    widthExtended: number | null;
    constructor(url: string) {
        this.url = url;
        this.positionX = null;
        this.positionY = null;
        this.height = null;
        this.width = null;
        this.heightExtended = null;
        this.widthExtended = null;
    }
}

class PageBreakData {
    url: string;
    lengthMillis: number;
    constructor(url: string, lengthMillis: number) {
        this.url = url;
        this.lengthMillis = lengthMillis;
    }
}

class Settings {

    generalPageData: PageData[] | null;

    animations: boolean | null;
    darkMode: boolean | null;
    showCurrentTimeFirefox: boolean | null;
    showCurrentTimeWebsite: boolean | null;
    firefoxTimeLimit: number | null;
    websiteTimeLimit: PageLimitData[] | null;
    breakTime: boolean | null;
    firefoxBreakTime: number | null;
    websiteBreakTime: PageBreakData[] | null;
    transparency: number | null;
    backgroundTransparency: number | null;

    constructor() {
        this.generalPageData = null;

        this.animations = null;
        this.darkMode = null;
        this.showCurrentTimeFirefox = null;
        this.showCurrentTimeWebsite = null;
        this.firefoxTimeLimit = null;
        this.websiteTimeLimit = null;
        this.breakTime = null;
        this.firefoxBreakTime = null;
        this.websiteBreakTime = null;
        this.transparency = null;
        this.backgroundTransparency = null;
    }

    default() {
        this.generalPageData = this.generalPageData ?? [];
        this.animations = this.animations ?? true;
        this.darkMode = this.darkMode ?? false;
        this.showCurrentTimeFirefox = this.showCurrentTimeFirefox ?? true;
        this.showCurrentTimeWebsite = this.showCurrentTimeWebsite ?? true;
        this.firefoxTimeLimit = this.firefoxTimeLimit ?? -1;
        this.websiteTimeLimit = this.websiteTimeLimit ?? [];
        this.breakTime = this.breakTime ?? false;
        this.firefoxBreakTime = this.firefoxBreakTime ?? -1;
        this.websiteBreakTime = this.websiteBreakTime ?? [];
        this.transparency = this.transparency ?? 1;
        this.backgroundTransparency = this.backgroundTransparency ?? 0.8;
    }

    async load() {
        let saved = await browser.storage.local.get(["generalPageData",
            "animations",
            "darkMode",
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
        this.animations = saved["animations"];
        this.darkMode = saved["darkMode"];
        this.showCurrentTimeFirefox = saved["showCurrentTimeFirefox"];
        this.showCurrentTimeWebsite = saved["showCurrentTimeWebsite"];
        this.firefoxTimeLimit = saved["firefoxTimeLimit"];
        if (saved["websiteTimeLimit"] != null) {
            this.websiteTimeLimit = JSON.parse(saved["websiteTimeLimit"]);
        }
        this.breakTime = saved["breakTime"];
        this.firefoxBreakTime = saved["firefoxBreakTime"];
        if (saved["websiteBreakTime"] != null) {
            this.websiteBreakTime = JSON.parse(saved["websiteBreakTime"]);
        }
        this.transparency = saved["transparency"];
        this.backgroundTransparency = saved["backgroundTransparency"];

        this.default()
    }

    save() {
        let generalPageData = JSON.stringify(this.generalPageData);
        let websiteTimeLimit = JSON.stringify(this.websiteTimeLimit);
        let websiteBreakTime = JSON.stringify(this.websiteBreakTime);
        browser.storage.local.set({
            "generalPageData": generalPageData,
            "animations": this.animations,
            "darkMode": this.darkMode,
            "showCurrentTimeFirefox": this.showCurrentTimeFirefox,
            "showCurrentTimeWebsite": this.showCurrentTimeWebsite,
            "firefoxTimeLimit": this.firefoxTimeLimit,
            "websiteTimeLimit": websiteTimeLimit,
            "breakTime": this.breakTime,
            "firefoxBreakTime": this.firefoxBreakTime,
            "websiteBreakTime": websiteBreakTime,
            "transparency": this.transparency,
            "backgroundTransparency": this.backgroundTransparency
        });

    }
}