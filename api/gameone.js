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
    
    // 경기 결과 파싱 - class="scon_players" 리스트 기준
    $('.scon_players').each((index, element) => {
      try {
        // 1. 일시(날짜) 추출
        const dateText = $(element).find('td:first-child').text().trim();
        
        // 2. 게임 정보 추출
        const gameCell = $(element).find('td').eq(3); // 4번째 td (게임 정보)
        
        // 팀 정보 추출
        const team1Element = gameCell.find('.game.team1');
        const team2Element = gameCell.find('.team2');
        
        const team1Name = team1Element.find('a').text().trim() || team1Element.text().replace(/\d+/g, '').trim();
        const team2Name = team2Element.find('a').text().trim() || team2Element.text().replace(/\d+/g, '').trim();
        
        // 스코어 추출
        const team1Score = parseInt(team1Element.find('.score').text().trim()) || 0;
        const team2Score = parseInt(team2Element.find('.score').text().trim()) || 0;
        
        // 3. 상대팀 결정 (지존 리틀 베이스볼 클럽이 아닌 팀)
        let opponent = '';
        let homeAway = '';
        let ourScore = 0;
        let opponentScore = 0;
        
        if (team1Name.includes('지존') || team1Name.includes('리틀') || team1Name.includes('베이스볼')) {
          // 우리팀이 team1 (홈)
          opponent = team2Name;
          homeAway = '홈';
          ourScore = team1Score;
          opponentScore = team2Score;
        } else if (team2Name.includes('지존') || team2Name.includes('리틀') || team2Name.includes('베이스볼')) {
          // 우리팀이 team2 (원정)
          opponent = team1Name;
          homeAway = '원정';
          ourScore = team2Score;
          opponentScore = team1Score;
        } else {
          // 팀 이름이 명확하지 않은 경우 스킵
          return;
        }
        
        // 4. 결과 계산 (우리 점수 - 상대 점수)
        const scoreDiff = ourScore - opponentScore;
        const result = `${ourScore}-${opponentScore}`;
        
        // 5. 비고 (콜드승 체크)
        const coldWin = gameCell.find('.exp_win').text().includes('콜드승') ? '콜드승' : '';
        
        // 날짜와 상대팀이 있는 경우만 추가
        if (dateText && opponent) {
          games.push({
            date: dateText,
            opponent: opponent.replace(/^\s*\d+\s*/, ''), // 앞의 숫자 제거
            homeAway: homeAway,
            score: result,
            result: scoreDiff > 0 ? '승' : scoreDiff < 0 ? '패' : '무',
            note: coldWin,
            stadium: '', // 경기장 정보는 별도 추출 필요시 추가
            ourScore: ourScore,
            opponentScore: opponentScore
          });
          
          console.log(`경기 추가: ${dateText} ${homeAway} vs ${opponent} - ${result} (${scoreDiff > 0 ? '승' : scoreDiff < 0 ? '패' : '무'}${coldWin ? ' ' + coldWin : ''})`);
        }
      } catch (error) {
        console.error(`경기 ${index} 파싱 오류:`, error);
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
    
    // 테이블 파싱 (안전한 방식)
    $('.section_rank table tbody tr, table tbody tr').each((index, element) => {
      const cells = $(element).find('td');
      
      if (cells.length >= 29) {
        const nameWithNumber = $(cells[1]).text().trim();
        const name = nameWithNumber.replace(/\(\d+\)/, '').trim();
        
        // 이름이 비어있으면 스킵
        if (!name) return;
        
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
    
    // 테이블 파싱 (안전한 방식)
    $('.section_rank table tbody tr, table tbody tr').each((index, element) => {
      const cells = $(element).find('td');
      
      if (cells.length >= 27) {
        const nameWithNumber = $(cells[1]).text().trim();
        const name = nameWithNumber.replace(/\(\d+\)/, '').trim();
        
        // 이름이 비어있으면 스킵
        if (!name) return;
        
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

    // 액션 유효성 검사
    const validActions = ['fetchBatter', 'fetchPitcher', 'fetchGames', 'fetchAll'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: `Invalid action: ${action}. Valid actions: ${validActions.join(', ')}`
      });
    }

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
