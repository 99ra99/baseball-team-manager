import * as cheerio from 'cheerio';

// 게임원 계정 정보 (환경 변수 사용 권장)
const GAMEONE_ID = process.env.GAMEONE_ID || 'lk6462';
const GAMEONE_PW = process.env.GAMEONE_PW || 'hoochi62';
const CLUB_IDX = '42934';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 게임원 로그인 함수
async function loginGameOne() {
  try {
    console.log('게임원 로그인 시도...');
    
    // 로그인 시도
    const loginResponse = await fetch('http://www.gameone.kr/member/login_ok', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: `user_id=${GAMEONE_ID}&user_pw=${GAMEONE_PW}`,
      redirect: 'manual'
    });

    // 쿠키 추출
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('로그인 응답 쿠키:', cookies);
    
    return cookies || '';
  } catch (error) {
    console.error('로그인 실패:', error);
    return '';
  }
}

// 타자 랭킹 크롤링
async function fetchBatterRanking(cookies, season = '2025') {
  try {
    console.log('타자 랭킹 크롤링 시작...');
    
    const url = `http://www.gameone.kr/club/info/ranking/hitter?club_idx=${CLUB_IDX}&season=${season}`;
    
    const response = await fetch(url, {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const players = [];
    
    // 테이블 파싱
    $('.section_rank table tbody tr').each((index, element) => {
      const cells = $(element).find('td');
      
      if (cells.length >= 29) {
        const nameWithNumber = $(cells[1]).text().trim();
        const name = nameWithNumber.replace(/\(\d+\)/, '').trim();
        
        const player = {
          name: name,
          avg: $(cells[2]).text().trim(),
          games: $(cells[3]).text().trim(),
          pa: $(cells[4]).text().trim(),
          ab: $(cells[5]).text().trim(),
          r: $(cells[6]).text().trim(),
          h: $(cells[7]).text().trim(),
          single: $(cells[8]).text().trim(),
          double: $(cells[9]).text().trim(),
          triple: $(cells[10]).text().trim(),
          hr: $(cells[11]).text().trim(),
          tb: $(cells[12]).text().trim(),
          rbi: $(cells[13]).text().trim(),
          sb: $(cells[14]).text().trim(),
          cs: $(cells[15]).text().trim(),
          sh: $(cells[16]).text().trim(),
          sf: $(cells[17]).text().trim(),
          bb: $(cells[18]).text().trim(),
          ibb: $(cells[19]).text().trim(),
          hbp: $(cells[20]).text().trim(),
          so: $(cells[21]).text().trim(),
          gdp: $(cells[22]).text().trim(),
          slg: $(cells[23]).text().trim(),
          obp: $(cells[24]).text().trim(),
          sbPct: $(cells[25]).text().trim(),
          multiHit: $(cells[26]).text().trim(),
          ops: $(cells[27]).text().trim(),
          bbk: $(cells[28]).text().trim(),
          xbhh: $(cells[29]).text().trim()
        };
        
        players.push(player);
        console.log(`타자 추가: ${name}, 타율: ${player.avg}`);
      }
    });
    
    console.log(`타자 ${players.length}명 크롤링 완료`);
    return players;
  } catch (error) {
    console.error('타자 랭킹 크롤링 실패:', error);
    throw error;
  }
}

// 투수 랭킹 크롤링
async function fetchPitcherRanking(cookies, season = '2025') {
  try {
    console.log('투수 랭킹 크롤링 시작...');
    
    const url = `http://www.gameone.kr/club/info/ranking/pitcher?club_idx=${CLUB_IDX}&season=${season}`;
    
    const response = await fetch(url, {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const players = [];
    
    // 테이블 파싱
    $('.section_rank table tbody tr').each((index, element) => {
      const cells = $(element).find('td');
      
      if (cells.length >= 27) {
        const nameWithNumber = $(cells[1]).text().trim();
        const name = nameWithNumber.replace(/\(\d+\)/, '').trim();
        
        const player = {
          name: name,
          era: $(cells[2]).text().trim(),
          games: $(cells[3]).text().trim(),
          w: $(cells[4]).text().trim(),
          l: $(cells[5]).text().trim(),
          sv: $(cells[6]).text().trim(),
          hld: $(cells[7]).text().trim(),
          wpct: $(cells[8]).text().trim(),
          bf: $(cells[9]).text().trim(),
          ab: $(cells[10]).text().trim(),
          np: $(cells[11]).text().trim(),
          ip: $(cells[12]).text().trim(),
          h: $(cells[13]).text().trim(),
          hr: $(cells[14]).text().trim(),
          sh: $(cells[15]).text().trim(),
          sf: $(cells[16]).text().trim(),
          bb: $(cells[17]).text().trim(),
          ibb: $(cells[18]).text().trim(),
          hbp: $(cells[19]).text().trim(),
          so: $(cells[20]).text().trim(),
          wp: $(cells[21]).text().trim(),
          bk: $(cells[22]).text().trim(),
          r: $(cells[23]).text().trim(),
          er: $(cells[24]).text().trim(),
          whip: $(cells[25]).text().trim(),
          oavg: $(cells[26]).text().trim(),
          kper9: $(cells[27]).text().trim()
        };
        
        players.push(player);
        console.log(`투수 추가: ${name}, 방어율: ${player.era}`);
      }
    });
    
    console.log(`투수 ${players.length}명 크롤링 완료`);
    return players;
  } catch (error) {
    console.error('투수 랭킹 크롤링 실패:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    const { action, season = '2025', type } = req.body || req.query;

    console.log('게임원 크롤링 요청:', { action, season, type });

    // 로그인
    const cookies = await loginGameOne();
    
    if (!cookies) {
      return res.status(200).json({
        success: false,
        error: '게임원 로그인에 실패했습니다.'
      });
    }

    // 타자 랭킹
    if (action === 'fetchBatter' || type === 'batter') {
      const batterData = await fetchBatterRanking(cookies, season);
      
      return res.status(200).json({
        success: true,
        data: batterData,
        count: batterData.length,
        type: 'batter'
      });
    }

    // 투수 랭킹
    if (action === 'fetchPitcher' || type === 'pitcher') {
      const pitcherData = await fetchPitcherRanking(cookies, season);
      
      return res.status(200).json({
        success: true,
        data: pitcherData,
        count: pitcherData.length,
        type: 'pitcher'
      });
    }

    // 타자 + 투수 모두
    if (action === 'fetchAll' || type === 'all') {
      const batterData = await fetchBatterRanking(cookies, season);
      const pitcherData = await fetchPitcherRanking(cookies, season);
      
      return res.status(200).json({
        success: true,
        batter: batterData,
        pitcher: pitcherData,
        batterCount: batterData.length,
        pitcherCount: pitcherData.length
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Use fetchBatter, fetchPitcher, or fetchAll'
    });

  } catch (error) {
    console.error('게임원 크롤링 에러:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
