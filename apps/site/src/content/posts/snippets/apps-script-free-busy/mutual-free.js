/**
 * Finds time slots where all calendars are free.
 * @param {string[]} calendarIds - Calendars to check
 * @param {Date} startDate - Start of search range
 * @param {Date} endDate - End of search range
 * @param {number} slotDurationMs - Minimum slot duration in ms
 * @returns {Object[]} Array of { start, end } free slots
 */
function findMutualFreeSlots(calendarIds, startDate, endDate, slotDurationMs) {
  const result = getFreeBusy(calendarIds, startDate, endDate);

  // Collect all busy periods across all calendars
  const allBusy = [];
  for (const data of Object.values(result)) {
    if (data.busy) {
      data.busy.forEach(slot => {
        allBusy.push({
          start: new Date(slot.start).getTime(),
          end: new Date(slot.end).getTime()
        });
      });
    }
  }

  // Sort by start time
  allBusy.sort((a, b) => a.start - b.start);

  // Merge overlapping busy periods
  const merged = [];
  for (const busy of allBusy) {
    if (merged.length === 0 || busy.start > merged[merged.length - 1].end) {
      merged.push({ ...busy });
    } else {
      merged[merged.length - 1].end = Math.max(
        merged[merged.length - 1].end, 
        busy.end
      );
    }
  }

  // Find gaps (free slots)
  const freeSlots = [];
  let cursor = startDate.getTime();

  for (const busy of merged) {
    if (busy.start > cursor) {
      const gapDuration = busy.start - cursor;
      if (gapDuration >= slotDurationMs) {
        freeSlots.push({
          start: new Date(cursor),
          end: new Date(busy.start)
        });
      }
    }
    cursor = Math.max(cursor, busy.end);
  }

  // Check remaining time after last busy period
  if (endDate.getTime() > cursor) {
    const remaining = endDate.getTime() - cursor;
    if (remaining >= slotDurationMs) {
      freeSlots.push({
        start: new Date(cursor),
        end: endDate
      });
    }
  }

  return freeSlots;
}
