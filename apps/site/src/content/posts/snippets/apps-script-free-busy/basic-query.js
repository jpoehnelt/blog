/**
 * Queries free/busy status for multiple calendars.
 * @param {string[]} calendarIds - Array of calendar IDs (emails)
 * @param {Date} timeMin - Start of time range
 * @param {Date} timeMax - End of time range
 * @returns {Object} Free/busy data for each calendar
 */
function getFreeBusy(calendarIds, timeMin, timeMax) {
  const response = Calendar.Freebusy.query({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    items: calendarIds.map(id => ({ id: id }))
  });

  return response.calendars;
}

/**
 * Example: Check availability for next week
 */
function checkNextWeekAvailability() {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const calendars = [
    'user1@company.com',
    'user2@company.com',
    'conference-room@resource.calendar.google.com'
  ];

  const result = getFreeBusy(calendars, now, nextWeek);

  for (const [calendarId, data] of Object.entries(result)) {
    Logger.log(`\n${calendarId}:`);

    if (data.errors) {
      Logger.log(`  Error: ${data.errors[0].reason}`);
      continue;
    }

    if (data.busy.length === 0) {
      Logger.log('  Completely free!');
    } else {
      data.busy.forEach(slot => {
        Logger.log(`  Busy: ${slot.start} - ${slot.end}`);
      });
    }
  }
}
