function nowUtcMillis() {
    let date = new Date();
    //Converted From Minutes To Milliseconds
    let timezoneDiff = date.getTimezoneOffset() * 60 * 1000
    //If you're time is later than UTC then timezoneDiff is negative
    return date.getTime() + timezoneDiff
}

class PageTimeData {
    auto_created: boolean;
    regex_key: boolean = false;
    /**
     * in Milliseconds
     */
    timeCounted: number = 0;
    /**
     * in Milliseconds
     */
    breakTimeLeft: number | null = null;

    constructor(auto_created: boolean) {
        this.auto_created = auto_created;
    }
}