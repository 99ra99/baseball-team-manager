import fetch from 'node-fetch';

const URLS = {
  batter: 'http://www.gameone.kr/club/info/ranking/hitter?club_idx=42934&season=2025&kind=5&lig_idx=487&group=45&part=2',
  pitcher: 'http://www.gameone.kr/club/info/ranking/pitcher?club_idx=42934&season=2025&kind=5&lig_idx=487&group=45&part=2'
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
              이름: cleanText(cells[1]),
              타율: parseNumber(cells[2]),
              경기: parseNumber(cells[3]),
              타석: parseNumber(cells[4]),
              타수: parseNumber(cells[5]),
              득점: parseNumber(cells[6]),
              안타: parseNumber(cells[7]),
              '1루타': parseNumber(cells[8]),
              '2루타': parseNumber(cells[9]),
              '3루타': parseNumber(cells[10]),
              홈런: parseNumber(cells[11]),
              루타: parseNumber(cells[12]),
              타점: parseNumber(cells[13]),
              도루: parseNumber(cells[14]),
              도실: parseNumber(cells[15]),
              희타: parseNumber(cells[16]),
              희비: parseNumber(cells[17]),
              볼넷: parseNumber(cells[18]),
              고의4구: parseNumber(cells[19]),
              사구: parseNumber(cells[20]),
              삼진: parseNumber(cells[21]),
              병살: parseNumber(cells[22]),
              장타율: parseNumber(cells[23]),
              출루율: parseNumber(cells[24]),
              도루성공률: parseNumber(cells[25]),
              멀티히트: parseNumber(cells[26]),
              OPS: parseNumber(cells[27]),
              'BB/K': parseNumber(cells[28]),
              '장타/안타': cells.length > 29 ? parseNumber(cells[29]) : '0'
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
              이름: cleanText(cells[1]),
              방어율: parseNumber(cells[2]),
              경기: parseNumber(cells[3]),
              승: parseNumber(cells[4]),
              패: parseNumber(cells[5]),
              세이브: parseNumber(cells[6]),
              홀드: parseNumber(cells[7]),
              승률: parseNumber(cells[8]),
              타자: parseNumber(cells[9]),
              타수: parseNumber(cells[10]),
              투구수: parseNumber(cells[11]),
              이닝: parseNumber(cells[12]),
              피안타: parseNumber(cells[13]),
              피홈런: parseNumber(cells[14]),
              희타: parseNumber(cells[15]),
              희비: parseNumber(cells[16]),
              볼넷: parseNumber(cells[17]),
              고의4구: parseNumber(cells[18]),
              사구: parseNumber(cells[19]),
              탈삼진: parseNumber(cells[20]),
              폭투: parseNumber(cells[21]),
              보크: parseNumber(cells[22]),
              실점: parseNumber(cells[23]),
              자책점: parseNumber(cells[24]),
              WHIP: parseNumber(cells[25]),
              피안타율: parseNumber(cells[26]),
              탈삼진율: cells.length > 27 ? parseNumber(cells[27]) : '0'
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

  if (req.method !== 'GET') {
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
