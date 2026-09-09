import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1280, "height": 720})
        await page.goto('http://localhost:5173')
        # Wait a bit to render map
        await page.wait_for_timeout(2000)
        await page.screenshot(path='/home/jules/verification/screenshots/map_verification.png')
        await browser.close()

asyncio.run(run())
