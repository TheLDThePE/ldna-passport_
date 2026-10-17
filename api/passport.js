import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const { empNo } = req.query;

    const auth = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET
    );
    auth.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    // 1. ดึงข้อมูลพนักงานทั้งหมดจากแท็บ Manpower
    const manpowerRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Manpower!A2:L',
    });
    const manpowerRows = manpowerRes.data.values || [];

    // สร้าง List รายชื่อพนักงานทั้งหมดส่งกลับไปให้ Dropdown บน Frontend
    const allEmployees = manpowerRows.map(row => ({
      empNo: row[0] || '',
      name: `${row[5] || ''} ${row[6] || ''}`.trim()
    })).filter(e => e.empNo !== '');

    // 2. ค้นหาข้อมูลพนักงานตาม empNo ที่ส่งมา (ถ้าไม่ส่งมาใช้คนแรก)
    const targetEmp = empNo || (allEmployees[0]?.empNo || 'OPT-1001');
    const userRow = manpowerRows.find(row => row[0] === targetEmp) || manpowerRows[0] || [];

    // 3. ดึงประวัติการประเมินจากแท็บ Record
    const recordRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Record!A2:E',
    });
    const recordRows = recordRes.data.values || [];

    // คัดกรองเอาเฉพาะด่านที่ผ่าน (PASS) ของพนักงานคนนี้
    const passedStations = recordRows
      .filter(row => row[0] === targetEmp && row[2] === 'PASS')
      .map(row => row[1]);

    return res.status(200).json({
      empNo: userRow[0] || '',
      name: `${userRow[5] || ''} ${userRow[6] || ''}`.trim(),
      dept: userRow[7] || '',
      pic: userRow[11] || '',
      passedStations: [...new Set(passedStations)],
      allEmployees: allEmployees // ส่งรายชื่อพนักงานทั้งหมดกลับไป
    });

  } catch (error) {
    console.error('API Passport Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
