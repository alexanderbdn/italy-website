# Villa Roccolo website

A static site (`index.html` + `img/`) with one serverless function (`api/calendar.js`).

## How the live data works

- **Reviews and host numbers** come from a Google Sheet, read by the page in the visitor's browser.
  The sheet ID is the `SHEET_ID` value near the bottom of `index.html`.
  Tabs: `Reviews` (Name, Place, Date, Review), `Numbers` (Item, Value) and `Prices`
  (From, To, Price per night, Minimum nights, Note). Direct prices shown on the calendar come from `Prices`.
  If the sheet can't be read, the reviews written in the page are shown instead.
- **Availability** comes from `/api/calendar`, which reads the private Airbnb calendar feed and
  returns only booked date ranges. Responses are cached for an hour.
  If the function fails, the calendar is hidden and the date picker still works.

## Deploying on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: Add New > Project > import the repository. No framework, no build command.
3. In the project's Settings > Environment Variables, add
   `AIRBNB_ICAL_URL` = the export link from Airbnb (Calendar > Availability > Connect calendars > Export calendar).
4. Redeploy. Visit `/api/calendar` to confirm it returns `{"booked": [...]}`.

Never commit the Airbnb calendar link to the repository.
