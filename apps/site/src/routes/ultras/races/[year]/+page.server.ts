/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
  const { eventsForYear, yearStats } = await parent();

  return {
    eventsForYear,
    yearStats,
  };
}
