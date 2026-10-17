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

    // 1. ดึงข้อมูลพนักงานทั้งหมดจากแท็บ Manpower (คอลัมน์ A ถึง L)
    const manpowerRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Manpower!A2:L',
    });
    const manpowerRows = manpowerRes.data.values || [];

    // ดึงรายชื่อพนักงานทั้งหมด (ป้องกันกรณีคอลัมน์ว่าง)
    const allEmployees = manpowerRows
      .filter(row => row && row[0]) // เอาเฉพาะแถวที่มี EmpNo
      .map(row => {
        const empCode = row[0] || '';
        // รวมชื่อภาษาอังกฤษ (F=NameE, G=SurnameE) หรือถ้าไม่มีใช้ชื่อไทย (C=NameT, D=SurnameT)
        const firstName = row[5] || row[2] || '';
        const lastName = row[6] || row[3] || '';
        const fullName = `${firstName} ${lastName}`.trim();

        return {
          empNo: empCode,
          name: fullName || empCode
        };
      });

    // 2. ค้นหาข้อมูลพนักงานตาม empNo ที่เลือก
    const targetEmp = empNo || (allEmployees[0]?.empNo || 'OPT-1001');
    const userRow = manpowerRows.find(row => row && row[0] === targetEmp) || manpowerRows[0] || [];

    // ดึงชื่อ-แผนก-รูปโปรไฟล์
    const empCode = userRow[0] || '';
    const firstName = userRow[5] || userRow[2] || '';
    const lastName = userRow[6] || userRow[3] || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const deptCode = userRow[7] || 'Operator';
    const profilePic = userRow[11] || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200';

    // 3. ดึงประวัติการประเมินจากแท็บ Record
    const recordRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Record!A2:E',
    });
    const recordRows = recordRes.data.values || [];

    // คัดกรองเอาเฉพาะสถานะ PASS ของพนักงานคนนี้
    const passedStations = recordRows
      .filter(row => row && row[0] === targetEmp && row[2] === 'PASS')
      .map(row => row[1]);

    return res.status(200).json({
      empNo: empCode,
      name: fullName,
      dept: deptCode,
      pic: profilePic,
      passedStations: [...new Set(passedStations)],
      allEmployees: allEmployees
    });

  } catch (error) {
    console.error('API Passport Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
