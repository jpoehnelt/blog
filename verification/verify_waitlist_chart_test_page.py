from playwright.sync_api import Page, expect, sync_playwright
import time

def test_waitlist_chart_page(page: Page):
    # Navigate to our new test page
    page.goto("http://localhost:3000/test/waitlist-chart")

    # Wait for network idle
    page.wait_for_load_state("networkidle")

    # Check for the chart wrapper
    chart_wrapper = page.locator(".chart-wrapper")
    expect(chart_wrapper).to_be_visible()

    # Check for Legend Items
    legend_buttons = page.locator(".chart-wrapper button")
    expect(legend_buttons.first).to_be_visible()

    # Check specific legend items we know should be there based on our mock data
    expect(legend_buttons.filter(has_text="Waitlist Size")).to_be_visible()
    expect(legend_buttons.filter(has_text="Front Movement")).to_be_visible()
    expect(legend_buttons.filter(has_text="Middle Movement")).to_be_visible()
    expect(legend_buttons.filter(has_text="Trend")).to_be_visible()

    # Take a screenshot of the initial state
    page.screenshot(path="/home/jules/verification/waitlist_chart_initial.png")

    # Interact with the legend items to toggle series
    # Click "Front Movement" to hide it
    front_btn = legend_buttons.filter(has_text="Front Movement")
    front_btn.click()
    time.sleep(0.5) # Wait for transition

    # Verify visual change (opacity reduced)
    # Since we can't easily check computed styles in this simple script without eval,
    # we'll take another screenshot to manually verify.
    page.screenshot(path="/home/jules/verification/waitlist_chart_toggled.png")

    # Click again to show it
    front_btn.click()
    time.sleep(0.5)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_waitlist_chart_page(page)
            print("Test completed successfully.")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error_test_page.png")
        finally:
            browser.close()
