# WhatsApp QR Code — +961 71 935 393

Permanent, non-expiring QR code that opens a WhatsApp chat with **+961 71 935 393**.

## Why it never expires

These QR codes encode a WhatsApp **click-to-chat** link:

```
https://wa.me/96171935393
```

This is a static URL tied to the phone number — it is **not** the rotating
session QR shown in WhatsApp Web/Desktop (which refreshes every ~20 seconds).
As long as the number stays active on WhatsApp, the code keeps working
indefinitely. Print it, embed it, or share it anywhere.

When scanned, it opens WhatsApp with a new chat to this number (no message
pre-filled).

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
python3 -c "import segno; segno.make('https://wa.me/96171935393', error='h').save('whatsapp-qr.png', scale=12, border=4)"
```

To pre-fill a message, append a URL-encoded `?text=`, e.g.
`https://wa.me/96171935393?text=Hello%20Dr.%20Costi`
