module.exports = {
  content: [
    './src/**/*.njk',
    './src/**/*.js',
    './src/**/*.svg',
    './src/**/*.md',
    './shortcodes/*.js',
    '.eleventy.js'
  ],
  plugins: [require('@tailwindcss/forms')],
  theme: {
    extend: {
      
    },
  }
};
