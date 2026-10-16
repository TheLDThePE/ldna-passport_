export default async function handler(req, res) {
  try {
    const { empNo = 'OPT-1001' } = req.query;

    // 1. ขอ Access Token ใหม่จาก Refresh Token
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

    if (!accessToken) {
      throw new Error("Cannot acquire Access Token from Google");
    }

    // 2. ดึงข้อมูล Manpower และ Record พร้อมกัน
    const [manpowerRes, recordRes] = await Promise.all([
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/Manpower!A2:L`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}/values/Record!A2:E`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    ]);

    const manpowerData = await manpowerRes.json();
    const recordData = await recordRes.json();

    const employees = manpowerData.values || [];
    const emp = employees.find(row => row[0] === empNo) || employees[0];

    const records = recordData.values || [];
    // กรองเอาชื่อ Station ที่มีสถานะ PASS
    const passedStations = records
      .filter(row => row[0] === empNo && row[3] === 'PASS')
      .map(row => row[2]);

    res.status(200).json({
      empNo: emp[0],
      name: `${emp[5]} ${emp[6]}`,
      role: emp[10] || 'Operator',
      dept: emp[7],
      pic: emp[11] || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
      passedStations: passedStations
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
