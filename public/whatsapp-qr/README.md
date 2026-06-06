# WhatsApp QR Code — +961 71 935 393

Permanent, non-expiring QR code that opens a WhatsApp chat with **+961 71 935 393**.

## Why it never expires

These QR codes encode a WhatsApp **click-to-chat** link:

```
https://wa.me/96171935393?text=Hello%20Michelle%2C%20I%20hope%20all%20is%20great%20on%20your%20side%20-%20I%20need%20your%20assistance
```

This is a static URL tied to the phone number — it is **not** the rotating
session QR shown in WhatsApp Web/Desktop (which refreshes every ~20 seconds).
As long as the number stays active on WhatsApp, the code keeps working
indefinitely. Print it, embed it, or share it anywhere.

When scanned, it opens WhatsApp with a new chat to this number, with the
following message **pre-filled** in the text box (the sender still taps send):

> Hello Michelle, I hope all is great on your side - I need your assistance

## Files

| File | Format | Best for |
|------|--------|----------|
| `whatsapp-qr.svg` | SVG (vector) | Print / signage — scales to any size with no blur |
| `whatsapp-qr.png` | PNG, brand green | Web, social, slides |
| `whatsapp-qr-print.png` | PNG, high-res black/white | High-contrast printing |

All use error-correction level **H** (~30%), so they still scan reliably even
if a logo is placed in the center or part of the print is smudged.

## Regenerating

```bash
pip install segno
python3 - <<'PY'
import segno, urllib.parse
msg = "Hello Michelle, I hope all is great on your side - I need your assistance"
url = "https://wa.me/96171935393?text=" + urllib.parse.quote(msg)
segno.make(url, error='h').save('whatsapp-qr.png', scale=12, border=4)
PY
```

To change the pre-filled message, edit `msg` above and re-run.
