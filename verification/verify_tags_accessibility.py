from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_tags_accessibility(page: Page):
    page.goto("http://localhost:5173/posts/")

    # Wait for content
    page.wait_for_load_state("networkidle")

    # Get the first tag button
    # It should be an anchor tag because we passed href to Badge
    # We look for text that starts with '#' as tags usually do in this design
    tag = page.locator("a:has-text('#')").first

    # Assert it is visible
    expect(tag).to_be_visible()

    # Assert it is an anchor tag (tagName is uppercase in JS)
    tag_name = tag.evaluate("element => element.tagName")
    print(f"Tag element is: {tag_name}")
    assert tag_name == "A", f"Expected tag to be 'A', but got '{tag_name}'"

    # Assert it has an href
    href = tag.get_attribute("href")
    print(f"Tag href: {href}")
    assert href is not None and "/tags/" in href, "Tag should have a valid href"

    # Assert it is focusable
    # We can try to focus it
    tag.focus()
    expect(tag).to_be_focused()
    print("Tag is focusable")

    # Take a screenshot of the focused state
    page.screenshot(path="/home/jules/verification/tags_accessibility.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_tags_accessibility(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error_a11y.png")
        finally:
            browser.close()
