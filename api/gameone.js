import fetch from 'node-fetch';

const URLS = {
  batter: 'https://gameone.kr/club/info/ranking/hitter?club_idx=42934&season=2025&kind=5&lig_idx=487&group=45&part=2',
  pitcher: 'https://gameone.kr/club/info/ranking/pitcher?club_idx=42934&season=2025&kind=5&lig_idx=487&group=45&part=2'
};

/**
 * 텍스트를 정리하는 헬퍼 함수
 */
function cleanText(text) {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * 숫자 값을 파싱하는 헬퍼 함수
 */
function parseNumber(value) {
  const cleaned = value.trim();
  if (cleaned === '-' || cleaned === '' || cleaned === '0') {
    return '0';
  }
  return cleaned;
}

/**
 * 타자 랭킹 데이터를 크롤링하는 함수
 */
async function fetchBatterRanking() {
  try {
    console.log('타자 랭킹 크롤링 시작...');
    
    const response = await fetch(URLS.batter, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();
    console.log('HTML 가져오기 성공');
    
    const players = [];
    
    // 마크다운 테이블 파싱
    const lines = html.split('\n');
    let inTable = false;
    let headerPassed = false;
    
    for (const line of lines) {
      // 테이블 라인 확인 (| 로 시작하고 여러 개의 | 포함)
      if (line.includes('|') && line.split('|').length > 10) {
        
        // 헤더 라인 건너뛰기
        if (line.includes('순위') && line.includes('이름')) {
          inTable = true;
          console.log('타자 테이블 헤더 발견');
          continue;
        }
        
        // 구분선 건너뛰기 (---|---|---)
        if (line.includes('---')) {
          headerPassed = true;
          continue;
        }
        
        // 데이터 라인 파싱
        if (inTable && headerPassed) {
          const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
          
          // 최소 29개 컬럼 확인 (순위부터 장타/안타까지)
          if (cells.length >= 29) {
            console.log(`타자 데이터 파싱 중: ${cells[1]} (${cells.length}개 컬럼)`);
            
            const player = {
              name: cleanText(cells[1]),
              avg: parseNumber(cells[2]),
              games: parseNumber(cells[3]),
              pa: parseNumber(cells[4]),
              ab: parseNumber(cells[5]),
              r: parseNumber(cells[6]),
              h: parseNumber(cells[7]),
              single: parseNumber(cells[8]),
              double: parseNumber(cells[9]),
              triple: parseNumber(cells[10]),
              hr: parseNumber(cells[11]),
              tb: parseNumber(cells[12]),
              rbi: parseNumber(cells[13]),
              sb: parseNumber(cells[14]),
              cs: parseNumber(cells[15]),
              sh: parseNumber(cells[16]),
              sf: parseNumber(cells[17]),
              bb: parseNumber(cells[18]),
              ibb: parseNumber(cells[19]),
              hbp: parseNumber(cells[20]),
              so: parseNumber(cells[21]),
              gdp: parseNumber(cells[22]),
              slg: parseNumber(cells[23]),
              obp: parseNumber(cells[24]),
              sbPct: parseNumber(cells[25]),
              multiHit: parseNumber(cells[26]),
              ops: parseNumber(cells[27]),
              bbk: parseNumber(cells[28]),
              xbhh: cells.length > 29 ? parseNumber(cells[29]) : '0'
            };
            
            players.push(player);
          }
        }
        
        // 테이블이 끝나면 중단
        if (inTable && headerPassed && cells.length < 10) {
          break;
        }
      }
    }
    
    console.log(`타자 ${players.length}명 데이터 파싱 완료`);
    return players;
    
  } catch (error) {
    console.error('타자 랭킹 크롤링 실패:', error);
    throw error;
  }
}

/**
 * 투수 랭킹 데이터를 크롤링하는 함수
 */
async function fetchPitcherRanking() {
  try {
    console.log('투수 랭킹 크롤링 시작...');
    
    const response = await fetch(URLS.pitcher, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();
    console.log('HTML 가져오기 성공');
    
    const players = [];
    
    // 마크다운 테이블 파싱
    const lines = html.split('\n');
    let inTable = false;
    let headerPassed = false;
    
    for (const line of lines) {
      // 테이블 라인 확인
      if (line.includes('|') && line.split('|').length > 10) {
        
        // 헤더 라인 건너뛰기
        if (line.includes('순위') && line.includes('이름')) {
          inTable = true;
          console.log('투수 테이블 헤더 발견');
          continue;
        }
        
        // 구분선 건너뛰기
        if (line.includes('---')) {
          headerPassed = true;
          continue;
        }
        
        // 데이터 라인 파싱
        if (inTable && headerPassed) {
          const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
          
          // 최소 27개 컬럼 확인
          if (cells.length >= 27) {
            console.log(`투수 데이터 파싱 중: ${cells[1]} (${cells.length}개 컬럼)`);
            
            const player = {
              name: cleanText(cells[1]),
              era: parseNumber(cells[2]),
              games: parseNumber(cells[3]),
              w: parseNumber(cells[4]),
              l: parseNumber(cells[5]),
              sv: parseNumber(cells[6]),
              hld: parseNumber(cells[7]),
              wpct: parseNumber(cells[8]),
              bf: parseNumber(cells[9]),
              ab: parseNumber(cells[10]),
              np: parseNumber(cells[11]),
              ip: parseNumber(cells[12]),
              h: parseNumber(cells[13]),
              hr: parseNumber(cells[14]),
              sh: parseNumber(cells[15]),
              sf: parseNumber(cells[16]),
              bb: parseNumber(cells[17]),
              ibb: parseNumber(cells[18]),
              hbp: parseNumber(cells[19]),
              so: parseNumber(cells[20]),
              wp: parseNumber(cells[21]),
              bk: parseNumber(cells[22]),
              r: parseNumber(cells[23]),
              er: parseNumber(cells[24]),
              whip: parseNumber(cells[25]),
              oavg: parseNumber(cells[26]),
              kper9: cells.length > 27 ? parseNumber(cells[27]) : '0'
            };
            
            players.push(player);
          }
        }
        
        // 테이블이 끝나면 중단
        if (inTable && headerPassed && cells.length < 10) {
          break;
        }
      }
    }
    
    console.log(`투수 ${players.length}명 데이터 파싱 완료`);
    return players;
    
  } catch (error) {
    console.error('투수 랭킹 크롤링 실패:', error);
    throw error;
  }
}

/**
 * API 엔드포인트 핸들러
 */
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET과 POST 모두 허용
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('게임원 크롤링 API 호출됨');
    
    // 타자와 투수 데이터를 동시에 가져오기
    const [batters, pitchers] = await Promise.all([
      fetchBatterRanking(),
      fetchPitcherRanking()
    ]);

    console.log(`크롤링 완료 - 타자: ${batters.length}명, 투수: ${pitchers.length}명`);

    res.status(200).json({
      success: true,
      data: {
        batters,
        pitchers
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('게임원 크롤링 에러:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
