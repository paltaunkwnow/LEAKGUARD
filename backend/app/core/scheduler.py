import asyncio
import logging

from app.services.scraping import scrape_ransomware_feed

logger = logging.getLogger(__name__)


async def scraping_loop() -> None:
    while True:
        try:
            victims = await scrape_ransomware_feed()
            if victims:
                logger.info("Ransomware feed actualizado: %s víctimas", len(victims))
        except Exception as exc:
            logger.warning("Error en scraping loop: %s", exc)
        await asyncio.sleep(900)
