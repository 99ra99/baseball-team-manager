import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Users, TrendingUp, Target, Calendar, Clipboard } from 'lucide-react';

const BaseballTeamManager = () => {
  const [activeTab, setActiveTab] = useState('roster');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 데이터 상태
  const [players, setPlayers] = useState([]);
  const [batterStats, setBatterStats] = useState([]);
  const [pitcherStats, setPitcherStats] = useState([]);
  const [games, setGames] = useState([]);
  const [lineup, setLineup] = useState(Array(10).fill(null).map(() => ({ player: null, position: '' })));
  const [bench, setBench] = useState([]);
  
  // API 기본 URL (배포 시 자동으로 Vercel URL 사용)
  const API_URL = '/api/sheets';
  
  const lineupRef = useRef(null);

  // 포지션 옵션
  const positionOptions = [
    { value: '', label: '선택' },
    { value: '투수', label: '투수 (P)' },
    { value: '포수', label: '포수 (C)' },
    { value: '1루수', label: '1루수 (1B)' },
    { value: '2루수', label: '2루수 (2B)' },
    { value: '3루수', label: '3루수 (3B)' },
    { value: '유격수', label: '유격수 (SS)' },
    { value: '좌익수', label: '좌익수 (LF)' },
    { value: '중견수', label: '중견수 (CF)' },
    { value: '우익수', label: '우익수 (RF)' },
    { value: '지명타자', label: '지명타자 (DH)' }
  ];

  // API 헬퍼 함수
  const apiRead = async (range) => {
    try {
      const response = await fetch(`${API_URL}?range=${encodeURIComponent(range)}`);
      const data = await response.json();
      if (data.success) {
        return data.data.values || [];
      }
      throw new Error(data.error || 'Failed to read data');
    } catch (error) {
      console.error('Read error:', error);
      return [];
    }
  };

  const apiWrite = async (range, values) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'write', range, values })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to write data');
      }
      return true;
    } catch (error) {
      console.error('Write error:', error);
      alert('저장 실패: ' + error.message);
      return false;
    }
  };

  // 전체 데이터 로드
  const loadAllData = async () => {
    await loadPlayers();
    await loadBatterStats();
    await loadPitcherStats();
    await loadGames();
  };

  // 선수 데이터 로드
  const loadPlayers = async () => {
    try {
      const data = await apiRead('선수명단!A2:F');
      if (data) {
        const playerData = data.map((row, idx) => ({
          id: idx + 1,
          name: row[0] || '',
          number: row[1] || '',
          position1: row[2] || '',
          position2: row[3] || '',
          position3: row[4] || '',
          position4: row[5] || ''
        }));
        setPlayers(playerData);
      }
    } catch (error) {
      console.error('선수 로드 오류:', error);
    }
  };

  // 타자 성적 로드
  const loadBatterStats = async () => {
    try {
      const data = await apiRead('타자성적!A2:Z');
      if (data) {
        const stats = data.map((row, idx) => ({
          id: idx + 1,
          name: row[0] || '',
          avg: parseFloat(row[1]) || 0,
          games: parseInt(row[2]) || 0,
          pa: parseInt(row[3]) || 0,
          ab: parseInt(row[4]) || 0,
          runs: parseInt(row[5]) || 0,
          hits: parseInt(row[6]) || 0,
          singles: parseInt(row[7]) || 0,
          doubles: parseInt(row[8]) || 0,
          triples: parseInt(row[9]) || 0,
          hr: parseInt(row[10]) || 0,
          tb: parseInt(row[11]) || 0,
          rbi: parseInt(row[12]) || 0,
          sb: parseInt(row[13]) || 0,
          cs: parseInt(row[14]) || 0,
          sh: parseInt(row[15]) || 0,
          sf: parseInt(row[16]) || 0,
          bb: parseInt(row[17]) || 0,
          ibb: parseInt(row[18]) || 0,
          hbp: parseInt(row[19]) || 0,
          so: parseInt(row[20]) || 0,
          gdp: parseInt(row[21]) || 0,
          slg: parseFloat(row[22]) || 0,
          obp: parseFloat(row[23]) || 0,
          sbPct: parseFloat(row[24]) || 0,
          multiHit: parseInt(row[25]) || 0,
          ops: parseFloat(row[26]) || 0
        }));
        setBatterStats(stats);
      }
    } catch (error) {
      console.error('타자 성적 로드 오류:', error);
    }
  };

  // 투수 성적 로드
  const loadPitcherStats = async () => {
    try {
      const data = await apiRead('투수성적!A2:Z');
      if (data) {
        const stats = data.map((row, idx) => ({
          id: idx + 1,
          name: row[0] || '',
          era: parseFloat(row[1]) || 0,
          games: parseInt(row[2]) || 0,
          wins: parseInt(row[3]) || 0,
          losses: parseInt(row[4]) || 0,
          saves: parseInt(row[5]) || 0,
          holds: parseInt(row[6]) || 0,
          winPct: parseFloat(row[7]) || 0,
          batters: parseInt(row[8]) || 0,
          ab: parseInt(row[9]) || 0,
          pitches: parseInt(row[10]) || 0,
          ip: parseFloat(row[11]) || 0,
          hits: parseInt(row[12]) || 0,
          hr: parseInt(row[13]) || 0,
          sh: parseInt(row[14]) || 0,
          sf: parseInt(row[15]) || 0,
          bb: parseInt(row[16]) || 0,
          ibb: parseInt(row[17]) || 0,
          hbp: parseInt(row[18]) || 0,
          so: parseInt(row[19]) || 0,
          wp: parseInt(row[20]) || 0,
          bk: parseInt(row[21]) || 0,
          runs: parseInt(row[22]) || 0,
          er: parseInt(row[23]) || 0,
          whip: parseFloat(row[24]) || 0
        }));
        setPitcherStats(stats);
      }
    } catch (error) {
      console.error('투수 성적 로드 오류:', error);
    }
  };

  // 경기 기록 로드
  const loadGames = async () => {
    try {
      const data = await apiRead('경기기록!A2:J');
      if (data) {
        const gameData = data.map((row, idx) => ({
          id: idx + 1,
          date: row[0] || '',
          opponent: row[1] || '',
          homeAway: row[2] || '',
          score: row[3] || '',
          result: row[4] || '',
          pitcher: row[5] || '',
          notes: row[6] || ''
        }));
        setGames(gameData);
      }
    } catch (error) {
      console.error('경기 기록 로드 오류:', error);
    }
  };

  // 초기 연결 및 데이터 로드
  useEffect(() => {
    const initConnection = async () => {
      setIsLoading(true);
      try {
        await loadAllData();
        setIsConnected(true);
      } catch (error) {
        console.error('Connection error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initConnection();
  }, []);

  // 스프레드시트 초기 설정
  const setupSpreadsheet = async () => {
    if (!confirm('스프레드시트에 필요한 시트와 헤더를 자동으로 생성하시겠습니까?')) {
      return;
    }

    try {
      // 선수명단 헤더
      await apiWrite('선수명단!A1:F1', [['이름', '번호', '포지션1', '포지션2', '포지션3', '포지션4']]);
      
      // 타자성적 헤더
      await apiWrite('타자성적!A1:AA1', [[
        '이름', '타율', '경기수', '타석', '타수', '득점', '총안타', '1루타', '2루타', '3루타', 
        '홈런', '루타', '타점', '도루', '도실', '희타', '희비', '볼넷', '고의4구', '사구', 
        '삼진', '병살', '장타율', '출루율', '도루성공률', '멀티히트', 'OPS'
      ]]);
      
      // 투수성적 헤더
      await apiWrite('투수성적!A1:Y1', [[
        '이름', '방어율', '경기수', '승', '패', '세이브', '홀드', '승률', '타자', '타수', 
        '투구수', '이닝', '피안타', '피홈런', '희타', '희비', '볼넷', '고의4구', '사구', 
        '탈삼진', '폭투', '보크', '실점', '자책점', 'WHIP'
      ]]);
      
      // 경기기록 헤더
      await apiWrite('경기기록!A1:G1', [['날짜', '상대팀', '홈/원정', '스코어', '경기결과', '선발투수', '비고']]);
      
      alert('스프레드시트 설정 완료! 이제 데이터를 입력할 수 있습니다.');
      await loadAllData();
    } catch (error) {
      alert('설정 실패: ' + error.message + '\n\n수동으로 시트를 만들어주세요.');
    }
  };

  // 구글 시트에 데이터 쓰기
  const writeToSheet = async (range, values) => {
    const success = await apiWrite(range, values);
    if (success) {
      alert('데이터 저장 완료!');
      await loadAllData();
    }
  };

  // 선수 추가
  const addPlayer = () => {
    const newPlayer = {
      id: players.length + 1,
      name: '',
      number: '',
      position1: '',
      position2: '',
      position3: '',
      position4: ''
    };
    setPlayers([...players, newPlayer]);
  };

  // 선수 업데이트
  const updatePlayer = (id, field, value) => {
    setPlayers(players.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // 선수 저장
  const savePlayers = async () => {
    const values = players.map(p => [
      p.name, p.number, p.position1, p.position2, p.position3, p.position4
    ]);
    await writeToSheet('선수명단!A2:F', values);
  };

  // 경기 추가
  const addGame = () => {
    const newGame = {
      id: games.length + 1,
      date: new Date().toISOString().split('T')[0],
      opponent: '',
      homeAway: '홈',
      score: '',
      result: '',
      pitcher: '',
      notes: ''
    };
    setGames([...games, newGame]);
  };

  // 경기 업데이트
  const updateGame = (id, field, value) => {
    setGames(games.map(g => 
      g.id === id ? { ...g, [field]: value } : g
    ));
  };

  // 경기 저장
  const saveGames = async () => {
    const values = games.map(g => [
      g.date, g.opponent, g.homeAway, g.score, g.result, g.pitcher, g.notes
    ]);
    await writeToSheet('경기기록!A2:G', values);
  };

  // 경기 삭제
  const deleteGame = (id) => {
    setGames(games.filter(g => g.id !== id));
  };

  // 라인업에 선수 추가
  const addToLineup = (index, player) => {
    const newLineup = [...lineup];
    newLineup[index] = { 
      player: player, 
      position: player ? player.position1 : '' 
    };
    setLineup(newLineup);
  };

  // 라인업 포지션 변경
  const updateLineupPosition = (index, position) => {
    const newLineup = [...lineup];
    newLineup[index] = { ...newLineup[index], position };
    setLineup(newLineup);
  };

  // 대기선수에 추가
  const addToBench = (player) => {
    if (!bench.find(p => p.id === player.id)) {
      setBench([...bench, player]);
    }
  };

  // 대기선수에서 제거
  const removeFromBench = (playerId) => {
    setBench(bench.filter(p => p.id !== playerId));
  };

  // 라인업 초기화
  const clearLineup = () => {
    setLineup(Array(10).fill(null).map(() => ({ player: null, position: '' })));
  };

  // 라인업 PNG로 저장
  const saveLineupAsImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 1200;
    
    // 배경
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 제목
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('선발 라인업', canvas.width / 2, 60);
    
    // 라인업 그리기
    lineup.forEach((item, idx) => {
      const y = 120 + idx * 85;
      
      // 배경 박스
      ctx.fillStyle = '#334155';
      ctx.fillRect(50, y, 700, 70);
      
      // 타순
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${idx + 1}`, 80, y + 45);
      
      if (item.player) {
        // 선수 정보
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(item.player.name, 150, y + 35);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '18px sans-serif';
        ctx.fillText(`#${item.player.number} | ${item.position || item.player.position1}`, 150, y + 58);
      } else {
        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 20px sans-serif';
        ctx.fillText('선수 미배정', 150, y + 45);
      }
    });
    
    // 하단 정보
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    const date = new Date().toLocaleDateString('ko-KR');
    ctx.fillText(`생성일: ${date}`, canvas.width / 2, 1140);
    
    // 다운로드
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lineup-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Target className="text-blue-400" />
            야구팀 관리 시스템
          </h1>
          
          {/* 구글 시트 연결 상태 */}
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-400 font-medium">데이터 로딩 중...</span>
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">구글 시트 연결됨</span>
              <button
                onClick={loadAllData}
                className="px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition"
              >
                새로고침
              </button>
              <button
                onClick={setupSpreadsheet}
                className="px-4 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition"
              >
                스프레드시트 초기 설정
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-400 font-medium">연결 실패 - 스프레드시트 설정이 필요합니다</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={setupSpreadsheet}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-medium transition"
                >
                  자동 설정 시작
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition"
                >
                  다시 시도
                </button>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                스프레드시트에 필요한 시트(선수명단, 타자성적, 투수성적, 경기기록)가 없으면 자동 설정을 클릭하세요.
              </p>
            </div>
          )}
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-slate-800 rounded-lg mb-6">
          <div className="flex gap-2 p-2">
            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition ${
                activeTab === 'roster' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <Users size={18} />
              선수 명단
            </button>
            <button
              onClick={() => setActiveTab('batter')}
              className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition ${
                activeTab === 'batter' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <TrendingUp size={18} />
              타자 성적
            </button>
            <button
              onClick={() => setActiveTab('pitcher')}
              className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition ${
                activeTab === 'pitcher' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <Target size={18} />
              투수 성적
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition ${
                activeTab === 'games' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <Calendar size={18} />
              경기 기록
            </button>
            <button
              onClick={() => setActiveTab('lineup')}
              className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition ${
                activeTab === 'lineup' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <Clipboard size={18} />
              라인업 작성
            </button>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="bg-slate-800 rounded-lg p-6">
          {/* 선수 명단 */}
          {activeTab === 'roster' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">선수 명단</h2>
                <div className="flex gap-2">
                  <button
                    onClick={addPlayer}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium"
                  >
                    선수 추가
                  </button>
                  <button
                    onClick={savePlayers}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium flex items-center gap-2"
                  >
                    <Upload size={18} />
                    저장
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-4 py-3 text-left">이름</th>
                      <th className="px-4 py-3 text-left">번호</th>
                      <th className="px-4 py-3 text-left">주포지션</th>
                      <th className="px-4 py-3 text-left">포지션2</th>
                      <th className="px-4 py-3 text-left">포지션3</th>
                      <th className="px-4 py-3 text-left">포지션4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr key={player.id} className="border-b border-slate-700">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                            placeholder="선수 이름"
                            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={player.number}
                            onChange={(e) => updatePlayer(player.id, 'number', e.target.value)}
                            placeholder="번호"
                            className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={player.position1}
                            onChange={(e) => updatePlayer(player.id, 'position1', e.target.value)}
                            className="w-32 px-2 py-1 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-blue-500"
                          >
                            {positionOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={player.position2}
                            onChange={(e) => updatePlayer(player.id, 'position2', e.target.value)}
                            className="w-32 px-2 py-1 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-blue-500"
                          >
                            {positionOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={player.position3}
                            onChange={(e) => updatePlayer(player.id, 'position3', e.target.value)}
                            className="w-32 px-2 py-1 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-blue-500"
                          >
                            {positionOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={player.position4}
                            onChange={(e) => updatePlayer(player.id, 'position4', e.target.value)}
                            className="w-32 px-2 py-1 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-blue-500"
                          >
                            {positionOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 타자 성적 */}
          {activeTab === 'batter' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">타자 성적</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-3 py-2 text-left sticky left-0 bg-slate-800">이름</th>
                      <th className="px-3 py-2 text-right">타율</th>
                      <th className="px-3 py-2 text-right">경기</th>
                      <th className="px-3 py-2 text-right">타석</th>
                      <th className="px-3 py-2 text-right">타수</th>
                      <th className="px-3 py-2 text-right">득점</th>
                      <th className="px-3 py-2 text-right">안타</th>
                      <th className="px-3 py-2 text-right">2루타</th>
                      <th className="px-3 py-2 text-right">3루타</th>
                      <th className="px-3 py-2 text-right">홈런</th>
                      <th className="px-3 py-2 text-right">타점</th>
                      <th className="px-3 py-2 text-right">도루</th>
                      <th className="px-3 py-2 text-right">삼진</th>
                      <th className="px-3 py-2 text-right">장타율</th>
                      <th className="px-3 py-2 text-right">출루율</th>
                      <th className="px-3 py-2 text-right">OPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batterStats.map((stat) => (
                      <tr key={stat.id} className="border-b border-slate-700 hover:bg-slate-750">
                        <td className="px-3 py-2 font-medium sticky left-0 bg-slate-800">{stat.name}</td>
                        <td className="px-3 py-2 text-right">{stat.avg.toFixed(3)}</td>
                        <td className="px-3 py-2 text-right">{stat.games}</td>
                        <td className="px-3 py-2 text-right">{stat.pa}</td>
                        <td className="px-3 py-2 text-right">{stat.ab}</td>
                        <td className="px-3 py-2 text-right">{stat.runs}</td>
                        <td className="px-3 py-2 text-right">{stat.hits}</td>
                        <td className="px-3 py-2 text-right">{stat.doubles}</td>
                        <td className="px-3 py-2 text-right">{stat.triples}</td>
                        <td className="px-3 py-2 text-right">{stat.hr}</td>
                        <td className="px-3 py-2 text-right">{stat.rbi}</td>
                        <td className="px-3 py-2 text-right">{stat.sb}</td>
                        <td className="px-3 py-2 text-right">{stat.so}</td>
                        <td className="px-3 py-2 text-right">{stat.slg.toFixed(3)}</td>
                        <td className="px-3 py-2 text-right">{stat.obp.toFixed(3)}</td>
                        <td className="px-3 py-2 text-right font-bold text-blue-400">{stat.ops.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 투수 성적 */}
          {activeTab === 'pitcher' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">투수 성적</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-3 py-2 text-left sticky left-0 bg-slate-800">이름</th>
                      <th className="px-3 py-2 text-right">방어율</th>
                      <th className="px-3 py-2 text-right">경기</th>
                      <th className="px-3 py-2 text-right">승</th>
                      <th className="px-3 py-2 text-right">패</th>
                      <th className="px-3 py-2 text-right">세이브</th>
                      <th className="px-3 py-2 text-right">홀드</th>
                      <th className="px-3 py-2 text-right">이닝</th>
                      <th className="px-3 py-2 text-right">피안타</th>
                      <th className="px-3 py-2 text-right">탈삼진</th>
                      <th className="px-3 py-2 text-right">볼넷</th>
                      <th className="px-3 py-2 text-right">실점</th>
                      <th className="px-3 py-2 text-right">자책</th>
                      <th className="px-3 py-2 text-right">WHIP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pitcherStats.map((stat) => (
                      <tr key={stat.id} className="border-b border-slate-700 hover:bg-slate-750">
                        <td className="px-3 py-2 font-medium sticky left-0 bg-slate-800">{stat.name}</td>
                        <td className="px-3 py-2 text-right font-bold text-blue-400">{stat.era.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">{stat.games}</td>
                        <td className="px-3 py-2 text-right">{stat.wins}</td>
                        <td className="px-3 py-2 text-right">{stat.losses}</td>
                        <td className="px-3 py-2 text-right">{stat.saves}</td>
                        <td className="px-3 py-2 text-right">{stat.holds}</td>
                        <td className="px-3 py-2 text-right">{stat.ip.toFixed(1)}</td>
                        <td className="px-3 py-2 text-right">{stat.hits}</td>
                        <td className="px-3 py-2 text-right">{stat.so}</td>
                        <td className="px-3 py-2 text-right">{stat.bb}</td>
                        <td className="px-3 py-2 text-right">{stat.runs}</td>
                        <td className="px-3 py-2 text-right">{stat.er}</td>
                        <td className="px-3 py-2 text-right">{stat.whip.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 경기 기록 */}
          {activeTab === 'games' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">경기 기록</h2>
                <div className="flex gap-2">
                  <button
                    onClick={addGame}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium"
                  >
                    경기 추가
                  </button>
                  <button
                    onClick={saveGames}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium flex items-center gap-2"
                  >
                    <Upload size={18} />
                    저장
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {games.map((game) => (
                  <div key={game.id} className="bg-slate-700 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">날짜</label>
                        <input
                          type="date"
                          value={game.date}
                          onChange={(e) => updateGame(game.id, 'date', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">홈/원정</label>
                        <select
                          value={game.homeAway}
                          onChange={(e) => updateGame(game.id, 'homeAway', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:border-blue-500"
                        >
                          <option value="홈">홈</option>
                          <option value="원정">원정</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">상대팀</label>
                        <input
                          type="text"
                          value={game.opponent}
                          onChange={(e) => updateGame(game.id, 'opponent', e.target.value)}
                          placeholder="상대팀 입력"
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">스코어</label>
                        <input
                          type="text"
                          value={game.score}
                          onChange={(e) => updateGame(game.id, 'score', e.target.value)}
                          placeholder="5-3"
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">경기 결과</label>
                        <select
                          value={game.result}
                          onChange={(e) => updateGame(game.id, 'result', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:border-blue-500"
                        >
                          <option value="">선택</option>
                          <option value="승">승</option>
                          <option value="패">패</option>
                          <option value="무">무</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">선발투수</label>
                        <input
                          type="text"
                          value={game.pitcher}
                          onChange={(e) => updateGame(game.id, 'pitcher', e.target.value)}
                          placeholder="선발투수 이름"
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          onClick={() => deleteGame(game.id)}
                          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">비고</label>
                      <textarea
                        value={game.notes}
                        onChange={(e) => updateGame(game.id, 'notes', e.target.value)}
                        placeholder="경기 메모 (선택사항)"
                        rows="2"
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                    
                    {/* 미리보기 */}
                    {game.opponent && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400">{game.date}</span>
                          <span className="px-2 py-0.5 bg-slate-600 rounded text-xs">{game.homeAway}</span>
                          {game.result && (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              game.result === '승' ? 'bg-green-600' : 
                              game.result === '패' ? 'bg-red-600' : 'bg-gray-600'
                            }`}>
                              {game.result}
                            </span>
                          )}
                          <span className="font-bold">vs {game.opponent}</span>
                          {game.score && (
                            <span className="text-blue-400 font-bold">{game.score}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {games.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    경기 기록이 없습니다. '경기 추가' 버튼을 눌러 추가해주세요.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 라인업 작성 */}
          {activeTab === 'lineup' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">선발 라인업 작성</h2>
                <div className="flex gap-2">
                  <button
                    onClick={clearLineup}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded font-medium"
                  >
                    초기화
                  </button>
                  <button
                    onClick={saveLineupAsImage}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium flex items-center gap-2"
                  >
                    <Download size={18} />
                    PNG 저장
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* 선수 목록 */}
                <div className="xl:col-span-1">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Users size={20} />
                    선수 목록
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto bg-slate-700 p-3 rounded-lg">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className="bg-slate-600 p-3 rounded hover:bg-slate-500 cursor-move transition"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('player', JSON.stringify(player))}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold">{player.name}</div>
                            <div className="text-sm text-slate-300">
                              #{player.number} | {player.position1}
                            </div>
                          </div>
                          <button
                            onClick={() => addToBench(player)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                          >
                            대기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 라인업 */}
                <div ref={lineupRef} className="xl:col-span-1">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Clipboard size={20} />
                    선발 라인업 (1-10번)
                  </h3>
                  <div className="space-y-2">
                    {lineup.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-700 p-3 rounded min-h-24 border-2 border-slate-600 hover:border-slate-500 transition"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const playerData = JSON.parse(e.dataTransfer.getData('player'));
                          addToLineup(idx, playerData);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl font-bold text-blue-400 w-8 pt-1">{idx + 1}</div>
                          
                          {item.player ? (
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-bold text-lg">{item.player.name}</div>
                                  <div className="text-sm text-slate-400">#{item.player.number}</div>
                                </div>
                                <button
                                  onClick={() => addToLineup(idx, null)}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                                >
                                  제거
                                </button>
                              </div>
                              
                              <div className="flex gap-2 items-center">
                                <label className="text-xs text-slate-400">포지션:</label>
                                <select
                                  value={item.position}
                                  onChange={(e) => updateLineupPosition(idx, e.target.value)}
                                  className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-sm focus:outline-none focus:border-blue-500"
                                >
                                  {positionOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 text-slate-500 italic py-2">
                              선수를 드래그하여 배치하세요
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 대기선수 */}
                <div className="xl:col-span-1">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Users size={20} />
                    대기선수 명단
                  </h3>
                  <div className="space-y-2 bg-slate-700 p-3 rounded-lg min-h-96">
                    {bench.length > 0 ? (
                      bench.map((player) => (
                        <div
                          key={player.id}
                          className="bg-slate-600 p-3 rounded"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold">{player.name}</div>
                              <div className="text-sm text-slate-300">
                                #{player.number} | {player.position1}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromBench(player.id)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                            >
                              제거
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        대기선수를 추가하려면<br />
                        선수 목록에서 '대기' 버튼을 클릭하세요
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 라인업 요약 */}
              <div className="mt-6 bg-slate-700 p-4 rounded-lg">
                <h4 className="font-bold mb-3 text-lg">라인업 요약</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div className="bg-slate-600 p-3 rounded">
                    <div className="text-slate-400 mb-1">배치된 선수</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {lineup.filter(item => item.player).length}/10
                    </div>
                  </div>
                  <div className="bg-slate-600 p-3 rounded">
                    <div className="text-slate-400 mb-1">대기선수</div>
                    <div className="text-2xl font-bold text-green-400">
                      {bench.length}
                    </div>
                  </div>
                  <div className="bg-slate-600 p-3 rounded">
                    <div className="text-slate-400 mb-1">포지션 설정</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {lineup.filter(item => item.player && item.position).length}/{lineup.filter(item => item.player).length}
                    </div>
                  </div>
                  <div className="bg-slate-600 p-3 rounded">
                    <div className="text-slate-400 mb-1">전체 선수</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {players.length}
                    </div>
                  </div>
                  <div className="bg-slate-600 p-3 rounded">
                    <div className="text-slate-400 mb-1">완성도</div>
                    <div className="text-2xl font-bold text-pink-400">
                      {lineup.filter(item => item.player).length === 10 ? '완료' : '진행중'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseballTeamManager;
