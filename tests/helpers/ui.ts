import { Locator, type Page } from "@playwright/test";

// Prevents race conditions where navigation begins before waitForURL is attached.
export async function clickAndNavigate(
  page: Page,
  selector: string | Locator,
  expectedUrl: RegExp
) {
  const element = typeof selector === "string" ? page.locator(selector) : selector;

  try {
    await Promise.all([
      page.waitForURL(expectedUrl,),
      element.click(),
    ]);
  } catch (err) {
    throw new Error(
      [
        `clickAndNavigate() timed out waiting for URL: ${expectedUrl}`,
        `Current URL: ${page.url()}`,
        `Selector: ${typeof selector === "string" ? selector : "<Locator>"}`,
      ].join("\n")
    );
  }
}
