const sharp = require("sharp");

module.exports = {
    data() {
        return {
            eleventyExcludeFromCollections: true,
            pagination: {
                data: 'collections.post',
                size: 1,
                alias: 'post'
            },
            permalink: (data) => {
                return `images/social/${data.post.url.replace(/^\/+|\/+$/g, "")}.png`
            }
        }
    },

    async render(data) {

        const svgBuffer = Buffer.from(svg.bind(this)(data.post.data));

        return await sharp(svgBuffer)
            .resize(1200, 628)
            .png()
            .toBuffer()
    }
}

function wrapText(title, rowLength, maxRows) {
    let titleRows = [];
    words = title.split(/(?<=[^a-zA-Z0-9()<>""''#])/);
    let _row = '';
    words.forEach((wrd) => {
        if (_row.length + wrd.length >= rowLength) {
            titleRows.push(_row);
            _row = '';
        }
        _row += wrd;
    });
    if (_row) {
        titleRows.push(_row);
    }

    // Limit rows...
    if (titleRows.length > maxRows) {
        titleRows.length = maxRows;
        titleRows[maxRows - 1] += "…";
    }

    return titleRows;
}

function svg({ title, excerpt, tags, page, date }) {
    const svgTitle = `<text x="75" y="120" fill="#ffffff" font-size="${Math.ceil(1650 / title.length)}px" font-weight="700">${title}</text>`;

    const excerptLines = wrapText(excerpt, 40, 4)
    const svgExcerpt = excerptLines.reduce((p, c, i) => {
        return p + `<text x="100" y="${250 + (i * 60)}" fill="#ffffff" font-size="50px" font-weight="500" style="font-style: italic;">${c}</text>`;
    }, '');
    const bottomOfExcerpt = 250 + 50 * (excerptLines.length -1) + 50;

    const tagString = tags.filter(t => t !== 'post').map(t => `#${t}`).join(" ");
    const svgTags = wrapText(tagString, 65, 4).reduce((p, c, i) => {
        return p + `<text x="100" y="${bottomOfExcerpt + 60 + i * 40}" fill="#ffffff" font-size="30px" font-weight="500">${c}</text>`;
    }, '');

    let rectangles = '';

    for (let x = 0; x < 1200; x += 12) {
        for (let y = 0; y < 683; y += 12) {
            // rectangles += `<rect x="${x}" y="${y}" width="10" height="10" fill="#111827" fill-opacity="${x/1200/3 + y/683/2}"/>`;
        }
    }


    return `<svg width="1200" height="628" viewbox="0 0 1200 628" xmlns="http://www.w3.org/2000/svg">
    <style>
        text {
            font-family:Roboto-Regular,Roboto;
        }
    </style>
    <defs>
    <linearGradient id="myGradient" gradientTransform="rotate(0)">
      <stop offset="30%"  stop-color="#111827" />
      <stop offset="90%" stop-color="#151127" />
    </linearGradient>
  </defs>
		<g>
            <rect x="0" y="0" width="1200" height="683" fill="url('#myGradient')" />
            ${rectangles}			
            ${svgTitle}
            <rect x="100" y="180" width="1000" height="2" style="fill:white;" />
            ${svgExcerpt}
            <rect x="100" y="${bottomOfExcerpt}" width="1000" height="2" style="fill:white;" />
            ${svgTags}
			<text x="75" y="580" fill="#fff" font-size="20px" font-weight="500">justin.poehnelt.com${page.url}</text>
			<text x="1125" y="580" fill="#fff" font-size="20px" text-anchor="end" font-weight="500">${this.dateDisplay(date)}</text>
		</g>
	</svg>`;
}