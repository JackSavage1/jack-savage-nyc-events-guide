"""
Entertainment Event Scout — API Event Fetcher
=============================================
This script fetches entertainment industry events from Eventbrite and Luma,
then saves them as JSON that the React app can import.

HOW TO GET API KEYS:
--------------------
1. EVENTBRITE:
   - Go to https://www.eventbrite.com/platform/api-keys
   - Sign in with your Eventbrite account (free)
   - Create an API key — you'll get a "Private token"
   - Copy that token

2. LUMA:
   - You need a Luma Plus subscription ($)
   - Go to your Calendar → Settings → Developer
   - Copy your API key

3. MEETUP (via RapidAPI — optional):
   - Go to https://rapidapi.com and sign up (free tier available)
   - Search for "Meetup" API
   - Subscribe and copy your RapidAPI key

USAGE:
------
   python event_fetcher.py

   Or with env vars:
   EVENTBRITE_TOKEN=xxx LUMA_API_KEY=yyy python event_fetcher.py
"""

import json
import os
import sys
from datetime import datetime, timedelta
from urllib.request import Request, urlopen
from urllib.parse import quote_plus
from urllib.error import HTTPError

# ── CONFIG ──────────────────────────────────────────────────────────
OUTPUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fetched_events.json")

EVENTBRITE_TOKEN = os.environ.get("EVENTBRITE_TOKEN", "")
LUMA_API_KEY = os.environ.get("LUMA_API_KEY", "")

# Entertainment keywords to search for
SEARCH_KEYWORDS = [
    "casting director",
    "voice acting workshop",
    "voiceover",
    "acting showcase",
    "talent agent",
    "film festival",
    "theater audition",
    "modeling casting",
    "SAG-AFTRA",
    "acting workshop",
    "voice over conference",
    "film networking",
    "theater festival",
    "runway model",
    "acting industry",
]

NYC_LOCATION = {
    "latitude": "40.7128",
    "longitude": "-73.9876",
    "within": "25mi"
}


def api_get(url, headers=None):
    """Simple GET request helper."""
    req = Request(url, headers=headers or {})
    try:
        with urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except HTTPError as e:
        print(f"  HTTP Error {e.code}: {url[:80]}...")
        return None
    except Exception as e:
        print(f"  Error: {e}")
        return None


def fetch_eventbrite_events():
    """
    Fetch events from Eventbrite using organization/venue endpoints.
    Note: The public search API was deprecated in 2020.
    We use the /destination/search/ endpoint which still works for discovery.
    """
    if not EVENTBRITE_TOKEN:
        print("\n[Eventbrite] No API token set. Skipping.")
        print("  Set EVENTBRITE_TOKEN env var or edit this script.")
        print("  Get your token at: https://www.eventbrite.com/platform/api-keys")
        return []

    print("\n[Eventbrite] Fetching entertainment events...")
    events = []
    headers = {"Authorization": f"Bearer {EVENTBRITE_TOKEN}"}

    # Search using the events endpoint with category filters
    # Category 105 = Performing & Visual Arts
    # Category 104 = Film, Media & Entertainment
    # Subcategory 5004 = Theater, 5005 = Musical, 5006 = Film
    categories = ["105", "104"]

    for cat_id in categories:
        url = (
            f"https://www.eventbriteapi.com/v3/events/search/"
            f"?location.latitude={NYC_LOCATION['latitude']}"
            f"&location.longitude={NYC_LOCATION['longitude']}"
            f"&location.within={NYC_LOCATION['within']}"
            f"&categories={cat_id}"
            f"&start_date.range_start={datetime.now().strftime('%Y-%m-%dT00:00:00')}"
            f"&start_date.range_end={(datetime.now() + timedelta(days=90)).strftime('%Y-%m-%dT23:59:59')}"
            f"&expand=venue,organizer"
        )
        data = api_get(url, headers)
        if data and "events" in data:
            for e in data["events"]:
                venue = e.get("venue", {}) or {}
                addr = venue.get("address", {}) or {}
                events.append({
                    "name": e.get("name", {}).get("text", "Unknown Event"),
                    "description": (e.get("description", {}) or {}).get("text", "")[:300],
                    "venue": venue.get("name", "TBD"),
                    "address": f"{addr.get('address_1', '')}, {addr.get('city', '')}, {addr.get('region', '')}",
                    "lat": float(addr.get("latitude", 40.7128)),
                    "lng": float(addr.get("longitude", -73.9876)),
                    "dateStart": e.get("start", {}).get("local", "")[:10],
                    "dateEnd": e.get("end", {}).get("local", "")[:10],
                    "time": e.get("start", {}).get("local", "")[11:16] if e.get("start", {}).get("local") else "TBD",
                    "url": e.get("url", ""),
                    "source": "eventbrite",
                    "category": "auto-detect",
                    "type": "Event",
                    "speakers": [e.get("organizer", {}).get("name", "Unknown Organizer")],
                    "tags": [],
                })
            print(f"  Found {len(data['events'])} events in category {cat_id}")
        else:
            print(f"  No events found for category {cat_id} (search API may be restricted)")

    print(f"  Total Eventbrite events: {len(events)}")
    return events


