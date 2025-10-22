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
    console.log(`\n=== Sheets API 호출 ===`);
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', JSON.stringify(req.query));
    console.log('Body:', JSON.stringify(req.body));

    // 모든 소스에서 파라미터 수집 (최대 호환성)
    const allParams = {
      ...req.query,
      ...req.body,
    };

    console.log('All Params:', JSON.stringify(allParams));

    // action 추출 (여러 패턴 지원)
    let action = allParams.action || allParams.type || allParams.method;
    
    // sheetName 추출 (여러 패턴 지원)
    let sheetName = allParams.sheetName || allParams.sheet || allParams.name;
    
    // range 추출
    let range = allParams.range || 'A:Z';
    
    // values 추출
    let values = allParams.values || allParams.data || allParams.rows;

    console.log('Parsed:', { action, sheetName, range, hasValues: !!values });

    // action이 없으면 기본값 또는 에러
    if (!action) {
      console.error('❌ action 없음 - 전체 파라미터:', allParams);
      
      // 만약 sheetName만 있고 values가 없으면 read로 간주
      if (sheetName && !values) {
        console.log('→ 자동으로 read로 처리');
        action = 'read';
      } else {
        return res.status(400).json({ 
          error: 'action 파라미터가 필요합니다',
          hint: 'action, type, 또는 method 파라미터를 전달하세요',
          receivedParams: Object.keys(allParams),
          example: { action: 'read', sheetName: '사용자', range: 'A:D' }
        });
      }
    }

    // sheetName이 없으면 에러
    if (!sheetName) {
      console.error('❌ sheetName 없음');
      return res.status(400).json({ 
        error: 'sheetName 파라미터가 필요합니다',
        hint: 'sheetName, sheet, 또는 name 파라미터를 전달하세요',
        receivedParams: Object.keys(allParams)
      });
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    let result;

    // READ
    if (action === 'read' || action === 'get' || action === 'fetch') {
      console.log(`📖 READ: ${sheetName}!${range}`);
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!${range}`,
      });
      
      result = response.data.values || [];
      console.log(`✅ 읽기 완료: ${result.length}행`);
    }
    
    // WRITE / UPDATE
    else if (action === 'write' || action === 'update' || action === 'set') {
      if (!values) {
        return res.status(400).json({ error: 'values 파라미터가 필요합니다' });
      }
      
      console.log(`✍️ WRITE: ${sheetName}!${range}, ${values.length}행`);
      
      // 데이터 정리
      const cleanValues = Array.isArray(values) 
        ? values.map(row => 
            Array.isArray(row)
              ? row.map(cell => {
                  if (cell === null || cell === undefined) return '';
                  if (typeof cell === 'object') return JSON.stringify(cell);
                  return String(cell);
                })
              : [String(row)]
          )
        : [[String(values)]];
      
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
    
    // APPEND / ADD
    else if (action === 'append' || action === 'add' || action === 'insert') {
      if (!values) {
        return res.status(400).json({ error: 'values 파라미터가 필요합니다' });
      }
      
      console.log(`➕ APPEND: ${sheetName}, ${values.length}행`);
      
      const cleanValues = Array.isArray(values)
        ? values.map(row => 
            Array.isArray(row)
              ? row.map(cell => {
                  if (cell === null || cell === undefined) return '';
                  if (typeof cell === 'object') return JSON.stringify(cell);
                  return String(cell);
                })
              : [String(row)]
          )
        : [[String(values)]];
      
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
    
    // CLEAR / DELETE
    else if (action === 'clear' || action === 'delete' || action === 'remove') {
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
        validActions: ['read/get/fetch', 'write/update/set', 'append/add/insert', 'clear/delete/remove'],
        received: action,
        allParams: allParams
      });
    }

    console.log('=== API 성공 ===\n');
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('=== API 에러 ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('==================\n');
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
