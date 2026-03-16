from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Test 1: Verify test route
        print("Navigating to test-date-display...")
        try:
            page.goto("http://localhost:5173/test-date-display", wait_until="networkidle", timeout=60000)
            # wait a bit for hydration
            page.wait_for_timeout(2000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            page.screenshot(path="verification/error_test_route.png")
            browser.close()
            return

        page.screenshot(path="verification/test_route.png")
        print("Screenshot saved to verification/test_route.png")

        # Test 2: Verify homepage
        print("Navigating to homepage...")
        try:
            page.goto("http://localhost:5173/", wait_until="commit", timeout=60000)
            page.wait_for_selector("body", timeout=60000)
            # wait for date display
            page.wait_for_selector("time", timeout=10000)
            # wait a bit
            page.wait_for_timeout(2000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            page.screenshot(path="verification/error_homepage.png")
            browser.close()
            return

        page.screenshot(path="verification/homepage.png")
        print("Screenshot saved to verification/homepage.png")

        browser.close()

if __name__ == "__main__":
    run()
