import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Download, Eye, EyeOff, RefreshCw } from 'lucide-react';

const PitcherStatsPivot = ({ pitcherStats, onFetchGameOne, isMaster }) => {
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    era: true,
    whip: true,
    games: true,
    w: true,
    l: true,
    sv: true,
    hld: true,
    ip: true,
    so: true,
    bb: true,
    h: true,
    hr: true,
    er: true
  });

  // 컬럼 정의
  const columns = [
    { key: 'name', label: '이름', type: 'string' },
    { key: 'era', label: '방어율', type: 'number' },
    { key: 'whip', label: 'WHIP', type: 'number' },
    { key: 'games', label: '경기', type: 'number' },
    { key: 'w', label: '승', type: 'number' },
    { key: 'l', label: '패', type: 'number' },
    { key: 'sv', label: '세이브', type: 'number' },
    { key: 'hld', label: '홀드', type: 'number' },
    { key: 'ip', label: '이닝', type: 'number' },
    { key: 'so', label: '탈삼진', type: 'number' },
    { key: 'bb', label: '볼넷', type: 'number' },
    { key: 'h', label: '피안타', type: 'number' },
    { key: 'hr', label: '피홈런', type: 'number' },
    { key: 'er', label: '자책점', type: 'number' }
  ];

  // 정렬 처리
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // 컬럼 토글
  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 필터링 및 정렬된 데이터
  const processedData = useMemo(() => {
    let filtered = pitcherStats.filter(stat => 
      stat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[sortKey] || '';
      const bVal = b[sortKey] || '';
      
      const column = columns.find(col => col.key === sortKey);
      
      if (column?.type === 'number') {
        const numA = parseFloat(aVal) || 0;
        const numB = parseFloat(bVal) || 0;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      } else {
        return sortOrder === 'asc' 
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
    });

    return filtered;
  }, [pitcherStats, sortKey, sortOrder, searchTerm]);

  // 통계 계산
  const stats = useMemo(() => {
    const numericColumns = columns.filter(col => col.type === 'number');
    const result = {};

    numericColumns.forEach(col => {
      const values = processedData
        .map(row => parseFloat(row[col.key]))
        .filter(val => !isNaN(val) && val > 0);

      if (values.length > 0) {
        result[col.key] = {
          avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(3),
          max: Math.max(...values).toFixed(3),
          min: Math.min(...values).toFixed(3),
          total: values.reduce((a, b) => a + b, 0).toFixed(0)
        };
      }
    });

    return result;
  }, [processedData]);

  // CSV 다운로드
  const downloadCSV = () => {
    const visibleCols = columns.filter(col => visibleColumns[col.key]);
    const headers = visibleCols.map(col => col.label).join(',');
    const rows = processedData.map(row => 
      visibleCols.map(col => row[col.key] || '').join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `투수성적_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* 컨트롤 패널 */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        {/* 검색 & 다운로드 */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="선수 이름 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {isMaster && onFetchGameOne && (
            <button
              onClick={() => onFetchGameOne('pitcher')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <RefreshCw className="w-4 h-4" />
              투수 데이터 가져오기
            </button>
          )}
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            CSV 다운로드
          </button>
        </div>

        {/* 컬럼 선택 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">표시할 컬럼:</h3>
          <div className="flex flex-wrap gap-2">
            {columns.map(col => (
              <button
                key={col.key}
                onClick={() => toggleColumn(col.key)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition ${
                  visibleColumns[col.key]
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {visibleColumns[col.key] ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
                {col.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">📊 통계 요약 (총 {processedData.length}명)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {columns.filter(col => col.type === 'number' && visibleColumns[col.key] && stats[col.key]).map(col => (
            <div key={col.key} className="bg-white rounded p-3">
              <div className="text-xs text-gray-500 mb-1">{col.label}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">평균:</span>
                  <span className="font-semibold text-blue-600">{stats[col.key]?.avg}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">최고:</span>
                  <span className="font-semibold text-green-600">{stats[col.key]?.max}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">최저:</span>
                  <span className="font-semibold text-red-600">{stats[col.key]?.min}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.filter(col => visibleColumns[col.key]).map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.label}</span>
                      {sortKey === col.key ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.filter(col => visibleColumns[col.key]).length} className="px-4 py-8 text-center text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                processedData.map((stat, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    {columns.filter(col => visibleColumns[col.key]).map(col => (
                      <td key={col.key} className="px-4 py-3 whitespace-nowrap text-sm">
                        {col.key === 'name' ? (
                          <span className="font-medium text-gray-900">{stat[col.key]}</span>
                        ) : (
                          <span className="text-gray-600">{stat[col.key] || '-'}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 데이터 개수 */}
      <div className="text-sm text-gray-500 text-center">
        전체 {pitcherStats.length}명 중 {processedData.length}명 표시
      </div>
    </div>
  );
};

export default PitcherStatsPivot;
