import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  Search, 
  DollarSign, 
  Users, 
  FileText, 
  Share2, 
  Copy, 
  UserPlus, 
  AlertCircle,
  Settings
} from 'lucide-react';
import type { Member, Bet, Transaction, MemberSummary, BetStatus } from './types';
import { WORLD_CUP_TEAMS, PLAY_TYPES } from './constants';
import type { Team } from './constants';
import { generateId, formatDate, exportToCSV, downloadJSONBackup } from './utils';
import { getSupabaseClient } from './supabaseClient';

// --- MOCK INITIAL DATA ---
const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: '阿强', phone: '13800138001', notes: '经常微信转账', createdAt: Date.now() - 5 * 24 * 3600 * 1000 },
  { id: 'm2', name: '大飞', phone: '13911112222', notes: '喜欢玩受让球', createdAt: Date.now() - 4 * 24 * 3600 * 1000 },
  { id: 'm3', name: '小莉', phone: '13666667777', notes: '只买强队', createdAt: Date.now() - 3 * 24 * 3600 * 1000 }
];

const INITIAL_BETS: Bet[] = [
  {
    id: 'b1',
    memberId: 'm1',
    memberName: '阿强',
    matchName: '阿根廷 🇦🇷 vs 法国 🇫🇷',
    playType: '独赢 (主客和) - 阿根廷胜',
    odds: 1.95,
    stake: 500,
    status: 'win',
    payout: 975,
    createdAt: Date.now() - 2 * 24 * 3600 * 1000,
    settledAt: Date.now() - 2 * 24 * 3600 * 1000 + 4 * 3600 * 1000,
    notes: '揭幕战看好潘帕斯雄鹰'
  },
  {
    id: 'b2',
    memberId: 'm2',
    memberName: '大飞',
    matchName: '德国 🇩🇪 vs 日本 🇯🇵',
    playType: '让球盘 (亚洲盘) - 德国 -1',
    odds: 1.80,
    stake: 1000,
    status: 'loss',
    payout: 0,
    createdAt: Date.now() - 1 * 24 * 3600 * 1000,
    settledAt: Date.now() - 1 * 24 * 3600 * 1000 + 5 * 3600 * 1000,
    notes: '觉得德国必胜两球以上'
  },
  {
    id: 'b3',
    memberId: 'm3',
    memberName: '小莉',
    matchName: '巴西 🇧🇷 vs 克罗地亚 🇭🇷',
    playType: '大小盘 (进球数) - 大 2.5',
    odds: 1.90,
    stake: 300,
    status: 'pending',
    payout: 0,
    createdAt: Date.now() - 10 * 3600 * 1000,
    notes: '感觉两边进攻都很猛'
  },
  {
    id: 'b4',
    memberId: 'm1',
    memberName: '阿强',
    matchName: '英格兰 🏴󠁧󠁢󠁥󠁮󠁧󠁿 vs 美国 🇺🇸',
    playType: '独赢 (主客和) - 英格兰胜',
    odds: 1.65,
    stake: 600,
    status: 'pending',
    payout: 0,
    createdAt: Date.now() - 2 * 3600 * 1000,
    notes: '三狮军团赢球难度不大'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', memberId: 'm1', memberName: '阿强', type: 'deposit', amount: 2000, description: '初始资金充值', createdAt: Date.now() - 5 * 24 * 3600 * 1000 },
  { id: 't2', memberId: 'm2', memberName: '大飞', type: 'deposit', amount: 1500, description: '微信转账充值', createdAt: Date.now() - 4 * 24 * 3600 * 1000 },
  { id: 't3', memberId: 'm3', memberName: '小莉', type: 'deposit', amount: 3000, description: '支付宝充值', createdAt: Date.now() - 3 * 24 * 3600 * 1000 },
  // b1 placing
  { id: 't4', memberId: 'm1', memberName: '阿强', type: 'bet_place', amount: -500, relatedId: 'b1', description: '下注【阿根廷 🇦🇷 vs 法国 🇫🇷】: 独赢 (主客和) - 阿根廷胜', createdAt: Date.now() - 2 * 24 * 3600 * 1000 },
  // b1 payout
  { id: 't5', memberId: 'm1', memberName: '阿强', type: 'bet_payout', amount: 975, relatedId: 'b1', description: '派奖【阿根廷 🇦🇷 vs 法国 🇫🇷】 (本金 500, 赔率 1.95)', createdAt: Date.now() - 2 * 24 * 3600 * 1000 + 4 * 3600 * 1000 },
  // b2 placing
  { id: 't6', memberId: 'm2', memberName: '大飞', type: 'bet_place', amount: -1000, relatedId: 'b2', description: '下注【德国 🇩🇪 vs 日本 🇯🇵】: 让球盘 (亚洲盘) - 德国 -1', createdAt: Date.now() - 1 * 24 * 3600 * 1000 },
  // b3 placing
  { id: 't7', memberId: 'm3', memberName: '小莉', type: 'bet_place', amount: -300, relatedId: 'b3', description: '下注【巴西 🇧🇷 vs 克罗地亚 🇭🇷】: 大小盘 (进球数) - 大 2.5', createdAt: Date.now() - 10 * 3600 * 1000 },
  // b4 placing
  { id: 't8', memberId: 'm1', memberName: '阿强', type: 'bet_place', amount: -600, relatedId: 'b4', description: '下注【英格兰 🏴󠁧󠁢󠁥󠁮󠁧󠁿 vs 美国 🇺🇸】: 独赢 (主客和) - 英格兰胜', createdAt: Date.now() - 2 * 3600 * 1000 }
];

export default function App() {
  // --- States ---
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('wc_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [bets, setBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('wc_bets');
    return saved ? JSON.parse(saved) : INITIAL_BETS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('wc_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'bets' | 'transactions'>('dashboard');
  
  // Navigation & Details selection
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // Forms states
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberNotes, setNewMemberNotes] = useState('');
  
  // Fund operation modal
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [fundOpType, setFundOpType] = useState<'deposit' | 'withdraw'>('deposit');
  const [fundAmount, setFundAmount] = useState('');
  const [fundNotes, setFundNotes] = useState('');
  
  // Bet Form
  const [betMemberId, setBetMemberId] = useState('');
  const [betHomeTeam, setBetHomeTeam] = useState('');
  const [betAwayTeam, setBetAwayTeam] = useState('');
  const [betPlayType, setBetPlayType] = useState('独赢 (主客和)');
  const [betPlayDetail, setBetPlayDetail] = useState('');
  const [betOdds, setBetOdds] = useState('');
  const [betStake, setBetStake] = useState('');
  const [betNotes, setBetNotes] = useState('');

  // Real-time Bet Calculator values
  const calcOdds = parseFloat(betOdds) || 0;
  const calcStake = parseFloat(betStake) || 0;
  const expectedPayout = calcOdds * calcStake;
  const netProfit = calcStake * (calcOdds - 1);
  
  // Auto suggestion for teams
  const [homeTeamQuery, setHomeTeamQuery] = useState('');
  const [awayTeamQuery, setAwayTeamQuery] = useState('');
  const [showHomeSuggestions, setShowHomeSuggestions] = useState(false);
  const [showAwaySuggestions, setShowAwaySuggestions] = useState(false);
  
  // Settlement modal
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settleBetId, setSettleBetId] = useState<string | null>(null);
  const [settleStatus, setSettleStatus] = useState<BetStatus>('win');
  const [settlePayout, setSettlePayout] = useState('');
  
  // WeChat bill modal
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billMemberId, setBillMemberId] = useState<string | null>(null);
  
  // Settings modal
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  
  // Filters
  const [betFilterStatus, setBetFilterStatus] = useState<string>('all');
  const [betFilterMember, setBetFilterMember] = useState<string>('all');
  const [txFilterMember, setTxFilterMember] = useState<string>('all');
  const [txFilterType, setTxFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ref for file upload
  const fileInputRef = useRef<HTMLInputElement>(null);


  const [syncing, setSyncing] = useState(false);

  // --- Supabase Cloud Database Integration ---
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return localStorage.getItem('wc_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    return localStorage.getItem('wc_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  });
  const [dbMode, setDbMode] = useState<'local' | 'supabase'>(() => {
    const saved = localStorage.getItem('wc_db_mode');
    if (saved) return saved as 'local' | 'supabase';
    return (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) ? 'supabase' : 'local';
  });
  const [dbConnected, setDbConnected] = useState(false);

  // Sync to LocalStorage (Only if local offline mode is active)
  useEffect(() => {
    if (dbMode === 'local') {
      localStorage.setItem('wc_members', JSON.stringify(members));
    }
  }, [members, dbMode]);

  useEffect(() => {
    if (dbMode === 'local') {
      localStorage.setItem('wc_bets', JSON.stringify(bets));
    }
  }, [bets, dbMode]);

  useEffect(() => {
    if (dbMode === 'local') {
      localStorage.setItem('wc_transactions', JSON.stringify(transactions));
    }
  }, [transactions, dbMode]);



  useEffect(() => {
    localStorage.setItem('wc_supabase_url', supabaseUrl);
  }, [supabaseUrl]);

  useEffect(() => {
    localStorage.setItem('wc_supabase_key', supabaseKey);
  }, [supabaseKey]);

  useEffect(() => {
    localStorage.setItem('wc_db_mode', dbMode);
  }, [dbMode]);



  // --- Supabase Cloud Sync Helpers ---
  const fetchFromSupabase = async (client: any) => {
    try {
      const { data: membersData, error: mErr } = await client.from('wc_members').select('*');
      if (mErr) throw mErr;
      const { data: betsData, error: bErr } = await client.from('wc_bets').select('*');
      if (bErr) throw bErr;
      const { data: txsData, error: tErr } = await client.from('wc_transactions').select('*');
      if (tErr) throw tErr;

      const parsedMembers: Member[] = (membersData || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        phone: m.phone || '',
        notes: m.notes || '',
        createdAt: Number(m.created_at)
      }));

      const parsedBets: Bet[] = (betsData || []).map((b: any) => ({
        id: b.id,
        memberId: b.member_id,
        memberName: b.member_name,
        matchName: b.match_name,
        playType: b.play_type,
        odds: Number(b.odds),
        stake: Number(b.stake),
        status: b.status as BetStatus,
        payout: Number(b.payout),
        createdAt: Number(b.created_at),
        settledAt: b.settled_at ? Number(b.settled_at) : undefined,
        notes: b.notes || ''
      }));

      const parsedTxs: Transaction[] = (txsData || []).map((t: any) => ({
        id: t.id,
        memberId: t.member_id,
        memberName: t.member_name,
        type: t.type as any,
        amount: Number(t.amount),
        relatedId: t.related_id || undefined,
        description: t.description || '',
        createdAt: Number(t.created_at)
      }));

      setMembers(parsedMembers);
      setBets(parsedBets.sort((a, b) => b.createdAt - a.createdAt));
      setTransactions(parsedTxs.sort((a, b) => b.createdAt - a.createdAt));
      setDbConnected(true);
      return true;
    } catch (err: any) {
      console.error('Fetch Supabase error:', err);
      setDbConnected(false);
      return false;
    }
  };

  const uploadLocalDataToCloud = async () => {
    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (!client) {
      alert('请先填写正确的云数据库连接信息！');
      return;
    }
    
    if (!confirm('这会把你当前浏览器里的所有本地成员、投注单和流水数据上传到云端。如果云端已有同ID的数据，会直接覆盖。是否确认上传？')) {
      return;
    }

    setSyncing(true);
    try {
      if (members.length > 0) {
        const payload = members.map(m => ({
          id: m.id,
          name: m.name,
          phone: m.phone,
          notes: m.notes,
          created_at: m.createdAt
        }));
        const { error } = await client.from('wc_members').upsert(payload);
        if (error) throw new Error('上传成员失败: ' + error.message);
      }

      if (bets.length > 0) {
        const payload = bets.map(b => ({
          id: b.id,
          member_id: b.memberId,
          member_name: b.memberName,
          match_name: b.matchName,
          play_type: b.playType,
          odds: b.odds,
          stake: b.stake,
          status: b.status,
          payout: b.payout,
          created_at: b.createdAt,
          settled_at: b.settledAt || null,
          notes: b.notes
        }));
        const { error } = await client.from('wc_bets').upsert(payload);
        if (error) throw new Error('上传投注单失败: ' + error.message);
      }

      if (transactions.length > 0) {
        const payload = transactions.map(t => ({
          id: t.id,
          member_id: t.memberId,
          member_name: t.memberName,
          type: t.type,
          amount: t.amount,
          related_id: t.relatedId || null,
          description: t.description,
          created_at: t.createdAt
        }));
        const { error } = await client.from('wc_transactions').upsert(payload);
        if (error) throw new Error('上传交易流水失败: ' + error.message);
      }

      alert('所有本地数据成功同步并上传至云端数据库！');
      await fetchFromSupabase(client);
    } catch (err: any) {
      console.error(err);
      alert(err.message || '上传数据失败！');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleDbMode = async (mode: 'local' | 'supabase') => {
    if (mode === 'local') {
      setDbMode('local');
      setDbConnected(false);
      const savedM = localStorage.getItem('wc_members');
      const savedB = localStorage.getItem('wc_bets');
      const savedT = localStorage.getItem('wc_transactions');
      setMembers(savedM ? JSON.parse(savedM) : INITIAL_MEMBERS);
      setBets(savedB ? JSON.parse(savedB) : INITIAL_BETS);
      setTransactions(savedT ? JSON.parse(savedT) : INITIAL_TRANSACTIONS);
      alert('已切换回本地离线模式！数据已恢复为本地浏览器数据。');
    } else {
      if (!supabaseUrl.trim() || !supabaseKey.trim()) {
        alert('请先填写 Supabase URL 和 Key！');
        return;
      }
      setSyncing(true);
      const client = getSupabaseClient(supabaseUrl.trim(), supabaseKey.trim());
      if (client) {
        const success = await fetchFromSupabase(client);
        if (success) {
          setDbMode('supabase');
          alert('云同步模式连接成功！已载入云端共享账本数据。');
        } else {
          alert('连接 Supabase 数据库失败！\n\n原因：你的 Supabase 数据库中还没有创建该项目需要的表格（如 wc_members、wc_bets、wc_transactions 等）。\n\n解决方法：请把页面最下方的“数据库初始化 SQL 脚本”复制，粘贴到 Supabase 网页的 SQL Editor 中并运行。');
        }
      }
      setSyncing(false);
    }
  };

  useEffect(() => {
    const initDb = async () => {
      if (dbMode === 'supabase' && supabaseUrl && supabaseKey) {
        const client = getSupabaseClient(supabaseUrl, supabaseKey);
        if (client) {
          await fetchFromSupabase(client);
        }
      }
    };
    initDb();
  }, []);

  const handleRefreshCloud = async () => {
    if (dbMode === 'supabase') {
      setSyncing(true);
      const client = getSupabaseClient(supabaseUrl, supabaseKey);
      if (client) {
        await fetchFromSupabase(client);
      }
      setSyncing(false);
    }
  };

  // --- Dynamic Calculations ---
  


  // Calculate summaries for each member
  const getMemberSummaries = (): MemberSummary[] => {
    return members.map(m => {
      // Transactions
      const mTx = transactions.filter(t => t.memberId === m.id);
      const totalDeposit = mTx.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
      const totalWithdraw = mTx.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      // Bets
      const mBets = bets.filter(b => b.memberId === m.id);
      const activeBets = mBets.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.stake, 0);
      
      const settledBets = mBets.filter(b => b.status !== 'pending');
      const settledStakes = settledBets.reduce((sum, b) => sum + b.stake, 0);
      const settledPayouts = settledBets.reduce((sum, b) => sum + b.payout, 0);
      const netProfit = settledPayouts - settledStakes;
      
      // Available Balance = Deposit - Withdraw + netProfit - activeBets
      const currentBalance = totalDeposit - totalWithdraw + netProfit - activeBets;

      return {
        member: m,
        totalDeposit,
        totalWithdraw,
        activeBets,
        netProfit,
        currentBalance
      };
    });
  };

  const memberSummaries = getMemberSummaries();
  const selectedMemberSummary = selectedMemberId ? memberSummaries.find(ms => ms.member.id === selectedMemberId) : null;

  // --- Handlers ---

  // Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    
    // Check if name duplicate
    if (members.some(m => m.name === newMemberName.trim())) {
      alert('已存在同名成员！');
      return;
    }

    const newM: Member = {
      id: generateId(),
      name: newMemberName.trim(),
      phone: newMemberPhone.trim(),
      notes: newMemberNotes.trim(),
      createdAt: Date.now()
    };

    if (dbMode === 'supabase') {
      const client = getSupabaseClient(supabaseUrl, supabaseKey);
      if (client) {
        setSyncing(true);
        try {
          const { error } = await client.from('wc_members').insert({
            id: newM.id,
            name: newM.name,
            phone: newM.phone,
            notes: newM.notes,
            created_at: newM.createdAt
          });
          if (error) throw error;
        } catch (err: any) {
          console.error(err);
          alert('云端添加成员失败: ' + err.message);
          setSyncing(false);
          return;
        }
        setSyncing(false);
      }
    }

    setMembers([...members, newM]);
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberNotes('');
  };

  // Delete Member
  const handleDeleteMember = async (id: string) => {
    const summary = memberSummaries.find(ms => ms.member.id === id);
    if (!summary) return;

    if (summary.activeBets > 0) {
      alert('该成员有进行中的下注，无法删除！');
      return;
    }
    if (Math.abs(summary.currentBalance) > 0.01) {
      if (!confirm(`该成员的余额为 ${summary.currentBalance.toFixed(2)} 元。确认强行删除并清空账目吗？`)) {
        return;
      }
    } else {
      if (!confirm('确认删除该成员吗？这将清除其所有注单和流水。')) {
        return;
      }
    }

    if (dbMode === 'supabase') {
      const client = getSupabaseClient(supabaseUrl, supabaseKey);
      if (client) {
        setSyncing(true);
        try {
          const { error: err1 } = await client.from('wc_transactions').delete().eq('member_id', id);
          if (err1) throw err1;
          const { error: err2 } = await client.from('wc_bets').delete().eq('member_id', id);
          if (err2) throw err2;
          const { error: err3 } = await client.from('wc_members').delete().eq('id', id);
          if (err3) throw err3;
        } catch (err: any) {
          console.error(err);
          alert('云端删除成员失败: ' + err.message);
          setSyncing(false);
          return;
        }
        setSyncing(false);
      }
    }

    setMembers(members.filter(m => m.id !== id));
    setBets(bets.filter(b => b.memberId !== id));
    setTransactions(transactions.filter(t => t.memberId !== id));
    if (selectedMemberId === id) setSelectedMemberId(null);
  };

  // Deposit or Withdraw
  const handleFundOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的金额！');
      return;
    }

    const summary = selectedMemberSummary;
    if (!summary) return;

    if (fundOpType === 'withdraw' && amount > summary.currentBalance) {
      if (!confirm(`取款金额 (${amount}) 大于该成员当前可用余额 (${summary.currentBalance.toFixed(2)})。是否继续强行提现？`)) {
        return;
      }
    }

    const txId = generateId();
    const newTx: Transaction = {
      id: txId,
      memberId: selectedMemberId,
      memberName: summary.member.name,
      type: fundOpType,
      amount: fundOpType === 'deposit' ? amount : -amount,
      description: fundOpType === 'deposit' ? `手工充值: ${fundNotes || '无备注'}` : `手工取款: ${fundNotes || '无备注'}`,
      createdAt: Date.now()
    };

    if (dbMode === 'supabase') {
      const client = getSupabaseClient(supabaseUrl, supabaseKey);
      if (client) {
        setSyncing(true);
        try {
          const { error } = await client.from('wc_transactions').insert({
            id: newTx.id,
            member_id: newTx.memberId,
            member_name: newTx.memberName,
            type: newTx.type,
            amount: newTx.amount,
            description: newTx.description,
            created_at: newTx.createdAt
          });
          if (error) throw error;
        } catch (err: any) {
          console.error(err);
          alert('云端写入流水失败: ' + err.message);
          setSyncing(false);
          return;
        }
        setSyncing(false);
      }
    }

    setTransactions([newTx, ...transactions]);
    setFundModalOpen(false);
    setFundAmount('');
    setFundNotes('');
  };

  // Place Bet
  const handlePlaceBet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!betMemberId) {
      alert('请选择投注人！');
      return;
    }
    if (!betHomeTeam.trim() || !betAwayTeam.trim()) {
      alert('请输入比赛双方队伍名称！');
      return;
    }
    const odds = parseFloat(betOdds);
    const stake = parseFloat(betStake);
    if (isNaN(odds) || odds <= 1) {
      alert('请输入有效的赔率（必须大于 1.0）！');
      return;
    }
    if (isNaN(stake) || stake <= 0) {
      alert('请输入有效的下注本金！');
      return;
    }

    const memberSum = memberSummaries.find(ms => ms.member.id === betMemberId);
    if (!memberSum) return;

    if (stake > memberSum.currentBalance) {
      if (!confirm(`下注本金 (${stake}元) 超过了该成员的可用余额 (${memberSum.currentBalance.toFixed(2)}元)。是否允许透支下注？`)) {
        return;
      }
    }

    const betId = generateId();
    const matchName = `${betHomeTeam.trim()} vs ${betAwayTeam.trim()}`;
    const playType = `${betPlayType} - ${betPlayDetail.trim() || '无具体玩法描述'}`;

    const newBet: Bet = {
      id: betId,
      memberId: betMemberId,
      memberName: memberSum.member.name,
      matchName,
      playType,
      odds,
      stake,
      status: 'pending',
      payout: 0,
      createdAt: Date.now(),
      notes: betNotes.trim()
    };

    const newTx: Transaction = {
      id: generateId(),
      memberId: betMemberId,
      memberName: memberSum.member.name,
      type: 'bet_place',
      amount: -stake,
      relatedId: betId,
      description: `下注【${matchName}】: ${playType} (赔率 ${odds}, 本金 ${stake})`,
      createdAt: Date.now()
    };

    if (dbMode === 'supabase') {
      const client = getSupabaseClient(supabaseUrl, supabaseKey);
      if (client) {
        setSyncing(true);
        try {
          const { error: err1 } = await client.from('wc_bets').insert({
            id: newBet.id,
            member_id: newBet.memberId,
            member_name: newBet.memberName,
            match_name: newBet.matchName,
            play_type: newBet.playType,
            odds: newBet.odds,
            stake: newBet.stake,
            status: newBet.status,
            payout: newBet.payout,
            created_at: newBet.createdAt,
            notes: newBet.notes
          });
          if (err1) throw err1;

          const { error: err2 } = await client.from('wc_transactions').insert({
            id: newTx.id,
            member_id: newTx.memberId,
            member_name: newTx.memberName,
            type: newTx.type,
            amount: newTx.amount,
            related_id: newTx.relatedId,
            description: newTx.description,
            created_at: newTx.createdAt
          });
          if (err2) throw err2;
        } catch (err: any) {
          console.error(err);
          alert('云端录入注单失败: ' + err.message);
          setSyncing(false);
          return;
        }
        setSyncing(false);
      }
    }

    setBets([newBet, ...bets]);
    setTransactions([newTx, ...transactions]);

    // Reset Form
    setBetHomeTeam('');
    setBetAwayTeam('');
    setBetPlayDetail('');
    setBetOdds('');
    setBetStake('');
    setBetNotes('');
    setHomeTeamQuery('');
    setAwayTeamQuery('');
    alert('注单录入成功！');
  };

  // Open Settle Modal
  const openSettleModal = (bet: Bet) => {
    setSettleBetId(bet.id);
    setSettleStatus('win');
    
    // Auto calculate default payouts
    if (bet.status === 'pending') {
      setSettlePayout((bet.stake * bet.odds).toFixed(2));
    } else {
      setSettlePayout(bet.payout.toString());
    }
    setSettleModalOpen(true);
  };

  // Update payout estimation when status changes in settle modal
  const handleSettleStatusChange = (status: BetStatus) => {
    setSettleStatus(status);
    const bet = bets.find(b => b.id === settleBetId);
    if (!bet) return;

    if (status === 'win') {
      setSettlePayout((bet.stake * bet.odds).toFixed(2));
    } else if (status === 'half-win') {
      // Half win usually: stake + stake * (odds - 1) / 2
      const halfWinPayout = bet.stake + bet.stake * (bet.odds - 1) / 2;
      setSettlePayout(halfWinPayout.toFixed(2));
    } else if (status === 'loss') {
      setSettlePayout('0');
    } else if (status === 'half-loss') {
      // Half loss: stake / 2
      setSettlePayout((bet.stake / 2).toFixed(2));
    } else if (status === 'void') {
      setSettlePayout(bet.stake.toString());
    }
  };

  // Settle Bet
  const handleSettleBet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleBetId) return;
    const payout = parseFloat(settlePayout);
    if (isNaN(payout) || payout < 0) {
      alert('请输入有效的派奖金额！');
      return;
    }

    const bet = bets.find(b => b.id === settleBetId);
    if (!bet) return;

    // Check if already settled, we need to remove previous payout transaction
    const filteredTxs = transactions.filter(t => !(t.relatedId === bet.id && (t.type === 'bet_payout' || t.type === 'bet_refund')));

    const updatedBet: Bet = {
      ...bet,
      status: settleStatus,
      payout,
      settledAt: Date.now()
    };

    const payoutTxId = generateId();
    const isVoid = settleStatus === 'void';
    const newPayoutTx = payout > 0 ? {
      id: payoutTxId,
      memberId: bet.memberId,
      memberName: bet.memberName,
      type: isVoid ? ('bet_refund' as const) : ('bet_payout' as const),
      amount: payout,
      relatedId: bet.id,
      description: isVoid 
        ? `退款【${bet.matchName}】 (走水退本金 ${payout})` 
        : `派奖【${bet.matchName}】: ${bet.playType} (赔率 ${bet.odds}, 本金 ${bet.stake}, 返奖 ${payout})`,
      createdAt: Date.now()
    } : null;

    if (dbMode === 'supabase') {
      const client = getSupabaseClient(supabaseUrl, supabaseKey);
      if (client) {
        setSyncing(true);
        try {
          const { error: err1 } = await client.from('wc_bets').update({
            status: updatedBet.status,
            payout: updatedBet.payout,
            settled_at: updatedBet.settledAt
          }).eq('id', settleBetId);
          if (err1) throw err1;

          const { error: err2 } = await client.from('wc_transactions')
            .delete()
            .eq('related_id', bet.id)
            .in('type', ['bet_payout', 'bet_refund']);
          if (err2) throw err2;

          if (newPayoutTx) {
            const { error: err3 } = await client.from('wc_transactions').insert({
              id: newPayoutTx.id,
              member_id: newPayoutTx.memberId,
              member_name: newPayoutTx.memberName,
              type: newPayoutTx.type,
              amount: newPayoutTx.amount,
              related_id: newPayoutTx.relatedId,
              description: newPayoutTx.description,
              created_at: newPayoutTx.createdAt
            });
            if (err3) throw err3;
          }
        } catch (err: any) {
          console.error(err);
          alert('云端结算失败: ' + err.message);
          setSyncing(false);
          return;
        }
        setSyncing(false);
      }
    }

    const newTxs = newPayoutTx ? [newPayoutTx, ...filteredTxs] : filteredTxs;
    setBets(bets.map(b => b.id === settleBetId ? updatedBet : b));
    setTransactions(newTxs);
    setSettleModalOpen(false);
    setSettleBetId(null);
  };

  // Cancel/Delete Bet
  const handleCancelBet = async (betId: string) => {
    const bet = bets.find(b => b.id === betId);
    if (!bet) return;

    const confirmMsg = bet.status === 'pending' 
      ? '确定要取消这笔未结算注单吗？这会把下注本金退回至可用余额。'
      : '这笔注单已经结算！如果删除，系统将扣除对应的派奖并恢复下注前的状态。确认删除吗？';

    if (!confirm(confirmMsg)) return;

    if (dbMode === 'supabase') {
      const client = getSupabaseClient(supabaseUrl, supabaseKey);
      if (client) {
        setSyncing(true);
        try {
          const { error: err1 } = await client.from('wc_transactions').delete().eq('related_id', betId);
          if (err1) throw err1;
          const { error: err2 } = await client.from('wc_bets').delete().eq('id', betId);
          if (err2) throw err2;
        } catch (err: any) {
          console.error(err);
          alert('云端删除注单失败: ' + err.message);
          setSyncing(false);
          return;
        }
        setSyncing(false);
      }
    }

    setBets(bets.filter(b => b.id !== betId));
    setTransactions(transactions.filter(t => t.relatedId !== betId));
  };

  // --- CSV Export Helper ---
  const handleExportMembers = () => {
    const headers = ['姓名', '电话', '累计充值', '累计取款', '在途投注', '历史净盈亏', '当前余额', '备注'];
    const rows = memberSummaries.map(ms => [
      ms.member.name,
      ms.member.phone,
      ms.totalDeposit.toFixed(2),
      ms.totalWithdraw.toFixed(2),
      ms.activeBets.toFixed(2),
      ms.netProfit.toFixed(2),
      ms.currentBalance.toFixed(2),
      ms.member.notes
    ]);
    exportToCSV('世界杯账本_成员报表', headers, rows);
  };

  const handleExportBets = () => {
    const headers = ['下注时间', '投注人', '比赛对阵', '玩法详情', '赔率', '本金', '状态', '派奖金额', '净盈亏', '备注'];
    const rows = bets.map(b => {
      const profit = b.status === 'pending' ? 0 : b.payout - b.stake;
      const statusCn = {
        pending: '进行中',
        win: '赢',
        'half-win': '半赢',
        loss: '输',
        'half-loss': '半输',
        void: '走水/退款'
      }[b.status];
      return [
        formatDate(b.createdAt),
        b.memberName,
        b.matchName,
        b.playType,
        b.odds.toString(),
        b.stake.toString(),
        statusCn || b.status,
        b.status === 'pending' ? '-' : b.payout.toFixed(2),
        b.status === 'pending' ? '-' : profit.toFixed(2),
        b.notes || ''
      ];
    });
    exportToCSV('世界杯账本_投注明细', headers, rows);
  };

  const handleExportTransactions = () => {
    const headers = ['时间', '成员', '类型', '变动金额', '描述'];
    const rows = transactions.map(t => {
      const typeCn = {
        deposit: '充值',
        withdraw: '取款',
        bet_place: '下注扣款',
        bet_payout: '派奖回款',
        bet_refund: '走水退款',
        manual_adjust: '手动调整'
      }[t.type];
      return [
        formatDate(t.createdAt),
        t.memberName,
        typeCn || t.type,
        t.amount.toFixed(2),
        t.description
      ];
    });
    exportToCSV('世界杯账本_资金流水', headers, rows);
  };

  // Backup & Import
  const handleBackup = () => {
    const backupData = {
      members,
      bets,
      transactions,
      version: '1.0.0',
      exportedAt: Date.now()
    };
    downloadJSONBackup(backupData);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.members && parsed.bets && parsed.transactions) {
          if (confirm('导入备份将覆盖当前浏览器里的所有数据！确认继续吗？')) {
            setMembers(parsed.members);
            setBets(parsed.bets);
            setTransactions(parsed.transactions);
            setSelectedMemberId(null);
            alert('数据导入恢复成功！');
          }
        } else {
          alert('非法的备份文件格式！');
        }
      } catch (err) {
        alert('解析备份文件失败，请确保是正确的JSON格式！');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  // Reset / Clear database
  const handleResetData = () => {
    if (confirm('⚠️ 警告：这会删除您所有的成员、投注和流水数据。您想要清空它们重新开始，还是还原到示例数据？\n\n点击【确定】清空所有数据重新开始。\n点击【取消】取消本次操作。')) {
      if (confirm('请再次确认：确定要彻底清空数据吗？该操作不可逆！')) {
        setMembers([]);
        setBets([]);
        setTransactions([]);
        setSelectedMemberId(null);
        alert('账本已完全清空，请添加您的第一位成员吧！');
      }
    }
  };

  const handleLoadMockData = () => {
    if (confirm('这会覆盖当前的数据并载入内置的模拟世界杯数据。是否继续？')) {
      setMembers(INITIAL_MEMBERS);
      setBets(INITIAL_BETS);
      setTransactions(INITIAL_TRANSACTIONS);
      setSelectedMemberId(null);
      alert('已成功加载示例数据！');
    }
  };

  // Team auto suggestion helpers
  const handleHomeTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setHomeTeamQuery(query);
    setBetHomeTeam(query);
    setShowHomeSuggestions(query.length > 0);
  };

  const handleAwayTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setAwayTeamQuery(query);
    setBetAwayTeam(query);
    setShowAwaySuggestions(query.length > 0);
  };

  const selectHomeTeam = (team: Team) => {
    const nameWithFlag = `${team.name} ${team.flag}`;
    setBetHomeTeam(nameWithFlag);
    setHomeTeamQuery(nameWithFlag);
    setShowHomeSuggestions(false);
  };

  const selectAwayTeam = (team: Team) => {
    const nameWithFlag = `${team.name} ${team.flag}`;
    setBetAwayTeam(nameWithFlag);
    setAwayTeamQuery(nameWithFlag);
    setShowAwaySuggestions(false);
  };

  const getFilteredTeams = (query: string) => {
    const clean = query.trim().toLowerCase();
    if (!clean) return [];
    return WORLD_CUP_TEAMS.filter(t => 
      t.name.toLowerCase().includes(clean) || 
      t.englishName.toLowerCase().includes(clean)
    ).slice(0, 5); // Limit 5 suggestions
  };

  // Copy text bill for WeChat
  const handleCopyTextBill = (ms: MemberSummary) => {
    const memberBets = bets.filter(b => b.memberId === ms.member.id);
    const active = memberBets.filter(b => b.status === 'pending');
    const settled = memberBets.filter(b => b.status !== 'pending').slice(0, 5); // show last 5 settled
    
    let text = `🧾 【2026世界杯对账单】\n`;
    text += `👤 成员姓名: ${ms.member.name}\n`;
    text += `📅 对账日期: ${new Date().toLocaleDateString()}\n`;
    text += `---------------------------\n`;
    text += `💰 累计充值: ￥${ms.totalDeposit.toFixed(2)}\n`;
    text += `💸 累计取款: ￥${ms.totalWithdraw.toFixed(2)}\n`;
    text += `⏱️ 在途投注: ￥${ms.activeBets.toFixed(2)}\n`;
    text += `📈 历史净盈亏: ${ms.netProfit >= 0 ? '+' : ''}￥${ms.netProfit.toFixed(2)}\n`;
    text += `💵 当前可用余额: ￥${ms.currentBalance.toFixed(2)}\n`;
    
    if (active.length > 0) {
      text += `\n⏳ 【进行中注单】(${active.length}笔):\n`;
      active.forEach(b => {
        text += `• ${b.matchName} | ${b.playType.split(' - ')[0]} | 投:￥${b.stake} (赔率:${b.odds})\n`;
      });
    }

    if (settled.length > 0) {
      text += `\n✅ 【最近结算历史】:\n`;
      settled.forEach(b => {
        const profit = b.payout - b.stake;
        const statusIcon = b.status === 'win' || b.status === 'half-win' ? '🟢 赢' : b.status === 'void' ? '⚪ 走水' : '🔴 输';
        text += `• ${b.matchName.split(' ')[0]} vs ${b.matchName.split(' ').slice(-1)[0]} | 投:￥${b.stake} | ${statusIcon} (${profit >= 0 ? '+' : ''}${profit.toFixed(0)}元)\n`;
      });
    }
    text += `---------------------------\n`;
    text += `📢 发送自您的世界杯账本管家。请核对明细，如有疑问请及时联系发单人！`;

    navigator.clipboard.writeText(text);
    alert('已复制文本账单！可直接粘贴发送至微信群。');
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowHomeSuggestions(false);
      setShowAwaySuggestions(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // --- Filtering computations ---
  const filteredBets = bets.filter(b => {
    const matchesStatus = betFilterStatus === 'all' || b.status === betFilterStatus;
    const matchesMember = betFilterMember === 'all' || b.memberId === betFilterMember;
    const matchesSearch = searchQuery.trim() === '' || 
      b.matchName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.memberName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.playType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.notes && b.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesMember && matchesSearch;
  });

  const filteredTransactions = transactions.filter(t => {
    const matchesMember = txFilterMember === 'all' || t.memberId === txFilterMember;
    const matchesType = txFilterType === 'all' || t.type === txFilterType;
    const matchesSearch = searchQuery.trim() === '' || 
      t.memberName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesMember && matchesType && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* --- Header --- */}
      <header className="py-6 border-b border-[var(--border-color)] flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="title-font font-extrabold text-2xl md:text-3xl flex items-center gap-2 m-0 text-[var(--primary)] text-left">
            🏆 2026 世界杯投注账本 <span className="text-[12px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-normal">代投单人版</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm text-left mt-1">
            为发起人提供清晰的一人代投多友账单，支持微信一键分享对账与 Excel 导出。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            className="btn btn-secondary text-xs font-bold flex items-center gap-2 border border-slate-700/80 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-300"
            onClick={() => setSettingsModalOpen(true)}
          >
            <Settings size={14} />
            系统配置与云同步
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFileChange} 
            accept=".json" 
            style={{ display: 'none' }} 
          />
        </div>
      </header>


      {/* --- Navigation Tabs --- */}
      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Users size={18} /> 成员对账大厅
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bets' ? 'active' : ''}`}
          onClick={() => setActiveTab('bets')}
        >
          <FileText size={18} /> 投注注单中心
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => { setActiveTab('transactions'); setSearchQuery(''); }}
        >
          <DollarSign size={18} /> 资金流水明细
        </button>
      </div>

      {/* --- Tab Content --- */}
      <main className="flex-grow pb-12">
        {/* ==================== TAB 1: DASHBOARD & MEMBERS ==================== */}
        {activeTab === 'dashboard' && (
          <div className="main-content">
            {/* Sidebar Column */}
            <aside className="space-y-6">
              {/* Panel 1: Add Member */}
              <div className="glass-panel">
                <h3 className="title-font text-lg font-bold mb-4 flex items-center gap-2">
                  <UserPlus size={18} className="text-[var(--primary)]" /> 添加新成员
                </h3>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">姓名 (必填)</label>
                    <input 
                      type="text" 
                      placeholder="例如：阿强"
                      className="form-input"
                      value={newMemberName}
                      onChange={e => setNewMemberName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">微信/手机号 (选填)</label>
                    <input 
                      type="text" 
                      placeholder="用于标记联系方式"
                      className="form-input"
                      value={newMemberPhone}
                      onChange={e => setNewMemberPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">备注</label>
                    <input 
                      type="text" 
                      placeholder="出资喜好或其他备注"
                      className="form-input"
                      value={newMemberNotes}
                      onChange={e => setNewMemberNotes(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full" disabled={syncing}>
                    确认添加成员
                  </button>
                </form>
              </div>
            </aside>

            {/* Main Section: Members Table & Details */}
            <div className="space-y-6">
              <div className="glass-panel">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="title-font text-lg font-bold">👤 成员资金列表</h3>
                  <button className="btn btn-secondary text-xs" onClick={handleExportMembers}>
                    <Download size={14} /> 导出 Excel/CSV 报表
                  </button>
                </div>

                {members.length === 0 ? (
                  <div className="text-center py-12 text-[var(--text-muted)]">
                    <AlertCircle className="mx-auto mb-2 text-slate-500" size={32} />
                    暂无成员。请在左侧添加成员！
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>姓名</th>
                          <th>累计充值</th>
                          <th>在途投注</th>
                          <th>历史净盈亏</th>
                          <th>可用余额</th>
                          <th className="text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberSummaries.map(ms => (
                          <tr 
                            key={ms.member.id}
                            className={selectedMemberId === ms.member.id ? 'bg-[rgba(212,175,55,0.05)] border-l-2 border-l-[var(--primary)]' : ''}
                          >
                            <td className="text-bold">
                              <div className="flex items-center gap-1.5">
                                {ms.member.name}
                                {ms.member.phone && <span className="text-[10px] text-slate-500">({ms.member.phone})</span>}
                              </div>
                            </td>
                            <td>￥{ms.totalDeposit.toFixed(2)}</td>
                            <td>￥{ms.activeBets.toFixed(2)}</td>
                            <td className={ms.netProfit > 0 ? 'text-profit' : ms.netProfit < 0 ? 'text-loss' : ''}>
                              {ms.netProfit > 0 ? '+' : ''}￥{ms.netProfit.toFixed(2)}
                            </td>
                            <td className="text-bold text-profit">￥{ms.currentBalance.toFixed(2)}</td>
                            <td className="text-right">
                              <div className="flex justify-end gap-1">
                                <button 
                                  className={`btn btn-icon-only text-xs ${selectedMemberId === ms.member.id ? 'btn-primary' : 'btn-secondary'}`}
                                  title={selectedMemberId === ms.member.id ? '收起个人账簿' : '查看个人账簿'}
                                  onClick={() => setSelectedMemberId(selectedMemberId === ms.member.id ? null : ms.member.id)}
                                >
                                  {selectedMemberId === ms.member.id ? '收起' : '账本'}
                                </button>
                                <button 
                                  className="btn btn-secondary btn-icon-only text-xs"
                                  title="账目变动 (充/提)"
                                  onClick={() => { setSelectedMemberId(ms.member.id); setFundOpType('deposit'); setFundModalOpen(true); }}
                                >
                                  充提
                                </button>
                                <button 
                                  className="btn btn-secondary btn-icon-only text-xs hover:text-[var(--primary)]"
                                  title="微信分享账单"
                                  onClick={() => { setBillMemberId(ms.member.id); setBillModalOpen(true); }}
                                >
                                  <Share2 size={13} />
                                </button>
                                <button 
                                  className="btn btn-danger btn-icon-only text-xs"
                                  title="删除成员"
                                  onClick={() => handleDeleteMember(ms.member.id)}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Selected Member Detail Section */}
              {selectedMemberSummary && (
                <div className="glass-panel border border-[var(--primary-glow)]">
                  <div className="flex flex-wrap justify-between items-center mb-6 border-b border-slate-800 pb-4">
                    <div>
                      <h4 className="title-font text-xl font-bold flex items-center gap-2">
                        📋 {selectedMemberSummary.member.name} 的个人账簿
                        {selectedMemberSummary.member.phone && (
                          <span className="text-sm font-normal text-[var(--text-muted)]">({selectedMemberSummary.member.phone})</span>
                        )}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] mt-1">备注: {selectedMemberSummary.member.notes || '无备注'}</p>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button className="btn btn-primary text-xs" onClick={() => { setFundOpType('deposit'); setFundModalOpen(true); }}>
                        充值金额
                      </button>
                      <button className="btn btn-secondary text-xs" onClick={() => { setFundOpType('withdraw'); setFundModalOpen(true); }}>
                        提现返还
                      </button>
                      <button className="btn btn-secondary text-xs hover:text-[var(--primary)]" onClick={() => handleCopyTextBill(selectedMemberSummary)}>
                        <Copy size={13} /> 复制微信对账文本
                      </button>
                      <button className="btn btn-secondary text-xs hover:text-[var(--primary)]" onClick={() => { setBillMemberId(selectedMemberSummary.member.id); setBillModalOpen(true); }}>
                        <Share2 size={13} /> 生成小票账单
                      </button>
                    </div>
                  </div>

                  {/* Personal Financial Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      <span className="block text-xs text-[var(--text-muted)] uppercase mb-1 font-bold">当前可用余额</span>
                      <span className="text-base font-bold text-[var(--success)]">￥{selectedMemberSummary.currentBalance.toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      <span className="block text-xs text-[var(--text-muted)] uppercase mb-1">累计充值</span>
                      <span className="text-base font-bold text-slate-100">￥{selectedMemberSummary.totalDeposit.toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      <span className="block text-xs text-[var(--text-muted)] uppercase mb-1">累计提现</span>
                      <span className="text-base font-bold text-slate-100">￥{selectedMemberSummary.totalWithdraw.toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      <span className="block text-xs text-[var(--text-muted)] uppercase mb-1">在途投注本金</span>
                      <span className="text-base font-bold text-amber-500">￥{selectedMemberSummary.activeBets.toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      <span className="block text-xs text-[var(--text-muted)] uppercase mb-1">历史累计净盈亏</span>
                      <span className={`text-base font-bold ${selectedMemberSummary.netProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {selectedMemberSummary.netProfit > 0 ? '+' : ''}￥{selectedMemberSummary.netProfit.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Personal Bets & Logs Tabs */}
                  <div className="space-y-4">
                    <h5 className="font-bold text-sm text-[var(--text-muted)] uppercase tracking-wider">最近投注历史</h5>
                    {bets.filter(b => b.memberId === selectedMemberId).length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)] py-4 text-center">暂无投注记录</p>
                    ) : (
                      <div className="table-container">
                        <table className="custom-table text-xs">
                          <thead>
                            <tr>
                              <th>时间</th>
                              <th>比赛名称</th>
                              <th>玩法</th>
                              <th>本金/赔率</th>
                              <th>状态</th>
                              <th>派奖</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bets.filter(b => b.memberId === selectedMemberId).slice(0, 5).map(b => {
                              const profit = b.payout - b.stake;
                              return (
                                <tr key={b.id}>
                                  <td>{formatDate(b.createdAt, 'short')}</td>
                                  <td className="text-bold">{b.matchName}</td>
                                  <td>{b.playType}</td>
                                  <td>
                                    ￥{b.stake} <span className="text-slate-500">@{b.odds.toFixed(2)}</span>
                                  </td>
                                  <td>
                                    <span className={`badge badge-${b.status}`}>
                                      {b.status === 'pending' ? '在途' : b.status === 'win' ? '赢' : b.status === 'half-win' ? '半赢' : b.status === 'loss' ? '输' : b.status === 'half-loss' ? '半输' : '退款'}
                                    </span>
                                  </td>
                                  <td className={b.status === 'pending' ? '' : profit >= 0 ? 'text-profit text-bold' : 'text-loss'}>
                                    {b.status === 'pending' ? '-' : `￥${b.payout.toFixed(2)}`}
                                  </td>
                                  <td>
                                    <div className="flex gap-1">
                                      {b.status === 'pending' ? (
                                        <button className="btn btn-secondary py-1 px-2 text-[10px] hover:text-emerald-400" onClick={() => openSettleModal(b)}>
                                          结算
                                        </button>
                                      ) : (
                                        <button className="btn btn-secondary py-1 px-2 text-[10px]" onClick={() => openSettleModal(b)}>
                                          重结
                                        </button>
                                      )}
                                      <button className="btn btn-secondary py-1 px-2 text-[10px] hover:text-red-400" onClick={() => handleCancelBet(b.id)}>
                                        删除
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: BET CENTER ==================== */}
        {activeTab === 'bets' && (
          <div className="space-y-6">
            {/* Input Form Box */}
            <div className="glass-panel" id="bet-entry-form-header">
              <h3 className="title-font text-lg font-bold mb-4 flex items-center gap-2">
                ✍️ 录入新的下注单 (Bet Entry)
              </h3>
              <form onSubmit={handlePlaceBet} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Line 1 */}
                <div className="form-group">
                  <label className="form-label">选择投注人</label>
                  <select 
                    className="form-input"
                    value={betMemberId}
                    onChange={e => setBetMemberId(e.target.value)}
                    required
                  >
                    <option value="">-- 请选择投注朋友 --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group suggestions-container">
                  <label className="form-label">主队 (或队伍 A)</label>
                  <input 
                    type="text" 
                    placeholder="输入或选择主队，例：阿根廷"
                    className="form-input"
                    value={betHomeTeam}
                    onChange={handleHomeTeamChange}
                    onFocus={() => setShowHomeSuggestions(true)}
                    required
                  />
                  {showHomeSuggestions && getFilteredTeams(homeTeamQuery).length > 0 && (
                    <div className="suggestions-list" onClick={e => e.stopPropagation()}>
                      {getFilteredTeams(homeTeamQuery).map(t => (
                        <div key={t.name} className="suggestion-item" onClick={() => selectHomeTeam(t)}>
                          <span>{t.flag}</span>
                          <span>{t.name}</span>
                          <span className="text-[10px] text-slate-500">({t.englishName})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group suggestions-container">
                  <label className="form-label">客队 (或队伍 B)</label>
                  <input 
                    type="text" 
                    placeholder="输入或选择客队，例：法国"
                    className="form-input"
                    value={betAwayTeam}
                    onChange={handleAwayTeamChange}
                    onFocus={() => setShowAwaySuggestions(true)}
                    required
                  />
                  {showAwaySuggestions && getFilteredTeams(awayTeamQuery).length > 0 && (
                    <div className="suggestions-list" onClick={e => e.stopPropagation()}>
                      {getFilteredTeams(awayTeamQuery).map(t => (
                        <div key={t.name} className="suggestion-item" onClick={() => selectAwayTeam(t)}>
                          <span>{t.flag}</span>
                          <span>{t.name}</span>
                          <span className="text-[10px] text-slate-500">({t.englishName})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Line 2 */}
                <div className="form-group">
                  <label className="form-label">玩法大类</label>
                  <select 
                    className="form-input"
                    value={betPlayType}
                    onChange={e => setBetPlayType(e.target.value)}
                  >
                    {PLAY_TYPES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">盘口详情 / 具体玩法</label>
                  <input 
                    type="text" 
                    placeholder="例如：大2.5球、阿根廷胜、让主-0.5"
                    className="form-input"
                    value={betPlayDetail}
                    onChange={e => setBetPlayDetail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="form-row">
                    <div>
                      <label className="form-label">下注赔率 (十进制)</label>
                      <input 
                        type="number" 
                        step="0.001" 
                        placeholder="例：1.95"
                        className="form-input"
                        value={betOdds}
                        onChange={e => setBetOdds(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">本金 (元)</label>
                      <input 
                        type="number" 
                        step="1" 
                        placeholder="下注金额"
                        className="form-input"
                        value={betStake}
                        onChange={e => setBetStake(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 实时收益计算器预览 */}
                {(calcOdds > 0 && calcStake > 0) && (
                  <div className="md:col-span-2 bg-[#0e1626]/80 border border-slate-800/60 rounded-lg p-3 space-y-1.5 backdrop-blur-sm">
                    <div className="text-[11px] text-[var(--text-muted)] font-medium tracking-wide uppercase flex items-center gap-1.5">
                      <span>📊 预期收益计算器</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-0.5">
                      <div className="bg-[#1e293b]/40 p-2.5 rounded border border-slate-800/40">
                        <div className="text-[10px] text-[var(--text-muted)]">预计返还 (本利)</div>
                        <div className="text-sm font-bold text-[var(--primary)] mt-0.5">
                          ￥{expectedPayout.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-[#1e293b]/40 p-2.5 rounded border border-slate-800/40">
                        <div className="text-[10px] text-[var(--text-muted)]">预计净利润</div>
                        <div className="text-sm font-bold text-[var(--success)] mt-0.5">
                          +￥{netProfit.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Line 3 */}
                <div className="form-group md:col-span-2 m-0">
                  <label className="form-label">注单备注</label>
                  <input 
                    type="text" 
                    placeholder="例：阿强微信发的单，帮代投"
                    className="form-input"
                    value={betNotes}
                    onChange={e => setBetNotes(e.target.value)}
                  />
                </div>

                <div className="m-0">
                  <button type="submit" className="btn btn-primary w-full h-[40px]">
                    <Plus size={16} /> 录入此注单
                  </button>
                </div>
              </form>
            </div>

            {/* List and Filters */}
            <div className="glass-panel">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h3 className="title-font text-lg font-bold">📋 投注注单历史</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-secondary text-xs" onClick={handleExportBets}>
                    <Download size={14} /> 导出注单报表
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="search-filter-bar">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text"
                    placeholder="搜比赛、投注人、玩法或备注..."
                    className="form-input pl-10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <select 
                    className="form-input"
                    value={betFilterStatus}
                    onChange={e => setBetFilterStatus(e.target.value)}
                  >
                    <option value="all">所有结算状态</option>
                    <option value="pending">在途 (未结算)</option>
                    <option value="win">赢</option>
                    <option value="half-win">半赢</option>
                    <option value="loss">输</option>
                    <option value="half-loss">半输</option>
                    <option value="void">走水/退款</option>
                  </select>
                </div>
                <div>
                  <select 
                    className="form-input"
                    value={betFilterMember}
                    onChange={e => setBetFilterMember(e.target.value)}
                  >
                    <option value="all">所有成员</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                {(betFilterStatus !== 'all' || betFilterMember !== 'all' || searchQuery !== '') && (
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => { setBetFilterStatus('all'); setBetFilterMember('all'); setSearchQuery(''); }}
                  >
                    重置筛选
                  </button>
                )}
              </div>

              {/* Bets Table */}
              {filteredBets.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-muted)]">
                  暂无匹配的注单记录。
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table text-sm">
                    <thead>
                      <tr>
                        <th>时间</th>
                        <th>投注人</th>
                        <th>赛事对阵</th>
                        <th>具体玩法</th>
                        <th>本金 / 赔率</th>
                        <th>状态</th>
                        <th>派奖金额</th>
                        <th>净盈亏</th>
                        <th>备注</th>
                        <th className="text-right">结算与操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBets.map(b => {
                        const profit = b.payout - b.stake;
                        return (
                          <tr key={b.id}>
                            <td className="text-xs">{formatDate(b.createdAt, 'short')}</td>
                            <td className="text-bold">{b.memberName}</td>
                            <td className="text-bold text-[var(--text-main)]">{b.matchName}</td>
                            <td className="text-slate-300">{b.playType}</td>
                            <td>
                              ￥{b.stake} <span className="text-[var(--text-muted)]">@{b.odds.toFixed(2)}</span>
                            </td>
                            <td>
                              <span className={`badge badge-${b.status}`}>
                                {b.status === 'pending' ? '在途' : b.status === 'win' ? '赢' : b.status === 'half-win' ? '半赢' : b.status === 'loss' ? '输' : b.status === 'half-loss' ? '半输' : '退款'}
                              </span>
                            </td>
                            <td className={b.status === 'pending' ? '' : 'text-bold'}>
                              {b.status === 'pending' ? '-' : `￥${b.payout.toFixed(2)}`}
                            </td>
                            <td className={b.status === 'pending' ? '' : profit > 0 ? 'text-profit text-bold' : profit < 0 ? 'text-loss' : 'text-slate-400'}>
                              {b.status === 'pending' ? '-' : `${profit >= 0 ? '+' : ''}￥${profit.toFixed(2)}`}
                            </td>
                            <td className="text-xs text-[var(--text-muted)] max-w-[120px] truncate" title={b.notes}>{b.notes || '-'}</td>
                            <td className="text-right">
                              <div className="flex justify-end gap-1">
                                {b.status === 'pending' ? (
                                  <button className="btn btn-success py-1 px-3 text-xs" onClick={() => openSettleModal(b)}>
                                    结单
                                  </button>
                                ) : (
                                  <button className="btn btn-secondary py-1 px-2 text-xs" onClick={() => openSettleModal(b)}>
                                    重新结算
                                  </button>
                                )}
                                <button className="btn btn-danger py-1 px-2 text-xs btn-icon-only" onClick={() => handleCancelBet(b.id)}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: LEDGER / TRANSACTIONS ==================== */}
        {activeTab === 'transactions' && (
          <div className="glass-panel">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <h3 className="title-font text-lg font-bold">💸 资金流水历史</h3>
              <button className="btn btn-secondary text-xs" onClick={handleExportTransactions}>
                <Download size={14} /> 导出流水报表
              </button>
            </div>

            {/* Filters */}
            <div className="search-filter-bar">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text"
                  placeholder="搜索流水描述或关联成员..."
                  className="form-input pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <select 
                  className="form-input"
                  value={txFilterType}
                  onChange={e => setTxFilterType(e.target.value)}
                >
                  <option value="all">所有流水类型</option>
                  <option value="deposit">存入 (充值)</option>
                  <option value="withdraw">提取 (取款)</option>
                  <option value="bet_place">下注扣款</option>
                  <option value="bet_payout">派奖回款</option>
                  <option value="bet_refund">走水退款</option>
                  <option value="manual_adjust">手动调整</option>
                </select>
              </div>
              <div>
                <select 
                  className="form-input"
                  value={txFilterMember}
                  onChange={e => setTxFilterMember(e.target.value)}
                >
                  <option value="all">所有成员</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              {(txFilterType !== 'all' || txFilterMember !== 'all' || searchQuery !== '') && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => { setTxFilterType('all'); setTxFilterMember('all'); setSearchQuery(''); }}
                >
                  重置
                </button>
              )}
            </div>

            {/* Transactions Table */}
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                暂无流水记录。
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table text-sm">
                  <thead>
                    <tr>
                      <th>时间</th>
                      <th>成员</th>
                      <th>变动类型</th>
                      <th>变动金额</th>
                      <th>流水详情</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(t => {
                      const typeCn = {
                        deposit: '充值',
                        withdraw: '取款',
                        bet_place: '下注扣款',
                        bet_payout: '派奖回款',
                        bet_refund: '走水退款',
                        manual_adjust: '手动调整'
                      }[t.type] || t.type;
                      
                      const isPositive = t.amount > 0;
                      
                      return (
                        <tr key={t.id}>
                          <td>{formatDate(t.createdAt)}</td>
                          <td className="text-bold">{t.memberName}</td>
                          <td>
                            <span className={`badge ${
                              t.type === 'deposit' || t.type === 'bet_payout' ? 'badge-win' : 
                              t.type === 'withdraw' || t.type === 'bet_place' ? 'badge-loss' : 'badge-void'
                            }`}>
                              {typeCn}
                            </span>
                          </td>
                          <td className={`text-bold ${isPositive ? 'text-profit' : 'text-loss'}`}>
                            {isPositive ? '+' : ''}￥{t.amount.toFixed(2)}
                          </td>
                          <td className="text-slate-300">{t.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- Footer Note --- */}
      <footer className="py-6 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
        🏆 2026 北美世界杯投注对账管家 | 数据保存在本地浏览器中，请注意及时备份。
      </footer>

      {/* ==================== MODAL 1: FUND OPERATION (DEPOSIT/WITHDRAW) ==================== */}
      {fundModalOpen && selectedMemberSummary && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md bg-[var(--bg-card-solid)] border-[var(--primary)] border-t-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="title-font text-lg font-bold">
                {fundOpType === 'deposit' ? '💰 朋友存入充值' : '💸 朋友提取返还'} ({selectedMemberSummary.member.name})
              </h3>
            </div>
            <form onSubmit={handleFundOperation} className="space-y-4">
              <div className="bg-slate-900 p-3 rounded border border-slate-800 text-sm">
                当前可用余额: <span className="text-profit text-bold">￥{selectedMemberSummary.currentBalance.toFixed(2)}</span>
              </div>
              <div className="form-group">
                <label className="form-label">{fundOpType === 'deposit' ? '充值金额 (元)' : '提现/返还金额 (元)'}</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="请输入变动金额"
                  className="form-input text-lg font-bold"
                  value={fundAmount}
                  onChange={e => setFundAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">备注说明</label>
                <input 
                  type="text" 
                  placeholder="例：微信红包、支付宝转账、退还本金"
                  className="form-input"
                  value={fundNotes}
                  onChange={e => setFundNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-5 justify-end pt-2">
                <button type="button" className="btn btn-secondary" onClick={() => setFundModalOpen(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  确认录入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: SETTLE BET MODAL ==================== */}
      {settleModalOpen && settleBetId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          {(() => {
            const bet = bets.find(b => b.id === settleBetId);
            if (!bet) return null;
            return (
              <div className="glass-panel w-full max-w-md bg-[var(--bg-card-solid)] border-[var(--primary)] border-t-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="title-font text-lg font-bold">
                    ⚽ 结算投注单 (Settle Bet)
                  </h3>
                </div>
                <form onSubmit={handleSettleBet} className="space-y-4">
                  <div className="bg-slate-900 p-3 rounded text-xs text-slate-300 space-y-1">
                    <div><span className="text-slate-500">投注人:</span> <span className="font-bold text-white">{bet.memberName}</span></div>
                    <div><span className="text-slate-500">赛事对阵:</span> <span className="font-bold text-white">{bet.matchName}</span></div>
                    <div><span className="text-slate-500">玩法详情:</span> <span className="text-[var(--primary)]">{bet.playType}</span></div>
                    <div><span className="text-slate-500">下注本金:</span> ￥{bet.stake} | <span className="text-slate-500">赔率:</span> @{bet.odds.toFixed(2)}</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">结算赛果</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        type="button" 
                        className={`btn py-2 text-xs ${settleStatus === 'win' ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => handleSettleStatusChange('win')}
                      >
                        ✅ 赢 (全赢)
                      </button>
                      <button 
                        type="button" 
                        className={`btn py-2 text-xs ${settleStatus === 'half-win' ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => handleSettleStatusChange('half-win')}
                      >
                        ⚠️ 半赢
                      </button>
                      <button 
                        type="button" 
                        className={`btn py-2 text-xs ${settleStatus === 'loss' ? 'bg-red-500 text-black' : 'btn-secondary'}`}
                        onClick={() => handleSettleStatusChange('loss')}
                      >
                        ❌ 输 (全输)
                      </button>
                      <button 
                        type="button" 
                        className={`btn py-2 text-xs ${settleStatus === 'half-loss' ? 'bg-red-400 text-black' : 'btn-secondary'}`}
                        onClick={() => handleSettleStatusChange('half-loss')}
                      >
                        📉 半输
                      </button>
                      <button 
                        type="button" 
                        className={`btn py-2 text-xs ${settleStatus === 'void' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleSettleStatusChange('void')}
                      >
                        🔄 走水/退本金
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">实际派奖返还 (元)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="返还总金额"
                      className="form-input text-lg font-bold"
                      value={settlePayout}
                      onChange={e => setSettlePayout(e.target.value)}
                      required
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {settleStatus === 'win' && `全赢理论派奖: ￥${(bet.stake * bet.odds).toFixed(2)}`}
                      {settleStatus === 'half-win' && `半赢理论派奖: ￥${(bet.stake + bet.stake * (bet.odds - 1) / 2).toFixed(2)}`}
                      {settleStatus === 'loss' && '全输返还金额为 0 元'}
                      {settleStatus === 'half-loss' && `半输返回一半本金: ￥${(bet.stake / 2).toFixed(2)}`}
                      {settleStatus === 'void' && `走水退回原投注本金: ￥${bet.stake}`}
                    </span>
                  </div>

                  <div className="flex gap-5 justify-end pt-2">
                    <button type="button" className="btn btn-secondary" onClick={() => setSettleModalOpen(false)}>
                      取消
                    </button>
                    <button type="submit" className="btn btn-primary">
                      确认结算
                    </button>
                  </div>
                </form>
              </div>
            );
          })()}
        </div>
      )}

      {/* ==================== MODAL 4: SYSTEM SETTINGS & CLOUD SYNC ==================== */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setSettingsModalOpen(false)}>
          <div className="glass-panel w-full max-w-lg bg-[var(--bg-card-solid)] border-[var(--primary)] border-t-4 p-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="title-font text-xl font-bold flex items-center gap-2 text-[var(--primary)] m-0">
                ⚙️ 系统管理与云端同步
              </h3>
            </div>

            <div className="space-y-6">
              {/* Part 1: Supabase Configuration */}
              <div className="bg-[#0e1626] p-4 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                  ☁️ Supabase 数据库同步
                </h4>
                
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg text-xs border border-slate-900">
                  <span className="text-slate-400">当前运行模式:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    dbMode === 'supabase' 
                      ? (dbConnected ? 'bg-emerald-950/80 text-profit' : 'bg-red-950/80 text-danger') 
                      : 'bg-slate-900 text-slate-400'
                  }`}>
                    {dbMode === 'supabase' ? (dbConnected ? '🟢 已连通云端' : '🔴 连接云端失败') : '⚪ 本地离线模式'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="form-group text-xs m-0 text-left">
                    <label className="form-label text-[10px] text-slate-400 mb-1">Supabase API URL</label>
                    <input 
                      type="text" 
                      placeholder="https://your-project.supabase.co"
                      className="form-input text-xs py-2 bg-slate-950"
                      value={supabaseUrl}
                      onChange={e => setSupabaseUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group text-xs m-0 text-left">
                    <label className="form-label text-[10px] text-slate-400 mb-1">Supabase Anon Key</label>
                    <input 
                      type="password" 
                      placeholder="输入以 eyJhbGci 开头的密钥"
                      className="form-input text-xs py-2 bg-slate-950"
                      value={supabaseKey}
                      onChange={e => setSupabaseKey(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1.5">
                    {dbMode === 'local' ? (
                      <button 
                        type="button" 
                        className="btn btn-primary text-xs py-2 h-[36px]"
                        onClick={() => handleToggleDbMode('supabase')}
                        disabled={syncing}
                      >
                        开启云同步
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className="btn btn-danger text-xs py-2 h-[36px]"
                        onClick={() => handleToggleDbMode('local')}
                        disabled={syncing}
                      >
                        关闭云同步
                      </button>
                    )}

                    <button 
                      type="button" 
                      className="btn btn-secondary text-xs py-2 h-[36px] flex justify-center items-center gap-1.5"
                      onClick={handleRefreshCloud}
                      disabled={syncing || dbMode !== 'supabase'}
                    >
                      <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} /> 
                      刷新数据
                    </button>
                  </div>

                  {dbMode === 'supabase' && (
                    <button
                      type="button"
                      className="btn btn-secondary w-full text-xs py-2 h-[36px] hover:text-[var(--primary)] border border-dashed border-slate-700 mt-2"
                      onClick={uploadLocalDataToCloud}
                      disabled={syncing}
                    >
                      🔼 上传本地数据覆盖到云端
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-900 pt-2.5">
                  <details className="text-[10px] text-slate-500 cursor-pointer">
                    <summary className="hover:text-slate-300 font-bold select-none">🛠️ 查看建表 SQL 脚本</summary>
                    <pre className="mt-2 p-2 bg-slate-950 rounded text-[9px] text-slate-400 overflow-x-auto select-all leading-normal whitespace-pre text-left max-h-[140px]">
{`create table if not exists wc_members (
  id text primary key,
  name text not null,
  phone text,
  notes text,
  created_at bigint not null
);

create table if not exists wc_bets (
  id text primary key,
  member_id text not null references wc_members(id) on delete cascade,
  member_name text not null,
  match_name text not null,
  play_type text not null,
  odds numeric not null,
  stake numeric not null,
  status text not null,
  payout numeric not null,
  created_at bigint not null,
  settled_at bigint,
  notes text
);

create table if not exists wc_transactions (
  id text primary key,
  member_id text not null references wc_members(id) on delete cascade,
  member_name text not null,
  type text not null,
  amount numeric not null,
  related_id text,
  description text not null,
  created_at bigint not null
);

alter table wc_members disable row level security;
alter table wc_bets disable row level security;
alter table wc_transactions disable row level security;`}
                    </pre>
                  </details>
                </div>
              </div>

              {/* Part 2: Local Data Actions */}
              <div className="bg-[#0e1626] p-4 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                  💾 数据备份与维护
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn btn-secondary text-xs h-[38px] flex items-center justify-center gap-1.5" onClick={() => { handleBackup(); setSettingsModalOpen(false); }}>
                    <Download size={13} /> 备份导出 (.json)
                  </button>
                  <button className="btn btn-secondary text-xs h-[38px] flex items-center justify-center gap-1.5" onClick={() => { handleImportClick(); setSettingsModalOpen(false); }}>
                    <Upload size={13} /> 恢复导入 (.json)
                  </button>
                  <button className="btn btn-secondary text-xs h-[38px] flex items-center justify-center gap-1.5 hover:text-emerald-400" onClick={() => { handleLoadMockData(); setSettingsModalOpen(false); }}>
                    <RefreshCw size={13} /> 载入演示数据
                  </button>
                  <button className="btn btn-danger text-xs h-[38px] flex items-center justify-center gap-1.5" onClick={() => { handleResetData(); setSettingsModalOpen(false); }}>
                    <Trash2 size={13} /> 清空所有数据
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="btn btn-secondary text-xs py-2 px-5" onClick={() => setSettingsModalOpen(false)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 3: WECHAT STYLE BILL GENERATOR ==================== */}
      {billModalOpen && billMemberId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          {(() => {
            const summary = memberSummaries.find(ms => ms.member.id === billMemberId);
            if (!summary) return null;
            
            const memberBets = bets.filter(b => b.memberId === summary.member.id);
            const active = memberBets.filter(b => b.status === 'pending');
            const settled = memberBets.filter(b => b.status !== 'pending').slice(0, 5); // show recent 5 settled
            
            return (
              <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3 text-slate-400 px-2">
                  <span className="text-xs">微信群账单分享小票预览 (可截图分享)</span>
                </div>
                
                {/* Visual Bill Card */}
                <div className="wechat-bill-card">
                  <div className="bill-header">
                    <h4 className="title-font text-lg font-black tracking-widest text-[var(--primary)]">2026 世界杯投注对账单</h4>
                    <span className="text-[10px] text-slate-500 block mt-1">GENERATED ON: {new Date().toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="bill-item">
                      <span className="text-slate-400">成员姓名</span>
                      <span className="font-bold text-white">{summary.member.name}</span>
                    </div>
                    {summary.member.phone && (
                      <div className="bill-item">
                        <span className="text-slate-400">联系方式</span>
                        <span className="text-slate-300">{summary.member.phone}</span>
                      </div>
                    )}
                    
                    <div className="bill-divider"></div>

                    <div className="bill-item">
                      <span className="text-slate-400">累计充值</span>
                      <span className="text-slate-200">￥{summary.totalDeposit.toFixed(2)}</span>
                    </div>
                    <div className="bill-item">
                      <span className="text-slate-400">累计提现</span>
                      <span className="text-slate-200">￥{summary.totalWithdraw.toFixed(2)}</span>
                    </div>
                    <div className="bill-item">
                      <span className="text-slate-400">进行中投注 (在途)</span>
                      <span className="text-amber-500 font-bold">￥{summary.activeBets.toFixed(2)}</span>
                    </div>
                    <div className="bill-item">
                      <span className="text-slate-400">累计已结算盈亏</span>
                      <span className={`font-bold ${summary.netProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {summary.netProfit >= 0 ? '+' : ''}￥{summary.netProfit.toFixed(2)}
                      </span>
                    </div>

                    <div className="bill-divider"></div>

                    <div className="bill-item text-base">
                      <span className="font-bold text-[var(--primary)]">当前账户可用余额</span>
                      <span className="font-black text-profit">￥{summary.currentBalance.toFixed(2)}</span>
                    </div>

                    {active.length > 0 && (
                      <>
                        <div className="bill-divider"></div>
                        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2">⏳ 在途注单 ({active.length}笔)</div>
                        <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                          {active.map(b => (
                            <div key={b.id} className="text-xs bg-slate-900/60 p-2 rounded border border-slate-800/80 flex justify-between gap-2">
                              <div className="truncate">
                                <div className="font-bold text-slate-300 truncate">{b.matchName}</div>
                                <div className="text-[10px] text-slate-500 truncate">{b.playType.split(' - ')[0]}</div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="font-bold text-slate-200">￥{b.stake}</span>
                                <div className="text-[10px] text-slate-500">@{b.odds}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {settled.length > 0 && (
                      <>
                        <div className="bill-divider"></div>
                        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2">✅ 最近结算注单</div>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                          {settled.map(b => {
                            const profit = b.payout - b.stake;
                            const isWin = b.status === 'win' || b.status === 'half-win';
                            return (
                              <div key={b.id} className="text-xs bg-slate-900/60 p-2 rounded border border-slate-800/80 flex justify-between gap-2">
                                <div className="truncate">
                                  <div className="font-bold text-slate-300 truncate">{b.matchName}</div>
                                  <div className="text-[10px] text-slate-500 truncate">{b.playType.split(' - ')[0]}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="font-bold text-slate-200">￥{b.stake} → ￥{b.payout.toFixed(0)}</div>
                                  <div className={`text-[10px] ${isWin ? 'text-profit' : b.status === 'void' ? 'text-slate-400' : 'text-loss'}`}>
                                    {isWin ? '🟢 赢' : b.status === 'void' ? '⚪ 走水' : '🔴 输'} ({profit >= 0 ? '+' : ''}{profit.toFixed(0)})
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bill-footer text-center">
                    <p>数据录入仅限本地对账参考</p>
                    <p className="mt-1 text-[var(--primary-glow)]">🏆 祝您和朋友们的世界杯旅程好运连连！ 🏆</p>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex gap-3 justify-center mt-4">
                  <button className="btn btn-primary w-1/2" onClick={() => handleCopyTextBill(summary)}>
                    <Copy size={14} /> 复制文字账单
                  </button>
                  <button className="btn btn-secondary w-1/2" onClick={() => setBillModalOpen(false)}>
                    关闭预览
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
