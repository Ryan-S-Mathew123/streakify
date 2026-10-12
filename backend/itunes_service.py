import requests


def normalize_itunes_track(item: dict) -> dict:
    artwork_url = item.get("artworkUrl100") or ""
    if artwork_url:
        artwork_url = artwork_url.replace("100x100bb", "600x600bb")

    return {
        "catalog_id": str(item.get("trackId") or ""),
        "title": item.get("trackName") or "",
        "artists": item.get("artistName") or "",
        "album": item.get("collectionName") or "Single",
        "album_image_url": artwork_url,
        "catalog_url": item.get("trackViewUrl") or "",
        "duration_ms": item.get("trackTimeMillis") or 0,
    }


def itunes_search(query: str, limit: int = 10) -> list[dict]:
    if not query or not query.strip():
        return []

    response = requests.get(
        "https://itunes.apple.com/search",
        params={"term": query.strip(), "entity": "song", "limit": max(1, min(limit, 50)), "country": "US"},
        timeout=15,
    )
    response.raise_for_status()

    tracks = response.json().get("results", [])
    return [normalize_itunes_track(item) for item in tracks if item.get("trackId")]