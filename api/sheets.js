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

// 컬럼 값을 안전하게 변환
const sanitizeValue = (value) => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

/**
 * 시트 데이터 읽기
 */
async function readSheet(sheetName, range) {
  try {
    console.log(`시트 읽기: ${sheetName}!${range}`);
    
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
    });
    
    console.log(`읽기 성공: ${response.data.values?.length || 0}행`);
    return response.data.values || [];
  } catch (error) {
    console.error('시트 읽기 실패:', error.message);
    throw error;
  }
}

/**
 * 시트 데이터 쓰기
 */
async function writeSheet(sheetName, range, values) {
  try {
    console.log(`시트 쓰기: ${sheetName}!${range}, ${values.length}행`);
    
    // 데이터 정리
    const sanitizedValues = values.map(row => 
      row.map(cell => sanitizeValue(cell))
    );
    
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: sanitizedValues,
      },
    });
    
    console.log(`쓰기 성공: ${response.data.updatedCells}개 셀 업데이트`);
    return response.data;
  } catch (error) {
    console.error('시트 쓰기 실패:', error.message);
    throw error;
  }
}

/**
 * 시트 데이터 추가 (append)
 */
async function appendSheet(sheetName, values) {
  try {
    console.log(`시트 추가: ${sheetName}, ${values.length}행`);
    
    // 데이터 정리
    const sanitizedValues = values.map(row => 
      row.map(cell => sanitizeValue(cell))
    );
    
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:A`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: sanitizedValues,
      },
    });
    
    console.log(`추가 성공: ${response.data.updates.updatedRows}행 추가`);
    return response.data;
  } catch (error) {
    console.error('시트 추가 실패:', error.message);
    throw error;
  }
}

/**
 * 시트 데이터 지우기
 */
async function clearSheet(sheetName, range) {
  try {
    console.log(`시트 지우기: ${sheetName}!${range}`);
    
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
    });
    
    console.log('지우기 성공');
    return response.data;
  } catch (error) {
    console.error('시트 지우기 실패:', error.message);
    throw error;
  }
}

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
    console.log(`Sheets API 호출: ${req.method} ${req.url}`);
    console.log('Body:', JSON.stringify(req.body));

    const { action, sheetName, range, values } = req.body || {};

    // 필수 파라미터 검증
    if (!action) {
      return res.status(400).json({ 
        error: 'action 파라미터가 필요합니다',
        received: { action, sheetName, range }
      });
    }

    if (!sheetName) {
      return res.status(400).json({ 
        error: 'sheetName 파라미터가 필요합니다',
        received: { action, sheetName, range }
      });
    }

    let result;

    switch (action) {
      case 'read':
        if (!range) {
          return res.status(400).json({ error: 'range 파라미터가 필요합니다' });
        }
        result = await readSheet(sheetName, range);
        break;

      case 'write':
        if (!range || !values) {
          return res.status(400).json({ error: 'range와 values 파라미터가 필요합니다' });
        }
        result = await writeSheet(sheetName, range, values);
        break;

      case 'append':
        if (!values) {
          return res.status(400).json({ error: 'values 파라미터가 필요합니다' });
        }
        result = await appendSheet(sheetName, values);
        break;

      case 'clear':
        if (!range) {
          return res.status(400).json({ error: 'range 파라미터가 필요합니다' });
        }
        result = await clearSheet(sheetName, range);
        break;

      default:
        return res.status(400).json({ 
          error: '유효하지 않은 action입니다',
          validActions: ['read', 'write', 'append', 'clear']
        });
    }

    console.log('API 성공');
    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API 에러:', error);
    
    // 상세한 에러 정보 반환
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
