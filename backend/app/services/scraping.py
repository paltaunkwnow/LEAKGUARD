"""Scraping service: Playwright (JS), BeautifulSoup (static), aiohttp (async HTTP)."""

import hashlib
from typing import Any

import aiohttp
from bs4 import BeautifulSoup

from app.core.redis_client import cache_get, cache_set


async def scrape_static(url: str) -> dict[str, Any]:
    cache_key = f"scrape:static:{hashlib.sha256(url.encode()).hexdigest()[:16]}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    async with aiohttp.ClientSession() as session:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
            html = await resp.text()
            status = resp.status

    soup = BeautifulSoup(html, "lxml")
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    links = [a.get("href") for a in soup.find_all("a", href=True)][:50]
    text_preview = soup.get_text(separator=" ", strip=True)[:2000]

    result = {
        "url": url,
        "method": "beautifulsoup+aiohttp",
        "status": status,
        "title": title,
        "linkCount": len(links),
        "textPreview": text_preview,
    }
    await cache_set(cache_key, result, ttl_seconds=1800)
    return result


async def scrape_dynamic(url: str) -> dict[str, Any]:
    """Playwright scrape — requires `playwright install chromium` on the host."""
    cache_key = f"scrape:dynamic:{hashlib.sha256(url.encode()).hexdigest()[:16]}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    try:
        from playwright.async_api import async_playwright
    except ImportError:
        return {"url": url, "method": "playwright", "error": "Playwright no instalado"}

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle", timeout=45000)
            title = await page.title()
            content = await page.content()
            await browser.close()

        soup = BeautifulSoup(content, "lxml")
        result = {
            "url": url,
            "method": "playwright",
            "title": title,
            "textPreview": soup.get_text(separator=" ", strip=True)[:2000],
        }
        await cache_set(cache_key, result, ttl_seconds=1800)
        return result
    except Exception as exc:
        return {"url": url, "method": "playwright", "error": str(exc)}


RANSOMWARE_FEED_URL = "https://api.ransomware.live/recentvictims"
RANSOMWARE_CACHE_KEY = "scrape:ransomware:recent"


def parse_ransomware_victims(data: object) -> list[dict[str, Any]]:
    if not isinstance(data, list):
        return []
    victims: list[dict[str, Any]] = []
    for item in data:
        if not isinstance(item, dict):
            continue
        victims.append(
            {
                "actor": item.get("group_name") or item.get("group") or "Unknown",
                "victim": item.get("post_title") or item.get("victim") or "Unknown",
                "date": item.get("discovered") or item.get("date") or "",
                "url": item.get("post_url") or item.get("url") or "",
                "country": item.get("country") or "Unknown",
            }
        )
    return victims[:50]


async def scrape_ransomware_feed() -> list[dict[str, Any]]:
    cached = await cache_get(RANSOMWARE_CACHE_KEY)
    if cached and isinstance(cached, list):
        return cached

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(RANSOMWARE_FEED_URL, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()
    except Exception:
        return []

    victims = parse_ransomware_victims(data)
    if victims:
        await cache_set(RANSOMWARE_CACHE_KEY, victims, ttl_seconds=900)
    return victims
