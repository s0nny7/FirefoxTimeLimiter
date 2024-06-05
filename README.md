# Time Limiter Firefox Extension

Extension for Firefox Web Browser. Monitor And Limit the time you spend on websites and in total. Allows for custom break time.

Floating Panel (created on every page by this extension) is Both Resizeable and Movable. Minimalize it by clicking the clock icon

## Screenshots

- TODO Without Extending Screenshot
- TODO With Extending Screenshot

## Development

### Enabling Debug Mode

Add `"browsingData"` permission to the list in [manifest.json](/src/manifest.json)

## Plans

- Time's up Panel
  - [ ] [Auto Pause Videos on Time's Up](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/pause)
  - [ ] [also exit fullscreen](https://developer.mozilla.org/en-US/docs/Web/API/Document/exitFullscreen)
  - [ ] Half Transparent Panel
  - [ ] Show Icon
  - [ ] Time's Up Message
  - [ ] Stop Break Button
  - [ ] Fade In
  - [ ] Stop Break After Some Time Button
- Limiter Window
  - [x] Movable and Resizable Panel
  - [x] Limit Position (to 0 and max page size)
  - [x] Static Half transparent
  - Without Extending:
    - [x] Minimize Button
    - [x] Current Time On Page
    - [x] Time Left Until Break
    - [x] Extend Button
  - After Extending:
    - [x] Disable Animations
    - [x] Dark Mode
    - [x] Show Current Time While Using Firefox
    - [x] Show Current Time While Using Current Website
    - [x] Reset Break Time On This Page Button
    - [x] Set Time Limit In Firefox
    - [ ] Set Time Limit On Pages List
    - [x] Set Break Time for Firefox
    - [ ] Set Break Time List
    - [x] Reset Limit Counting after X Hours of Inactivity
    - [x] Edit Transparency
    - [x] Edit Background Transparency

## License

[MIT](/LICENSE)

Logo: Vectors and icons by [Vlad Cristea](https://www.figma.com/@thevladc?ref=svgrepo.com) in CC Attribution License via [SVG Repo](https://www.svgrepo.com/)
