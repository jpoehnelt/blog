from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_tags(page: Page):
    # Navigate to a page that likely has tags. The home page or /posts usually has a list of posts with tags.
    page.goto("http://localhost:5173/posts/")

    # Wait for the post list to appear
    # The output of curl shows "All Posts", so this should be visible.
    # We will increase timeout and just wait for load state
    page.wait_for_load_state("networkidle")

    # Wait a bit for everything to settle
    time.sleep(5)

    # Take a screenshot
    page.screenshot(path="/home/jules/verification/tags.png")
    print("Screenshot saved to /home/jules/verification/tags.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_tags(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
