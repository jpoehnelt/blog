from playwright.sync_api import Page, expect, sync_playwright
import time

def test_waitlist_chart_legend(page: Page):
    # Navigate to a race page that is likely to have a WaitlistChart
    # Based on the structure, we need a specific race/event ID.
    # We'll try to navigate to the races list and click through, or guess a valid URL.
    # Since we don't know a valid ID offhand, let's go to /ultras/races which redirects to the latest year
    page.goto("http://localhost:3000/ultras/races")

    # Wait for navigation and potential redirect
    page.wait_for_load_state("networkidle")

    # Click on the first race link to get to a specific race page
    # Look for a link inside the race list
    race_link = page.locator("a[href*='/ultras/races/']").first
    if race_link.count() > 0:
        race_link.click()
        page.wait_for_load_state("networkidle")

        # Now we are on a race page, check if there's an event link or if this is the event page
        # If there are multiple events, we might need to click one.
        # Let's look for a chart.
        chart = page.locator(".chart-wrapper")

        if chart.count() == 0:
             # Try to find a link to an event/distance
             event_link = page.locator("a[href*='/ultras/races/']").first
             if event_link.count() > 0:
                 event_link.click()
                 page.wait_for_load_state("networkidle")

        # Now check for the chart again
        chart = page.locator(".chart-wrapper")
        if chart.count() > 0:
            # Scroll to the chart
            chart.scroll_into_view_if_needed()

            # Check for the Legend Items we refactored
            # They are buttons with specific text
            legend_buttons = page.locator(".chart-wrapper button")

            # Expect at least one legend button (Waitlist Size is always there)
            expect(legend_buttons.first).to_be_visible()

            # Click the "Waitlist Size" button to toggle it
            waitlist_button = legend_buttons.filter(has_text="Waitlist Size")
            if waitlist_button.count() > 0:
                waitlist_button.click()
                time.sleep(1) # Wait for animation/transition
                waitlist_button.click() # Click back

            # Take a screenshot
            page.screenshot(path="/home/jules/verification/waitlist_chart_verification.png")
            print("Screenshot taken at /home/jules/verification/waitlist_chart_verification.png")
        else:
            print("No chart found on this page. Taking screenshot anyway.")
            page.screenshot(path="/home/jules/verification/no_chart_found.png")
    else:
        print("No race links found.")
        page.screenshot(path="/home/jules/verification/no_races_found.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_waitlist_chart_legend(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
