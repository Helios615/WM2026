export type BetStatus = 'pending' | 'win' | 'half-win' | 'loss' | 'half-loss' | 'void';

export interface Member {
  id: string;
  name: string;
  phone: string;
  notes: string;
  createdAt: number;
}

export interface Bet {
  id: string;
  memberId: string;
  memberName: string; // Denormalized for convenience
  matchName: string;   // e.g., "Argentina vs France"
  playType: string;    // e.g., "Home Win", "Handicap Argentina -0.5"
  odds: number;        // Decimal odds, e.g., 1.95
  stake: number;       // Betting amount in CNY
  status: BetStatus;
  payout: number;      // Returned money, only set when settled. (0 for loss, stake*odds for win, stake for void)
  createdAt: number;
  settledAt?: number;
  notes?: string;
}

export type TransactionType = 'deposit' | 'withdraw' | 'bet_place' | 'bet_payout' | 'bet_refund' | 'manual_adjust';

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  type: TransactionType;
  amount: number;      // Positive for money in (deposit, payout, refund), negative for money out (withdraw, place)
  relatedId?: string;  // e.g., betId if it is a bet placement or payout
  description: string; // Description like "Deposit 1000元" or "Bet on Argentina vs France"
  createdAt: number;
}

export interface MemberSummary {
  member: Member;
  totalDeposit: number;   // Sum of deposits
  totalWithdraw: number;  // Sum of withdrawals
  activeBets: number;     // Sum of stakes of pending bets
  netProfit: number;      // Payouts - Stakes of settled bets
  currentBalance: number; // totalDeposit - totalWithdraw + netProfit - activeBets
}
