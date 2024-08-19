import { Scheduler, StringHelper } from "./scheduler.module.js";

const scheduler = new Scheduler({
  appendTo: "scheduler",
  startDate: new Date("2024/9/2 08:00 AM"),
  endDate: new Date("2024/9/3 08:00 PM"),
  workingTime: null,
  zoomOnMouseWheel: false,
  zoomOnTimeAxisDoubleClick: false,
  // This allows the timeline to be scrolled infinitely in time.
  viewPreset: {
    id: "myPreset", // Unique id value provided to recognize your view preset. Not required, but having it you can simply set new view preset by id: scheduler.viewPreset = 'myPreset'
    name: "My view preset", // A human-readable name provided to be used in GUI, e.i. preset picker, etc.
    base: "hourAndDay", // Extends 'hourAndDay' view preset provided by PresetManager. You can pick out any of PresetManager's view presets: PresetManager.records
    headers: [
      // Override headers
      {
        unit: "day",
        dateFormat: "dddd, MMMM D, YYYY",
      },
      {
        unit: "hour",
        dateFormat: "LT",
      },
    ],
  },
  timeZone: "UTC",
  enableRecurringEvents: true,

  crudManager: {
    loadUrl: "/api/load",
    autoLoad: true,
    syncUrl: "/api/sync",
    autoSync: true,
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true,
  },
  eventRenderer({ renderData, eventRecord }) {
    renderData.iconCls = eventRecord.isRecurring
      ? "b-fa b-fa-sync"
      : eventRecord.isOccurrence
      ? "b-fa b-fa-sync"
      : "";
    return StringHelper.xss`${eventRecord.name}`;
  },
  columns: [
    {
      text: "Name",
      field: "name",
      width: 120,
    },
  ],
  tbar: {
    items: [
      // Button to toggle working time on/off
      {
        type: "button",
        text: "Use working time",
        ref: "workingTimeBtn",
        color: "b-gray",
        icon: "b-fa b-fa-square",
        pressedIcon: "b-fa b-fa-check-square",
        toggleable: true,
        pressed: false,
        style: "margin-bottom: .5em",
        onToggle({ pressed }) {
          // Change the display, but keep the visual center the same to preserve user's context.
          scheduler.preserveViewCenter(() => {
            if (pressed) {
              scheduler.workingTime = {
                fromDay: 1,
                toDay: 6,
                fromHour: 8,
                toHour: 17,
              };
            } else {
              scheduler.workingTime = null;
            }
          });
        },
      },
    ],
  },
});
