module.exports = {
    data() {
        return {
            permalink: () => {
                return `manifest.json`
            }
        }
    },
    async render(data) {
        return JSON.stringify({
            "$schema": "https://json.schemastore.org/web-manifest-combined.json",
            "name": data.site.name,
            "description": data.site.description,
            "short_name": "JP",
            "icons": [
                {
                    "src": "/android-chrome-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "/android-chrome-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png"
                },
                {
                    "src": "/maskable_icon.png",
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "any maskable"
                  }
            ],
            "theme_color": "#ffffff",
            "background_color": "#111827",
            "display": "standalone",
            "start_url": "/"
        });
    }
}