import { google } from 'googleapis';

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    // Service Account 인증
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const { method, body } = req;
    const { action, range, values } = body || {};

    // GET - 데이터 읽기
    if (method === 'GET' || action === 'read') {
      const readRange = req.query.range || range;
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: readRange,
      });

      return res.status(200).json({
        success: true,
        data: response.data,
      });
    }

    // POST - 데이터 쓰기
    if (method === 'POST' && action === 'write') {
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values },
      });

      return res.status(200).json({
        success: true,
        data: response.data,
      });
    }

    // 스프레드시트 정보 가져오기
    if (method === 'GET' && action === 'info') {
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
      });

      return res.status(200).json({
        success: true,
        data: response.data,
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action',
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}