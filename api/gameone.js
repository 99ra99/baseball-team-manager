import * as cheerio from 'cheerio';

// 고정 URL 설정 (로그인 불필요 - 공개 페이지)
const URLS = {
  batter: 'http://www.gameone.kr/club/info/ranking/hitter?club_idx=42934&season=2025&kind=5&lig_idx=487&group=45&part=2',
  pitcher: 'http://www.gameone.kr/club/info/ranking/pitcher?club_idx=42934&season=2025&kind=5&lig_idx=487&group=45&part=2',
  games: 'http://www.gameone.kr/club/info/schedule/result?club_idx=42934'
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 경기 기록 크롤링 함수 추가
async function fetchGameResults() {
  try {
    console.log('경기 기록 크롤링 시작...');
    
    const response = await fetch(URLS.games, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const games = [];
    
    // 경기 결과 테이블 파싱
    $('.tbl_schedule tbody tr').each((index, element) => {
      const cells = $(element).find('td');
      
      if (cells.length >= 7) {
        const dateText = $(cells[0]).text().trim();
        const opponent = $(cells[2]).find('.team_name').text().trim();
        const score = $(cells[3]).text().trim();
        const result = $(cells[4]).text().trim();
        const stadium = $(cells[5]).text().trim();
        
        games.push({
          date: dateText,
          opponent: opponent,
          score: score,
          result: result,
          stadium: stadium,
          homeAway: stadium.includes('홈') ? '홈' : '원정'
        });
        
        console.log(`경기 추가: ${dateText} vs ${opponent} - ${score} (${result})`);
      }
    });
    
    console.log(`경기 ${games.length}개 크롤링 완료`);
    return games;
  } catch (error) {
    console.error('경기 기록 크롤링 실패:', error);
    throw error;
  }
}

// 타자 랭킹 크롤링
async function fetchBatterRanking() {
  try {
    console.log('타자 랭킹 크롤링 시작...');
    
    const response = await fetch(URLS.batter, {
      headers: {
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
async function fetchPitcherRanking() {
  try {
    console.log('투수 랭킹 크롤링 시작...');
    
    const response = await fetch(URLS.pitcher, {
      headers: {
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
    const { action, type } = req.body || req.query;

    console.log('게임원 크롤링 요청:', { action, type });

    // 타자 랭킹
    if (action === 'fetchBatter' || type === 'batter') {
      const batterData = await fetchBatterRanking();
      
      return res.status(200).json({
        success: true,
        data: batterData,
        count: batterData.length,
        type: 'batter'
      });
    }

    // 투수 랭킹
    if (action === 'fetchPitcher' || type === 'pitcher') {
      const pitcherData = await fetchPitcherRanking();
      
      return res.status(200).json({
        success: true,
        data: pitcherData,
        count: pitcherData.length,
        type: 'pitcher'
      });
    }

    // 경기 기록
    if (action === 'fetchGames' || type === 'games') {
      const gamesData = await fetchGameResults();
      
      return res.status(200).json({
        success: true,
        data: gamesData,
        count: gamesData.length,
        type: 'games'
      });
    }

    // 타자 + 투수 + 경기 모두
    if (action === 'fetchAll' || type === 'all') {
      const batterData = await fetchBatterRanking();
      const pitcherData = await fetchPitcherRanking();
      const gamesData = await fetchGameResults();
      
      return res.status(200).json({
        success: true,
        batter: batterData,
        pitcher: pitcherData,
        games: gamesData,
        batterCount: batterData.length,
        pitcherCount: pitcherData.length,
        gamesCount: gamesData.length
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Use fetchBatter, fetchPitcher, fetchGames, or fetchAll'
    });

  } catch (error) {
    console.error('게임원 크롤링 에러:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
