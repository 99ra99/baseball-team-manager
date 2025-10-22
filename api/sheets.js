import { google } from 'googleapis';

// 환경 변수에서 서비스 계정 정보 가져오기
const getAuth = () => {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } catch (error) {
    console.error('인증 초기화 실패:', error);
    throw new Error('Google 인증 설정 오류');
  }
};

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

/**
 * API 핸들러
 */
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log(`=== Sheets API 호출 시작 ===`);
    console.log('Method:', req.method);
    console.log('Query:', JSON.stringify(req.query));
    console.log('Body:', JSON.stringify(req.body));

    // req.query와 req.body를 모두 확인 (기존 코드 호환)
    const params = { ...req.query, ...req.body };
    const { action, sheetName, range, values } = params;

    console.log('Parsed params:', { action, sheetName, range, valuesCount: values?.length });

    // action이 없으면 에러
    if (!action) {
      console.error('❌ action 파라미터 없음');
      return res.status(400).json({ 
        error: 'action 파라미터가 필요합니다',
        receivedParams: Object.keys(params)
      });
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    let result;

    // READ
    if (action === 'read') {
      console.log(`📖 READ: ${sheetName}!${range}`);
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!${range}`,
      });
      
      result = response.data.values || [];
      console.log(`✅ 읽기 완료: ${result.length}행`);
    }
    
    // WRITE
    else if (action === 'write') {
      console.log(`✍️ WRITE: ${sheetName}!${range}, ${values?.length}행`);
      
      // 데이터 정리
      const cleanValues = values.map(row => 
        row.map(cell => {
          if (cell === null || cell === undefined) return '';
          if (typeof cell === 'object') return JSON.stringify(cell);
          return String(cell);
        })
      );
      
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: cleanValues,
        },
      });
      
      result = response.data;
      console.log(`✅ 쓰기 완료: ${response.data.updatedCells}개 셀`);
    }
    
    // APPEND
    else if (action === 'append') {
      console.log(`➕ APPEND: ${sheetName}, ${values?.length}행`);
      
      const cleanValues = values.map(row => 
        row.map(cell => {
          if (cell === null || cell === undefined) return '';
          if (typeof cell === 'object') return JSON.stringify(cell);
          return String(cell);
        })
      );
      
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: cleanValues,
        },
      });
      
      result = response.data;
      console.log(`✅ 추가 완료: ${response.data.updates.updatedRows}행`);
    }
    
    // CLEAR
    else if (action === 'clear') {
      console.log(`🗑️ CLEAR: ${sheetName}!${range}`);
      
      const response = await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!${range}`,
      });
      
      result = response.data;
      console.log(`✅ 지우기 완료`);
    }
    
    else {
      console.error('❌ 유효하지 않은 action:', action);
      return res.status(400).json({ 
        error: '유효하지 않은 action입니다',
        validActions: ['read', 'write', 'append', 'clear'],
        received: action
      });
    }

    console.log('=== API 성공 ===');
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('=== API 에러 ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
