import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Users, TrendingUp, Target, Calendar, Clipboard } from 'lucide-react';

const BaseballTeamManager = () => {
  const [activeTab, setActiveTab] = useState('roster');
  const [apiKey, setApiKey] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  // 데이터 상태
  const [players, setPlayers] = useState([]);
  const [batterStats, setBatterStats] = useState([]);
  const [pitcherStats, setPitcherStats] = useState([]);
  const [games, setGames] = useState([]);
  const [lineup, setLineup] = useState(Array(10).fill(null).map(() => ({ player: null, position: '' })));
  const [bench, setBench] = useState([]);
  
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

  // 구글 시트 연결
  const connectToSheets = async () => {
    if (!apiKey ||