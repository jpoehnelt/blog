module.exports = {
  data() {
    return {
      permalink: () => {
        return `tweets.json`;
      },
    };
  },
  async render(data) {
    return JSON.stringify({
      tweets: data.collections.post.map((post) => ({
		tweet: post.data.tweet || undefined,
		title: post.data.title,
		url: `${data.site.url}${this.url(post.url)}`,
      })),
    });
  },
};
