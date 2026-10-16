export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { empNo, station, result, confirmBy } = req.body;

    // 1. ขอ Access Token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: process.env.REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 2. Append แถวใหม่ลง Record Sheet
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/Record!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [[empNo, timestamp, station, result, confirmBy]]
        })
      }
    );

    const data = await appendRes.json();
    res.status(200).json({ success: true, data });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
