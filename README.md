# Time Limiter Firefox Extension

Extension for Firefox Web Browser. Monitor And Limit the time you spend on websites and in total. Allows for custom break time.

## Screenshots

<img alt="Default Screnshot" src="https://github.com/LimitLost/FirefoxTimeLimiter/blob/f11eaec33ee9a3720259882c40b7074bf5960692/Screenshots/Default.png">
<img alt="Minimized Screnshot" src="https://github.com/LimitLost/FirefoxTimeLimiter/blob/f11eaec33ee9a3720259882c40b7074bf5960692/Screenshots/Minimized.png">
<img alt="Extended Screnshot" src="https://github.com/LimitLost/FirefoxTimeLimiter/blob/f11eaec33ee9a3720259882c40b7074bf5960692/Screenshots/Extended.png">
<img alt="Dark Mode Screnshot" src="https://github.com/LimitLost/FirefoxTimeLimiter/blob/f11eaec33ee9a3720259882c40b7074bf5960692/Screenshots/Dark%20Mode.png">

## Functionality

- Floating Panel
  - Resizeable
  - Moveable
  - Can be minimized by clicking the clock icon (Click it again to unminimize)
  - Time Left Until Break is Automatically shown when firefox or current page is limited
- Break Panel
  - Does not replace current website
  - Allows to end the break early
- Settings
  - Dark Mode
  - Fix Transparency (Make floating panel transparent if it isn't already)
  - Firefox
    - Set Time Limit
    - Set Break Length
  - Page Rules
    - Click `R` Button to enable page url matching using regex
    - Set Time Limit (In Minutes, set to negative or 0 to disable)
    - Set Break Length (In Minutes, set to negative or 0 to disable)
  - Set Floating Panel Opacity
  - Set Floating Panel Background Opacity
- Advanced Settings
  - Show/Hide Firefox Usage Time
  - Show/Hide Current Website Usage Time
  - Count time while Firefox is unfocused
  - Enable/Disable Animations
  - Reset Time Count after selected amount of time while firefox is inactive/unfocused
  - Reset Current Page Time Count Button
  - Reset Firefox Time Count Button
  - Change Time Update Interval

## Development

### Enabling Debug Mode

Add `"browsingData"` permission to the list in [manifest.json](/src/manifest.json)

## License

[MIT](/LICENSE)

Logo: Vectors and icons by [Vlad Cristea](https://www.figma.com/@thevladc?ref=svgrepo.com) in CC Attribution License via [SVG Repo](https://www.svgrepo.com/)
