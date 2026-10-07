// Reads the private Airbnb calendar feed and returns only the booked date ranges.
// The feed link is stored in Vercel as the environment variable AIRBNB_ICAL_URL.
// Vercel's cache keeps the answer for an hour, so Airbnb is asked at most once an hour.
function parse(ics) {
  const text = ics.replace(/\r?\n[ \t]/g, '');
  const day = (v) => { const m = /(\d{4})(\d{2})(\d{2})/.exec(v || ''); return m ? `${m[1]}-${m[2]}-${m[3]}` : null; };
  const out = [];
  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const start = day((/^DTSTART[^:\n]*:(.+)$/m.exec(block) || [])[1]);
    const end = day((/^DTEND[^:\n]*:(.+)$/m.exec(block) || [])[1]);
    if (start && end && end > start) out.push([start, end]); // end is the check-out day (exclusive)
  }
  return out.sort();
}
module.exports = async (req, res) => {
  const url = process.env.AIRBNB_ICAL_URL;
  if (!url) return res.status(500).json({ error: 'AIRBNB_ICAL_URL is not set' });
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'villa-roccolo-calendar' } });
    if (!r.ok) throw new Error('feed returned ' + r.status);
    const booked = parse(await r.text());
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ booked, updated: new Date().toISOString() });
  } catch (e) {
    res.status(502).json({ error: 'Could not read the calendar feed' });
  }
};
module.exports.parse = parse;
