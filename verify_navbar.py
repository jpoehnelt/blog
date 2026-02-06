from playwright.sync_api import Page, expect, sync_playwright
import os

def test_navbar_social_links(page: Page):
    try:
        # 1. Arrange: Go to the test page.
        # This page is empty so it should load fast and avoid image processing timeouts
        page.goto("http://localhost:5173/test-navbar", wait_until="domcontentloaded", timeout=60000)

        # 2. Assert: Check for social links in the desktop navbar.

        # Github
        github_link = page.get_by_role("link", name="Github")
        expect(github_link).to_be_visible()

        # Linkedin
        linkedin_link = page.get_by_role("link", name="Linkedin")
        expect(linkedin_link).to_be_visible()

        # Strava
        strava_link = page.get_by_role("link", name="Strava")
        expect(strava_link).to_be_visible()

    except Exception as e:
        print(f"Test failed: {e}")
        # Take screenshot on failure to debug
        os.makedirs("/home/jules/verification", exist_ok=True)
        page.screenshot(path="/home/jules/verification/navbar_failure.png")
        raise e

    # 3. Screenshot
    os.makedirs("/home/jules/verification", exist_ok=True)
    page.screenshot(path="/home/jules/verification/navbar_social_links.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        # Set viewport explicitly to ensure desktop mode
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        try:
            test_navbar_social_links(page)
        finally:
            browser.close()
