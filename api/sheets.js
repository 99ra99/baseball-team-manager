import { google } from 'googleapis';
import bcrypt from 'bcryptjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 기본 마스터 계정 (하드코딩)
const DEFAULT_MASTER = {
  username: 'admin',
  password: 'admin123',
  name: '관리자',
  role: '마스터'
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const { method, body } = req;
    const { action, range, values } = body || {};

    // 로그인 처리
    if (action === 'login') {
      const { username, password } = body;

      // 기본 관리자 계정 체크
      if (username === DEFAULT_MASTER.username) {
        const isValid = await bcrypt.compare(password, await bcrypt.hash(DEFAULT_MASTER.password, 10));
        if (password === DEFAULT_MASTER.password || isValid) {
          return res.status(200).json({
            success: true,
            user: {
              username: DEFAULT_MASTER.username,
              name: DEFAULT_MASTER.name,
              role: DEFAULT_MASTER.role
            }
          });
        }
      }

      // 스프레드시트에서 사용자 조회
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: '사용자!A2:D',
        });

        if (response.data.values) {
          for (const row of response.data.values) {
            const [storedUsername, passwordHash, name, role] = row;
            if (storedUsername === username) {
              const isValid = await bcrypt.compare(password, passwordHash);
              if (isValid) {
                return res.status(200).json({
                  success: true,
                  user: { username, name, role }
                });
              }
            }
          }
        }
      } catch (error) {
        console.log('사용자 시트 조회 실패 (아직 없을 수 있음):', error.message);
      }

      return res.status(200).json({
        success: false,
        error: '아이디 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // 사용자 추가
    if (action === 'addUser') {
      const { user } = body;
      const { username, password, name, role } = user;

      // 중복 체크
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: '사용자!A2:A',
        });

        if (response.data.values) {
          const existingUsers = response.data.values.flat();
          if (existingUsers.includes(username)) {
            return res.status(200).json({
              success: false,
              error: '이미 존재하는 아이디입니다.'
            });
          }
        }
      } catch (error) {
        console.log('사용자 시트가 아직 없을 수 있음');
      }

      // 비밀번호 해시화
      const passwordHash = await bcrypt.hash(password, 10);

      // 사용자 추가
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: '사용자!A2:D',
        valueInputOption: 'RAW',
        resource: {
          values: [[username, passwordHash, name, role]]
        }
      });

      return res.status(200).json({
        success: true,
        message: '사용자가 추가되었습니다.'
      });
    }

    // 사용자 삭제
    if (action === 'deleteUser') {
      const { username } = body;

      if (username === 'admin') {
        return res.status(200).json({
          success: false,
          error: '관리자 계정은 삭제할 수 없습니다.'
        });
      }

      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: '사용자!A2:D',
        });

        if (response.data.values) {
          const users = response.data.values;
          const updatedUsers = users.filter(row => row[0] !== username);

          // 전체 데이터 다시 쓰기
          await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: '사용자!A2:D',
          });

          if (updatedUsers.length > 0) {
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: '사용자!A2:D',
              valueInputOption: 'RAW',
              resource: { values: updatedUsers }
            });
          }

          return res.status(200).json({
            success: true,
            message: '사용자가 삭제되었습니다.'
          });
        }
      } catch (error) {
        console.error('사용자 삭제 실패:', error);
        return res.status(200).json({
          success: false,
          error: '사용자 삭제 중 오류가 발생했습니다.'
        });
      }
    }

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
