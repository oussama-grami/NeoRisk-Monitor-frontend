export interface QuickStat {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
}