def fetch_luma_events():
    """Fetch events from Luma calendar API."""
    if not LUMA_API_KEY:
        print("\n[Luma] No API key set. Skipping.")
        print("  Set LUMA_API_KEY env var or edit this script.")
        print("  Requires Luma Plus: Calendar → Settings → Developer")
        return []

    print("\n[Luma] Fetching events...")
    events = []
    headers = {"x-luma-api-key": LUMA_API_KEY}

    url = "https://public-api.luma.com/v1/calendar/list-events"
    data = api_get(url, headers)

    if data and "data" in data:
        for e in data["data"]:
            event = e.get("event", {})
            geo = event.get("geo_address_json", {}) or {}
            events.append({
                "name": event.get("name", "Unknown Event"),
                "description": (event.get("description", "") or "")[:300],
                "venue": geo.get("description", "TBD"),
                "address": geo.get("full_address", ""),
                "lat": float(geo.get("latitude", 40.7128)),
                "lng": float(geo.get("longitude", -73.9876)),
                "dateStart": (event.get("start_at", "") or "")[:10],
                "dateEnd": (event.get("end_at", "") or "")[:10],
                "time": (event.get("start_at", "") or "")[11:16] if event.get("start_at") else "TBD",
                "url": f"https://lu.ma/{event.get('url', '')}",
                "source": "luma",
                "category": "auto-detect",
                "type": "Event",
                "speakers": [h.get("name", "") for h in (event.get("hosts", []) or []) if h.get("name")],
                "tags": [],
            })
        print(f"  Found {len(events)} Luma events")
    else:
        print("  No events returned (check API key and Luma Plus status)")

    return events


def auto_categorize(event):
    """Auto-detect category based on event name/description keywords."""
    text = f"{event['name']} {event['description']} {' '.join(event.get('tags', []))}".lower()

    if any(kw in text for kw in ["voice", "voiceover", "vo ", "narration", "audiobook", "voice-over"]):
        return "Voice Acting"
    elif any(kw in text for kw in ["model", "runway", "fashion", "nyfw", "print model"]):
        return "Modeling"
    elif any(kw in text for kw in ["theater", "theatre", "stage", "play", "musical", "broadway", "off-broadway"]):
        return "Theater"
    elif any(kw in text for kw in ["film", "cinema", "movie", "screenplay", "documentary", "short film"]):
        return "Film"
    elif any(kw in text for kw in ["cast", "act", "actor", "audition", "showcase", "scene study", "monologue"]):
        return "Acting"
    return "Acting"  # default


def auto_priority(event):
    """Auto-detect priority based on keywords."""
    text = f"{event['name']} {event['description']}".lower()
    high_keywords = ["casting director", "agent", "sag-aftra", "showcase", "intensive", "masterclass", "industry"]
    if any(kw in text for kw in high_keywords):
        return "high"
    elif any(kw in text for kw in ["festival", "conference", "expo", "panel"]):
        return "medium"
    return "low"


def main():
    print("=" * 60)
    print("Entertainment Event Scout — API Fetcher")
    print("=" * 60)

    all_events = []

    # Fetch from all sources
    all_events.extend(fetch_eventbrite_events())
    all_events.extend(fetch_luma_events())

    # Auto-categorize and prioritize
    for event in all_events:
        if event["category"] == "auto-detect":
            event["category"] = auto_categorize(event)
        event["priority"] = auto_priority(event)

    # Assign IDs
    for i, event in enumerate(all_events):
        event["id"] = 1000 + i

    # Save to JSON
    output = {
        "fetchedAt": datetime.now().isoformat(),
        "totalEvents": len(all_events),
        "events": all_events,
    }

    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"Saved {len(all_events)} events to: {OUTPUT_FILE}")
    print(f"Import this file into the Event Scout app!")
    print(f"{'=' * 60}")

    if not all_events:
        print("\nNo events fetched. Make sure you've set your API keys:")
        print("  export EVENTBRITE_TOKEN='your-token-here'")
        print("  export LUMA_API_KEY='your-key-here'")
        print("\nThen run this script again.")


if __name__ == "__main__":
    main()
