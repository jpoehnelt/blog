/**
 * Simple meeting scheduler that finds available slots.
 */
function findMeetingSlots() {
  const ui = SpreadsheetApp.getUi();

  // Get attendees from user
  const response = ui.prompt(
    'Meeting Scheduler',
    'Enter attendee emails (comma-separated):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const attendees = response.getResponseText()
    .split(',')
    .map(e => e.trim())
    .filter(e => e.includes('@'));

  if (attendees.length === 0) {
    ui.alert('No valid emails provided');
    return;
  }

  // Search next 5 business days
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7);

  // Find 30-minute slots
  const THIRTY_MINUTES = 30 * 60 * 1000;
  const freeSlots = findMutualFreeSlots(attendees, now, endDate, THIRTY_MINUTES);

  // Filter to business hours (9 AM - 5 PM)
  const businessHourSlots = freeSlots.filter(slot => {
    const hour = slot.start.getHours();
    return hour >= 9 && hour < 17;
  });

  if (businessHourSlots.length === 0) {
    ui.alert('No mutual free time found in the next week');
    return;
  }

  // Show first 5 options
  const options = businessHourSlots.slice(0, 5).map((slot, i) => {
    const start = slot.start.toLocaleString();
    const end = slot.end.toLocaleString();
    return `${i + 1}. ${start} - ${end}`;
  }).join('\n');

  ui.alert('Available Slots', options, ui.ButtonSet.OK);
}

/**
 * Adds menu to spreadsheet
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📅 Scheduler')
    .addItem('Find Meeting Slots', 'findMeetingSlots')
    .addToUi();
}
