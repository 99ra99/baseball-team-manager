import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, Calendar, Clipboard, LogOut, Shield, Eye, UserCog } from 'lucide-react';
import Login from './components/Login';
import UserManagement from './components/UserManagement';

function App() {
  // 인증 상태
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 기존 상태
  const [activeTab, setActiveTab] = useState('roster');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [batterStats, setBatterStats] = useState([]);
  const [pitcherStats, setPitcherStats] = useState([]);
  const [games, setGames] = useState([]);
  const [lineup, setLineup] = useState(Array(10).fill(null).map(() => ({ player: null, position: '' })));
  const [bench, setBench] = useState([]);

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

  // 로그인 체크 (7일간 유지)
  useEffect(() => {
    const checkAuth = () => {
      const authData = localStorage.getItem('baseball_auth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          if (Date.now() - parsed.timestamp < sevenDays) {
            setUser(parsed);
          } else {
            localStorage.removeItem('baseball_auth');
          }
        } catch (error) {
          localStorage.removeItem('baseball_auth');
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // 로그인 처리
  const handleLogin = (loginData) => {
    setUser(loginData);
  };

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('baseball_auth');
    setUser(null);
    setActiveTab('roster');
  };

  // 권한 체크
  const isMaster = user?.role === '마스터';

  // API 함수들
  const apiRead = async (range) => {
    try {
      const response = await fetch(`/api/sheets?range=${encodeURIComponent(range)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      return result.data || {};
    } catch (error) {
      console.error('API Read Error:', error);
      throw error;
    }
  };

  const apiWrite = async (range, values) => {
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'write', range, values })
      });
      return await response.json();
    } catch (error) {
      console.error('API Write Error:', error);
      throw error;
    }
  };

  // 데이터 로딩
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [playersData, batterData, pitcherData, gamesData] = await Promise.all([
        apiRead('선수명단!A2:F'),
        apiRead('타자성적!A2:AB'),
        apiRead('투수성적!A2:AA'),
        apiRead('경기기록!A2:G')
      ]);

      if (playersData.values) {
        setPlayers(playersData.values.map((row, idx) => ({
          id: idx,
          name: row[0] || '',
          number: row[1] || '',
          position1: row[2] || '',
          position2: row[3] || '',
          position3: row[4] || '',
          position4: row[5] || ''
        })));
        setBench(playersData.values.map((row) => row[0] || ''));
      }

      if (batterData.values) {
        setBatterStats(batterData.values.map((row, idx) => ({
          id: idx,
          name: row[0] || '',
          avg: row[1] || '',
          games: row[2] || '',
          pa: row[3] || '',
          ab: row[4] || '',
          r: row[5] || '',
          h: row[6] || '',
          single: row[7] || '',
          double: row[8] || '',
          triple: row[9] || '',
          hr: row[10] || '',
          tb: row[11] || '',
          rbi: row[12] || '',
          sb: row[13] || '',
          cs: row[14] || '',
          sh: row[15] || '',
          sf: row[16] || '',
          bb: row[17] || '',
          ibb: row[18] || '',
          hbp: row[19] || '',
          so: row[20] || '',
          gdp: row[21] || '',
          slg: row[22] || '',
          obp: row[23] || '',
          sbPct: row[24] || '',
          multiHit: row[25] || '',
          ops: row[26] || '',
          bbk: row[27] || '',
          xbhh: row[28] || ''
        })));
      }

      if (pitcherData.values) {
        setPitcherStats(pitcherData.values.map((row, idx) => ({
          id: idx,
          name: row[0] || '',
          era: row[1] || '',
          games: row[2] || '',
          w: row[3] || '',
          l: row[4] || '',
          sv: row[5] || '',
          hld: row[6] || '',
          wpct: row[7] || '',
          bf: row[8] || '',
          ab: row[9] || '',
          np: row[10] || '',
          ip: row[11] || '',
          h: row[12] || '',
          hr: row[13] || '',
          sh: row[14] || '',
          sf: row[15] || '',
          bb: row[16] || '',
          ibb: row[17] || '',
          hbp: row[18] || '',
          so: row[19] || '',
          wp: row[20] || '',
          bk: row[21] || '',
          r: row[22] || '',
          er: row[23] || '',
          whip: row[24] || '',
          oavg: row[25] || '',
          kper9: row[26] || ''
        })));
      }

      if (gamesData.values) {
        setGames(gamesData.values.map((row, idx) => ({
          id: idx,
          date: row[0] || '',
          opponent: row[1] || '',
          homeAway: row[2] || '',
          score: row[3] || '',
          result: row[4] || '',
          starter: row[5] || '',
          note: row[6] || ''
        })));
      }

      setIsConnected(true);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 스프레드시트 자동 설정
  const setupSpreadsheet = async () => {
    if (!isMaster) {
      alert('마스터 권한이 필요합니다.');
      return;
    }

    if (!confirm('스프레드시트를 자동으로 설정하시겠습니까?\n기존 데이터가 있다면 헤더만 추가됩니다.')) {
      return;
    }

    try {
      const headers = {
        '선수명단': [['이름', '번호', '포지션1', '포지션2', '포지션3', '포지션4']],
        '타자성적': [['이름', '타율', '경기수', '타석', '타수', '득점', '총안타', '1루타', '2루타', '3루타', '홈런', '루타', '타점', '도루', '도실', '희타', '희비', '볼넷', '고의4구', '사구', '삼진', '병살', '장타율', '출루율', '도루성공률', '멀티히트', 'OPS', 'BB/K', '장타/안타']],
        '투수성적': [['이름', '방어율', '경기수', '승', '패', '세이브', '홀드', '승률', '타자', '타수', '투구수', '이닝', '피안타', '피홈런', '희타', '희비', '볼넷', '고의4구', '사구', '탈삼진', '폭투', '보크', '실점', '자책점', 'WHIP', '피안타율', '탈삼진율']],
        '경기기록': [['날짜', '상대팀', '홈/원정', '스코어', '경기결과', '선발투수', '비고']],
        '사용자': [['아이디', '비밀번호', '이름', '권한']]
      };

      for (const [sheetName, headerRow] of Object.entries(headers)) {
        await apiWrite(`${sheetName}!A1:Z1`, headerRow);
      }

      alert('스프레드시트 설정이 완료되었습니다!');
      loadAllData();
    } catch (error) {
      console.error('설정 실패:', error);
      alert('스프레드시트 설정 중 오류가 발생했습니다.');
    }
  };

  // 선수 저장
  const savePlayers = async () => {
    if (!isMaster) {
      alert('마스터 권한이 필요합니다.');
      return;
    }

    try {
      const values = players.map(p => [
        p.name, p.number, p.position1, p.position2, p.position3, p.position4
      ]);
      await apiWrite('선수명단!A2:F', values);
      alert('선수 명단이 저장되었습니다.');
      loadAllData();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 경기 기록 저장
  const saveGames = async () => {
    if (!isMaster) {
      alert('마스터 권한이 필요합니다.');
      return;
    }

    try {
      const values = games.map(g => [
        g.date, g.opponent, g.homeAway, g.score, g.result, g.starter, g.note
      ]);
      await apiWrite('경기기록!A2:G', values);
      alert('경기 기록이 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 라인업 PNG 저장
  const saveLineupAsImage = () => {
    const lineupDiv = document.getElementById('lineup-display');
    if (!lineupDiv) return;

    import('html2canvas').then(html2canvas => {
      html2canvas.default(lineupDiv, {
        backgroundColor: '#ffffff',
        scale: 2
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `lineup_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    });
  };

  // 로그인 체크 중
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-600">인증 확인 중...</div>
      </div>
    );
  }

  // 로그인 안 됨
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // 메인 UI (로그인 후)
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">지존리틀베이스볼클럽</h1>
              <p className="text-sm text-gray-500 mt-1">팀 관리 시스템</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                {isMaster ? (
                  <Shield className="w-4 h-4 text-purple-600" />
                ) : (
                  <Eye className="w-4 h-4 text-blue-600" />
                )}
                <span className="text-sm font-medium">{user.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  isMaster ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 상태 표시 */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isLoading ? '데이터 로딩 중...' : isConnected ? '구글 시트 연결됨' : '연결 실패'}
          </span>
          {isMaster && (
            <button
              onClick={setupSpreadsheet}
              className="ml-auto text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              자동 설정
            </button>
          )}
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm p-2 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              activeTab === 'roster' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            선수 명단
          </button>
          <button
            onClick={() => setActiveTab('batter')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              activeTab === 'batter' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            타자 성적
          </button>
          <button
            onClick={() => setActiveTab('pitcher')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              activeTab === 'pitcher' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            투수 성적
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              activeTab === 'games' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            경기 기록
          </button>
          <button
            onClick={() => setActiveTab('lineup')}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              activeTab === 'lineup' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clipboard className="w-4 h-4" />
            라인업
          </button>
          {isMaster && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserCog className="w-4 h-4" />
              사용자 관리
            </button>
          )}
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* 선수 명단 탭 */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">선수 명단</h2>
              {isMaster && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setPlayers([...players, { id: Date.now(), name: '', number: '', position1: '', position2: '', position3: '', position4: '' }])}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    선수 추가
                  </button>
                  <button
                    onClick={savePlayers}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    저장
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">번호</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">포지션1</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">포지션2</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">포지션3</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">포지션4</th>
                    {isMaster && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {players.map((player, idx) => (
                    <tr key={player.id}>
                      <td className="px-4 py-3">
                        {isMaster ? (
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => {
                              const newPlayers = [...players];
                              newPlayers[idx].name = e.target.value;
                              setPlayers(newPlayers);
                            }}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <span>{player.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isMaster ? (
                          <input
                            type="text"
                            value={player.number}
                            onChange={(e) => {
                              const newPlayers = [...players];
                              newPlayers[idx].number = e.target.value;
                              setPlayers(newPlayers);
                            }}
                            className="w-20 px-2 py-1 border rounded"
                          />
                        ) : (
                          <span>{player.number}</span>
                        )}
                      </td>
                      {['position1', 'position2', 'position3', 'position4'].map((pos) => (
                        <td key={pos} className="px-4 py-3">
                          {isMaster ? (
                            <select
                              value={player[pos]}
                              onChange={(e) => {
                                const newPlayers = [...players];
                                newPlayers[idx][pos] = e.target.value;
                                setPlayers(newPlayers);
                              }}
                              className="w-full px-2 py-1 border rounded"
                            >
                              {positionOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : (
                            <span>{player[pos] || '-'}</span>
                          )}
                        </td>
                      ))}
                      {isMaster && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setPlayers(players.filter((_, i) => i !== idx))}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            삭제
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 타자 성적 탭 */}
        {activeTab === 'batter' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">타자 성적</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">이름</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">타율</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">OPS</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">경기</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">안타</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">홈런</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">타점</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">장타율</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">출루율</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batterStats.map((stat) => (
                    <tr key={stat.id}>
                      <td className="px-3 py-2 font-medium">{stat.name}</td>
                      <td className="px-3 py-2">{stat.avg}</td>
                      <td className="px-3 py-2">{stat.ops}</td>
                      <td className="px-3 py-2">{stat.games}</td>
                      <td className="px-3 py-2">{stat.h}</td>
                      <td className="px-3 py-2">{stat.hr}</td>
                      <td className="px-3 py-2">{stat.rbi}</td>
                      <td className="px-3 py-2">{stat.slg}</td>
                      <td className="px-3 py-2">{stat.obp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 투수 성적 탭 */}
        {activeTab === 'pitcher' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">투수 성적</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">이름</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">방어율</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">WHIP</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">경기</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">승</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">패</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">세이브</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">이닝</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">탈삼진</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pitcherStats.map((stat) => (
                    <tr key={stat.id}>
                      <td className="px-3 py-2 font-medium">{stat.name}</td>
                      <td className="px-3 py-2">{stat.era}</td>
                      <td className="px-3 py-2">{stat.whip}</td>
                      <td className="px-3 py-2">{stat.games}</td>
                      <td className="px-3 py-2">{stat.w}</td>
                      <td className="px-3 py-2">{stat.l}</td>
                      <td className="px-3 py-2">{stat.sv}</td>
                      <td className="px-3 py-2">{stat.ip}</td>
                      <td className="px-3 py-2">{stat.so}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 경기 기록 탭 */}
        {activeTab === 'games' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">경기 기록</h2>
              {isMaster && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setGames([...games, { id: Date.now(), date: '', opponent: '', homeAway: '홈', score: '', result: '승', starter: '', note: '' }])}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    경기 추가
                  </button>
                  <button
                    onClick={saveGames}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    저장
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">날짜</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">상대팀</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">홈/원정</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">스코어</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">결과</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">선발투수</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">비고</th>
                    {isMaster && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">작업</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {games.map((game, idx) => (
                    <tr key={game.id}>
                      <td className="px-4 py-3">
                        {isMaster ? (
                          <input
                            type="date"
                            value={game.date}
                            onChange={(e) => {
                              const newGames = [...games];
                              newGames[idx].date = e.target.value;
                              setGames(newGames);
                            }}
                            className="px-2 py-1 border rounded"
                          />
                        ) : (
                          <span>{game.date}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isMaster ? (
                          <input
                            type="text"
                            value={game.opponent}
                            onChange={(e) => {
                              const newGames = [...games];
                              newGames[idx].opponent = e.target.value;
                              setGames(newGames);
                            }}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <span>{game.opponent}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isMaster ? (
                          <select
                            value={game.homeAway}
                            onChange={(e) => {
                              const newGames = [...games];
                              newGames[idx].homeAway = e.target.value;
                              setGames(newGames);
                            }}
                            className="px-2 py-1 border rounded"
                          >
                            <option value="홈">홈</option>
                            <option value="원정">원정</option>
                          </select>
                        ) : (
                          <span>{game.homeAway}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isMaster ? (
                          <input
                            type="text"
                            value={game.score}
                            onChange={(e) => {
                              const newGames = [...games];
                              newGames[idx].score = e.target.value;
                              setGames(newGames);
                            }}
                            className="w-24 px-2 py-1 border rounded"
                            placeholder="5-3"
                          />
                        ) : (
                          <span>{game.score}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isMaster ? (
                          <select
                            value={game.result}
                            onChange={(e) => {
                              const newGames = [...games];
                              newGames[idx].result = e.target.value;
                              setGames(newGames);
                            }}
                            className="px-2 py-1 border rounded"
                          >
                            <option value="승">승</option>
                            <option value="패">패</option>
                            <option value="무">무</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded ${
                            game.result === '승' ? 'bg-blue-100 text-blue-800' :
                            game.result === '패' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {game.result}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isMaster ? (
                          <input
                            type="text"
                            value={game.starter}
                            onChange={(e) => {
                              const newGames = [...games];
                              newGames[idx].starter = e.target.value;
                              setGames(newGames);
                            }}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <span>{game.starter}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isMaster ? (
                          <input
                            type="text"
                            value={game.note}
                            onChange={(e) => {
                              const newGames = [...games];
                              newGames[idx].note = e.target.value;
                              setGames(newGames);
                            }}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <span>{game.note}</span>
                        )}
                      </td>
                      {isMaster && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setGames(games.filter((_, i) => i !== idx))}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            삭제
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 라인업 탭 */}
        {activeTab === 'lineup' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">라인업 작성</h2>
              <div id="lineup-display" className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-center mb-4">지존리틀베이스볼클럽</h3>
                <div className="space-y-2">
                  {lineup.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                      <span className="font-bold text-lg w-8">{idx + 1}</span>
                      {isMaster ? (
                        <>
                          <select
                            value={item.player || ''}
                            onChange={(e) => {
                              const newLineup = [...lineup];
                              newLineup[idx].player = e.target.value;
                              setLineup(newLineup);
                            }}
                            className="flex-1 px-3 py-2 border rounded"
                          >
                            <option value="">선수 선택</option>
                            {players.map(p => (
                              <option key={p.id} value={p.name}>{p.name} (#{p.number})</option>
                            ))}
                          </select>
                          <select
                            value={item.position}
                            onChange={(e) => {
                              const newLineup = [...lineup];
                              newLineup[idx].position = e.target.value;
                              setLineup(newLineup);
                            }}
                            className="w-40 px-3 py-2 border rounded"
                          >
                            {positionOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 font-medium">{item.player || '(미정)'}</span>
                          <span className="w-40 text-gray-600">{item.position || '-'}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={saveLineupAsImage}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  PNG 저장
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">대기 선수</h3>
              <div className="flex flex-wrap gap-2">
                {bench.map((name, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 사용자 관리 탭 (마스터만) */}
        {activeTab === 'users' && isMaster && (
          <UserManagement apiRead={apiRead} apiWrite={apiWrite} />
        )}
      </div>
    </div>
  );
}

export default App;
