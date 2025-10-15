module.exports = (activity, embed) =>
  `<div class="flex justify-center"><iframe loading="lazy" title="strava activity" class="w-full max-w-sm h-96" frameborder='0' allowtransparency='true' scrolling='no' src='https://www.strava.com/activities/${activity}/embed/${embed}'></iframe></div>`;
