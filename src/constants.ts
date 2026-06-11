export interface Team {
  name: string;
  englishName: string;
  flag: string;
  confederation: string;
}

export const WORLD_CUP_TEAMS: Team[] = [
  // AFC (Asia)
  { name: '日本', englishName: 'Japan', flag: '🇯🇵', confederation: 'AFC' },
  { name: '韩国', englishName: 'South Korea', flag: '🇰🇷', confederation: 'AFC' },
  { name: '澳大利亚', englishName: 'Australia', flag: '🇦🇺', confederation: 'AFC' },
  { name: '沙特阿拉伯', englishName: 'Saudi Arabia', flag: '🇸🇦', confederation: 'AFC' },
  { name: '伊朗', englishName: 'Iran', flag: '🇮🇷', confederation: 'AFC' },
  { name: '卡塔尔', englishName: 'Qatar', flag: '🇶🇦', confederation: 'AFC' },
  { name: '伊拉克', englishName: 'Iraq', flag: '🇮🇶', confederation: 'AFC' },
  { name: '约旦', englishName: 'Jordan', flag: '🇯🇴', confederation: 'AFC' },
  { name: '阿联酋', englishName: 'UAE', flag: '🇦🇪', confederation: 'AFC' },
  { name: '乌兹别克斯坦', englishName: 'Uzbekistan', flag: '🇺🇿', confederation: 'AFC' },

  // UEFA (Europe)
  { name: '法国', englishName: 'France', flag: '🇫🇷', confederation: 'UEFA' },
  { name: '英格兰', englishName: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA' },
  { name: '西班牙', englishName: 'Spain', flag: '🇪🇸', confederation: 'UEFA' },
  { name: '德国', englishName: 'Germany', flag: '🇩🇪', confederation: 'UEFA' },
  { name: '葡萄牙', englishName: 'Portugal', flag: '🇵🇹', confederation: 'UEFA' },
  { name: '意大利', englishName: 'Italy', flag: '🇮🇹', confederation: 'UEFA' },
  { name: '荷兰', englishName: 'Netherlands', flag: '🇳🇱', confederation: 'UEFA' },
  { name: '比利时', englishName: 'Belgium', flag: '🇧🇪', confederation: 'UEFA' },
  { name: '克罗地亚', englishName: 'Croatia', flag: '🇭🇷', confederation: 'UEFA' },
  { name: '丹麦', englishName: 'Denmark', flag: '🇩🇰', confederation: 'UEFA' },
  { name: '瑞士', englishName: 'Switzerland', flag: '🇨🇭', confederation: 'UEFA' },
  { name: '土耳其', englishName: 'Turkey', flag: '🇹🇷', confederation: 'UEFA' },
  { name: '奥地利', englishName: 'Austria', flag: '🇦🇹', confederation: 'UEFA' },
  { name: '乌克兰', englishName: 'Ukraine', flag: '🇺🇦', confederation: 'UEFA' },
  { name: '波兰', englishName: 'Poland', flag: '🇵🇱', confederation: 'UEFA' },
  { name: '匈牙利', englishName: 'Hungary', flag: '🇭🇺', confederation: 'UEFA' },

  // CONMEBOL (South America)
  { name: '阿根廷', englishName: 'Argentina', flag: '🇦🇷', confederation: 'CONMEBOL' },
  { name: '巴西', englishName: 'Brazil', flag: '🇧🇷', confederation: 'CONMEBOL' },
  { name: '乌拉圭', englishName: 'Uruguay', flag: '🇺🇾', confederation: 'CONMEBOL' },
  { name: '哥伦比亚', englishName: 'Colombia', flag: '🇨🇴', confederation: 'CONMEBOL' },
  { name: '厄瓜多尔', englishName: 'Ecuador', flag: '🇪🇨', confederation: 'CONMEBOL' },
  { name: '巴拉圭', englishName: 'Paraguay', flag: '🇵🇾', confederation: 'CONMEBOL' },
  { name: '委内瑞拉', englishName: 'Venezuela', flag: '🇻🇪', confederation: 'CONMEBOL' },
  { name: '智利', englishName: 'Chile', flag: '🇨🇱', confederation: 'CONMEBOL' },

  // CONCACAF (North/Central America)
  { name: '美国', englishName: 'United States', flag: '🇺🇸', confederation: 'CONCACAF' },
  { name: '墨西哥', englishName: 'Mexico', flag: '🇲🇽', confederation: 'CONCACAF' },
  { name: '加拿大', englishName: 'Canada', flag: '🇨🇦', confederation: 'CONCACAF' },
  { name: '巴拿马', englishName: 'Panama', flag: '🇵🇦', confederation: 'CONCACAF' },
  { name: '牙买加', englishName: 'Jamaica', flag: '🇯🇲', confederation: 'CONCACAF' },
  { name: '哥斯达黎加', englishName: 'Costa Rica', flag: '🇨🇷', confederation: 'CONCACAF' },
  { name: '洪都拉斯', englishName: 'Honduras', flag: '🇭🇳', confederation: 'CONCACAF' },

  // CAF (Africa)
  { name: '摩洛哥', englishName: 'Morocco', flag: '🇲🇦', confederation: 'CAF' },
  { name: '塞内加尔', englishName: 'Senegal', flag: '🇸🇳', confederation: 'CAF' },
  { name: '突尼斯', englishName: 'Tunisia', flag: '🇹🇳', confederation: 'CAF' },
  { name: '阿尔及利亚', englishName: 'Algeria', flag: '🇩🇿', confederation: 'CAF' },
  { name: '埃及', englishName: 'Egypt', flag: '🇪🇬', confederation: 'CAF' },
  { name: '尼日利亚', englishName: 'Nigeria', flag: '🇳🇬', confederation: 'CAF' },
  { name: '喀麦隆', englishName: 'Cameroon', flag: '🇨🇲', confederation: 'CAF' },
  { name: '科特迪瓦', englishName: 'Ivory Coast', flag: '🇨🇮', confederation: 'CAF' },
  { name: '加纳', englishName: 'Ghana', flag: '🇬🇭', confederation: 'CAF' },
  { name: '南非', englishName: 'South Africa', flag: '🇿🇦', confederation: 'CAF' },

  // OFC (Oceania)
  { name: '新西兰', englishName: 'New Zealand', flag: '🇳🇿', confederation: 'OFC' }
];

export const PLAY_TYPES = [
  '独赢 (主客和)',
  '让球盘 (亚洲盘)',
  '大小盘 (进球数)',
  '波胆 (确切比分)',
  '双重机会',
  '双方进球',
  '半全场',
  '冠军/特别投注',
  '其他'
];
