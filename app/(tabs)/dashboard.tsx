import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useAppStore } from '../../src/store/appStore';
import { netWorthService } from '../../src/services/netWorthService';
import { accountService } from '../../src/services/accountService';
import { Button } from '../../src/components/Button';
import { Account } from '../../src/types';
import { AppTheme, useAppTheme } from '../../src/theme';

const NET_WORTH_CARD_HORIZONTAL_PADDING = 24;

const ACCOUNT_META: Record<
  Account['accountType'],
  { label: string; emoji: string; color: string }
> = {
  cash: { label: 'Cash', emoji: '💵', color: '#10b981' },
  investment: { label: 'Investments', emoji: '📈', color: '#3b82f6' },
  credit: { label: 'Credit', emoji: '💳', color: '#ef4444' },
  loan: { label: 'Loans', emoji: '🏦', color: '#dc2626' },
  crypto: { label: 'Crypto', emoji: '🪙', color: '#f59e0b' },
  other: { label: 'Other', emoji: '🧾', color: '#6366f1' },
};

const groupingOptions = [
  { key: 'institution', label: 'Institution', emoji: '🏦' },
  { key: 'type', label: 'Account Type', emoji: '🧾' },
  { key: 'currency', label: 'Currency', emoji: '💱' },
  { key: 'balance', label: 'Balance Band', emoji: '📊' },
] as const;

type ValueMode = 'net' | 'assets';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const netWorth = useAppStore((state) => state.netWorth);
  const accounts = useAppStore((state) => state.accounts);
  const setNetWorth = useAppStore((state) => state.setNetWorth);
  const setAccounts = useAppStore((state) => state.setAccounts);
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const accountList = useMemo(
    () => (Array.isArray(accounts) ? accounts : []),
    [accounts]
  );

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'institution' | 'type' | 'currency' | 'balance'>(
    'institution'
  );
  const [accountsExpanded, setAccountsExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const valueModes = useMemo(() => ['net', 'assets'] as const, []);
  const [valuePage, setValuePage] = useState(0);
  const [cardWidth, setCardWidth] = useState(() =>
    Math.max(
      Dimensions.get('window').width - 32 - NET_WORTH_CARD_HORIZONTAL_PADDING * 2,
      240
    )
  );
  const carouselRef = useRef<ScrollView | null>(null);
  const valueMode = valueModes[valuePage];
  const [showAssetBreakdown, setShowAssetBreakdown] = useState(true);
  const snapOffsets = useMemo(() => {
    if (!cardWidth) return undefined;
    return valueModes.map((_, index) => index * cardWidth);
  }, [cardWidth, valueModes]);

  const scrollToValuePage = useCallback(
    (index: number, animated = true) => {
      if (!carouselRef.current || !cardWidth) return;
      const target = Math.min(valueModes.length - 1, Math.max(0, index));
      carouselRef.current.scrollTo({ x: target * cardWidth, y: 0, animated });
    },
    [cardWidth, valueModes]
  );

  const handleCardLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width =
        event.nativeEvent.layout.width - NET_WORTH_CARD_HORIZONTAL_PADDING * 2;
      if (!width || Math.abs(width - cardWidth) < 1) return;
      const nextWidth = Math.max(width, 200);
      setCardWidth(nextWidth);
      requestAnimationFrame(() => {
        carouselRef.current?.scrollTo({ x: valuePage * nextWidth, y: 0, animated: false });
      });
    },
    [cardWidth, valuePage]
  );

  const handleValueScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!cardWidth) return;
      const offset = event.nativeEvent.contentOffset.x;
      const index = Math.round(offset / cardWidth);
      const next = Math.min(valueModes.length - 1, Math.max(0, index));
      scrollToValuePage(next, false);
      setValuePage((prev) => (prev === next ? prev : next));
    },
    [cardWidth, valueModes]
  );

  const loadData = async () => {
    if (!user) return;

    try {
      const [netWorthData, accountsResponse] = await Promise.all([
        netWorthService.getCachedNetWorth(user.id).catch((err) => {
          if (err.response?.status === 404) {
            console.log('No cached net worth yet – link an account to calculate');
            return null;
          }
          throw err;
        }),
        accountService.listAccounts(user.id).catch((err) => {
          if (err.response?.status === 404) {
            console.log('No accounts connected yet');
            return [];
          }
          throw err;
        }),
      ]);

      const accountsList = accountsResponse || [];
      setAccounts(accountsList);

      let resolvedNetWorth = netWorthData;

      if (!resolvedNetWorth && accountsList.length > 0) {
        try {
          console.log('No cached net worth found – requesting fresh calculation');
          resolvedNetWorth = await netWorthService.calculateNetWorth(user.id);
        } catch (err: any) {
          if (err.response?.status !== 404) {
            console.error('Failed to calculate net worth:', err);
          }
        }
      }

      setNetWorth(resolvedNetWorth || null);
    } catch (error: any) {
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        console.error('Failed to load dashboard data:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const assetSegments = useMemo(() => {
    const segments: {
      key: string;
      label: string;
      value: number;
      color: string;
      emoji: string;
      percent: number;
    }[] = [];

    const appendSegment = (key: string, value: number) => {
      if (!value || value <= 0) return;
      const meta = ACCOUNT_META[key as keyof typeof ACCOUNT_META] ?? ACCOUNT_META.other;
      segments.push({
        key,
        label: meta.label,
        value,
        color: meta.color,
        emoji: meta.emoji,
        percent: 0,
      });
    };

    const addFromAccounts = () => {
      const sums: Record<Account['accountType'], number> = {
        cash: 0,
        investment: 0,
        credit: 0,
        loan: 0,
        crypto: 0,
        other: 0,
      };

      accountList.forEach((account) => {
        const type = account.accountType ?? 'other';
        sums[type] += account.balance || 0;
      });

      (Object.keys(sums) as Account['accountType'][]).forEach((type) => {
        const value = type === 'credit' || type === 'loan' ? Math.abs(sums[type]) : sums[type];
        appendSegment(type, value);
      });
    };

    if (netWorth && netWorth.breakdown) {
      appendSegment('cash', netWorth.breakdown.cash ?? 0);
      appendSegment('investment', netWorth.breakdown.investments ?? 0);
      appendSegment('crypto', netWorth.breakdown.crypto ?? 0);
      appendSegment('credit', Math.abs(netWorth.breakdown.credit ?? 0));
      appendSegment('loan', Math.abs(netWorth.breakdown.loans ?? 0));
    }

    if (!segments.length && accountList.length) {
      addFromAccounts();
    }

    const filtered = segments.filter((segment) =>
      valueMode === 'assets' ? !['credit', 'loan'].includes(segment.key) : true
    );

    const total = filtered.reduce((sum, segment) => sum + segment.value, 0);
    if (!total) return [];

    return filtered
      .sort((a, b) => b.value - a.value)
      .map((segment) => ({
        ...segment,
        percent: Math.round((segment.value / total) * 100),
      }));
  }, [accountList, netWorth, valueMode]);

  const topHolding = useMemo(() => {
    if (!assetSegments.length) return null;
    return assetSegments[0];
  }, [assetSegments]);

  const totalAccountsBalance = useMemo(() => {
    return accountList.reduce((total, account) => total + (account.balance || 0), 0);
  }, [accountList]);

  const totals = useMemo(() => {
    const assets = netWorth?.totalAssets ?? totalAccountsBalance;
    const liabilities = Math.max(netWorth?.totalLiabilities ?? 0, 0);
    const net = netWorth ? netWorth.netWorth : assets - liabilities;
    return {
      assets,
      liabilities,
      net,
    };
  }, [netWorth, totalAccountsBalance]);

  const getValueStats = useCallback(
    (mode: ValueMode) => {
      if (!netWorth) {
        return {
          change: null as { delta: number; percent: number; positive: boolean } | null,
        };
      }

      const history = (netWorth as any)?.history as
        | { netWorth?: number; assets?: number; liabilities?: number; value?: number }[]
        | undefined;

      const extractValue = (point: any) => {
        if (mode === 'assets') {
          return point?.assets ?? point?.value ?? point?.netWorth ?? 0;
        }
        if (typeof point?.netWorth === 'number') return point.netWorth;
        if (typeof point?.value === 'number') return point.value;
        const assets = point?.assets ?? 0;
        const liabilities = point?.liabilities ?? 0;
        return assets - liabilities;
      };

      const computeChange = (points: number[]) => {
        if (points.length < 2) {
          return null;
        }
        const start = points[0];
        const end = points[points.length - 1];
        const delta = end - start;
        const percent = start !== 0 ? (delta / Math.abs(start)) * 100 : 0;

        return { delta, percent, positive: delta >= 0 };
      };

      const values = Array.isArray(history)
        ? history.map(extractValue).filter((value) => Number.isFinite(value))
        : [];

      if (values.length > 1) {
        const change = computeChange(values);
        return { change };
      }

      const base =
        mode === 'assets'
          ? netWorth?.totalAssets ?? totals.assets
          : netWorth?.netWorth ?? totals.net;

      if (!base || base <= 0) {
        return { change: null };
      }

      return { change: null };
    },
    [netWorth, totals.assets, totals.net]
  );

  const lastSyncedAt = useMemo(() => {
    const timestamps = accountList
      .map((account) => account.lastSynced)
      .filter(Boolean)
      .map((timestamp) => new Date(timestamp).getTime());

    if (!timestamps.length) return null;
    const latest = new Date(Math.max(...timestamps));
    return latest.toLocaleString();
  }, [accountList]);

  const balanceBucketFor = (balance: number) => {
    if (balance >= 100000) {
      return { key: '100k+', title: '🏆 High Balance (≥ $100K)' };
    }
    if (balance >= 20000) {
      return { key: '20k-100k', title: '💼 Growth Zone ($20K - $99K)' };
    }
    if (balance >= 0) {
      return { key: '0-20k', title: '🌱 Starter (< $20K)' };
    }
    return { key: 'negative', title: '⚠️ Negative Balance' };
  };

  const groupedAccounts = useMemo(() => {
    const groups = new Map<string, { title: string; accounts: Account[] }>();

    accountList.forEach((account) => {
      let groupKey = '';
      let groupTitle = '';

      switch (groupBy) {
        case 'institution': {
          groupKey = account.institutionName || 'Unknown Institution';
          groupTitle = `🏦 ${groupKey}`;
          break;
        }
        case 'type': {
          const meta = ACCOUNT_META[account.accountType] ?? ACCOUNT_META.other;
          groupKey = meta.label;
          groupTitle = `${meta.emoji} ${meta.label}`;
          break;
        }
        case 'currency': {
          const currency = account.currency || 'USD';
          groupKey = currency;
          groupTitle = `💱 ${currency}`;
          break;
        }
        case 'balance':
        default: {
          const bucket = balanceBucketFor(account.balance || 0);
          groupKey = bucket.key;
          groupTitle = bucket.title;
        }
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, { title: groupTitle, accounts: [] });
      }
      groups.get(groupKey)?.accounts.push(account);
    });

    return Array.from(groups.entries())
      .map(([key, value]) => ({
        key,
        total: value.accounts.reduce((sum, account) => sum + (account.balance || 0), 0),
        ...value,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [accountList, groupBy]);

  useEffect(() => {
    setExpandedGroups({});
  }, [groupBy]);

  const selectedGrouping = groupingOptions.find((option) => option.key === groupBy);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingCopy}>Crunching verified numbers...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {netWorth ? (
        <>
          <View style={styles.netWorthCard} onLayout={handleCardLayout}>
            {user?.verified && (
              <View style={styles.netWorthBadge}>
                <Text style={styles.netWorthBadgeText}>Verified Data</Text>
              </View>
            )}
            <ScrollView
              ref={carouselRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleValueScrollEnd}
              scrollEventThrottle={16}
              snapToOffsets={snapOffsets}
              snapToAlignment="center"
              decelerationRate="fast"
              disableIntervalMomentum
              bounces={false}
            >
              {valueModes.map((mode) => {
                const label = mode === 'net' ? 'Net Worth' : 'Total Assets';
                const modeValue = mode === 'assets' ? totals.assets : totals.net;
                const stats = getValueStats(mode);
                let summaryContent: React.ReactNode;

                if (mode === 'net') {
                  summaryContent = (
                    <Text style={styles.netWorthSummary}>
                      <Text style={[styles.summarySegment, { color: theme.colors.success }]}>
                        💰 Assets{' '}
                        <Text style={styles.summaryValue}>{formatMoney(totals.assets)}</Text>
                      </Text>
                      <Text style={styles.summarySpacer}>   </Text>
                      <Text style={[styles.summarySegment, { color: theme.colors.warning }]}>
                        ⚠️ Liabilities{' '}
                        <Text style={styles.summaryValue}>{formatMoney(totals.liabilities)}</Text>
                      </Text>
                    </Text>
                  );
                } else if (accountList.length > 0) {
                  summaryContent = (
                    <Text style={styles.netWorthSummary}>
                      <Text style={[styles.summarySegment, { color: theme.colors.primary }]}>
                        💼 Assets{' '}
                        <Text style={styles.summaryValue}>{formatMoney(modeValue)}</Text>
                      </Text>
                    </Text>
                  );
                } else {
                  summaryContent = (
                    <Text style={styles.netWorthSummary}>
                      <Text style={[styles.summarySegment, styles.summaryCallout]}>
                        🔗 Connect an account to start tracking assets
                      </Text>
                    </Text>
                  );
                }

                return (
                  <View key={mode} style={[styles.netWorthPage, { width: cardWidth }]}>
                    <View style={styles.netWorthHeader}>
                      <Text style={styles.cardLabel}>{label}</Text>
                      {lastSyncedAt && <Text style={styles.syncText}>Synced {lastSyncedAt}</Text>}
                    </View>

                    <Text style={styles.netWorthAmount}>{formatMoney(modeValue)}</Text>
                    {stats.change && (
                      <Text
                        style={[
                          styles.netWorthChange,
                          stats.change.positive ? styles.positiveText : styles.negativeText,
                        ]}
                      >
                        {`${stats.change.positive ? '+' : ''}${formatMoney(
                          Math.abs(stats.change.delta)
                        )}`}{' '}
                        {`(${stats.change.positive ? '+' : ''}${stats.change.percent.toFixed(1)}%)`}
                      </Text>
                    )}

                    {summaryContent}
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.netWorthPager}>
              {valueModes.map((mode, index) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.pagerDot, index === valuePage && styles.pagerDotActive]}
                  onPress={() => {
                    if (index === valuePage) return;
                    setValuePage(index);
                    scrollToValuePage(index);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${mode === 'net' ? 'Net Worth' : 'Total Assets'}`}
                />
              ))}
            </View>
          </View>

          <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Asset Breakdown</Text>
            <TouchableOpacity
              onPress={() => setShowAssetBreakdown((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleIcon}>{showAssetBreakdown ? '▾' : '▸'}</Text>
            </TouchableOpacity>
          </View>
            {showAssetBreakdown ? (
              assetSegments.length > 0 ? (
                <>
                  <View style={styles.assetBarContainer}>
                    <View style={styles.assetBarTrack}>
                      {assetSegments.map((segment) => (
                        <View
                          key={segment.key}
                          style={[
                            styles.assetBarSegment,
                            { backgroundColor: segment.color, flex: Math.max(segment.value, 1) },
                          ]}
                        />
                      ))}
                    </View>
                    {topHolding && (
                      <Text style={styles.assetSummaryText}>
                        {topHolding.emoji} {topHolding.label} leads with {topHolding.percent}% of holdings
                      </Text>
                    )}
                  </View>

                  <View style={styles.assetList}>
                    {assetSegments.map((segment) => (
                      <View key={segment.key} style={styles.assetRow}>
                        <View style={[styles.assetDot, { backgroundColor: segment.color }]} />
                        <View style={styles.assetInfo}>
                          <Text style={styles.assetLabel}>
                            {segment.emoji} {segment.label}
                          </Text>
                          <Text style={styles.assetAmount}>
                            {formatMoney(segment.value)} · {segment.percent}%
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {accountList.length > 0
                      ? 'Balances are syncing—refresh soon to see your mix.'
                      : 'Link an account to unlock a full asset breakdown.'}
                  </Text>
                </View>
              )
            ) : null}
          </View>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Net Worth Snapshot</Text>
          <Text style={styles.emptyText}>
            Connect an account to generate your first verified net worth.
          </Text>
          <Button
            title="🔗 Connect with Plaid"
            onPress={() => router.push('/link-account')}
            style={styles.connectButton}
          />
        </View>
      )}

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          activeOpacity={0.7}
          onPress={() => setAccountsExpanded((prev) => !prev)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Connected Accounts</Text>
            {accountList.length > 0 && (
              <>
                <Text style={styles.cardSubhead}>
                  🔗 {accountList.length}{' '}
                  {accountList.length === 1 ? 'account connected' : 'accounts connected'}
                </Text>
              </>
            )}
          </View>
          <Text style={styles.toggleIcon}>{accountsExpanded ? '▾' : '▸'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/link-account')} style={styles.addButton}>
          <Text style={styles.linkText}>+ Add Account</Text>
        </TouchableOpacity>

        {accountList.length > 0 && accountsExpanded && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.groupFilterRow}
          >
            {groupingOptions.map((option) => {
              const active = option.key === groupBy;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.groupFilterChip,
                    active && styles.groupFilterChipActive,
                  ]}
                  onPress={() => setGroupBy(option.key)}
                >
                  <Text
                    style={[
                      styles.groupFilterText,
                      active && styles.groupFilterTextActive,
                    ]}
                  >
                    {option.emoji} {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {accountList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No accounts connected yet</Text>
            <Button
              title="Connect Your First Account"
              onPress={() => router.push('/link-account')}
              style={styles.connectButton}
            />
          </View>
        ) : (
          accountsExpanded &&
          groupedAccounts.map((group) => {
            const isGroupExpanded = expandedGroups[group.key];
            return (
              <View key={group.key} style={styles.groupSection}>
                <TouchableOpacity
                  style={styles.groupHeader}
                  activeOpacity={0.7}
                  onPress={() =>
                    setExpandedGroups((prev) => ({
                      ...prev,
                      [group.key]: !prev[group.key],
                    }))
                  }
                >
                  <View>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    <Text style={styles.groupMeta}>
                      {group.accounts.length}{' '}
                      {group.accounts.length === 1 ? 'account' : 'accounts'} · {formatMoney(group.total)}
                    </Text>
                  </View>
                  <Text style={styles.toggleIcon}>{isGroupExpanded ? '▾' : '▸'}</Text>
                </TouchableOpacity>

                {isGroupExpanded &&
                  group.accounts.map((account) => {
                    const meta = ACCOUNT_META[account.accountType] ?? ACCOUNT_META.other;
                    const tagBackground = `${meta.color}${theme.isDark ? '33' : '1A'}`;

                    return (
                      <View key={account.id} style={styles.accountItem}>
                        <View>
                          <Text style={styles.accountName}>{account.institutionName}</Text>
                          <View style={styles.accountMetaRow}>
                            <View
                              style={[
                                styles.accountTypeTag,
                                { backgroundColor: tagBackground, borderColor: meta.color },
                              ]}
                            >
                              <Text style={[styles.accountTypeText, { color: meta.color }]}>
                                {meta.emoji} {meta.label}
                              </Text>
                            </View>
                            {account.currency && (
                              <Text style={styles.accountCurrencyText}>💱 {account.currency}</Text>
                            )}
                            {account.lastSynced && (
                              <Text style={styles.accountSyncText}>
                                ⏱️ {new Date(account.lastSynced).toLocaleDateString()}
                              </Text>
                            )}
                          </View>
                        </View>
                        <Text style={styles.accountBalance}>{formatMoney(account.balance)}</Text>
                      </View>
                    );
                  })}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    loadingCopy: {
      marginTop: 12,
      fontSize: 15,
      color: theme.colors.textSecondary,
    },
    syncText: {
      color: theme.colors.textMuted,
      fontSize: 11,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      marginHorizontal: 16,
      marginTop: 24,
      shadowColor: theme.isDark ? 'transparent' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0 : 0.05,
      shadowRadius: 8,
      elevation: theme.isDark ? 0 : 2,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.isDark ? theme.colors.border : 'transparent',
    },
    netWorthCard: {
      borderRadius: 24,
      paddingHorizontal: NET_WORTH_CARD_HORIZONTAL_PADDING,
      paddingVertical: 24,
      marginHorizontal: 16,
      marginTop: 24,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.isDark ? 'transparent' : '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.isDark ? 0 : 0.08,
      shadowRadius: 10,
      elevation: theme.isDark ? 0 : 3,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.isDark ? theme.colors.border : 'transparent',
      overflow: 'hidden',
    },
    netWorthBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.isDark ? 'rgba(96,165,250,0.18)' : theme.colors.accentSoft,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      marginBottom: 12,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.isDark ? 'rgba(148,163,184,0.3)' : 'transparent',
    },
    netWorthBadgeText: {
      color: theme.isDark ? theme.colors.chipActiveText : theme.colors.accent,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    netWorthHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardLabel: {
      fontSize: 14,
      color: theme.colors.textMuted,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    netWorthPage: {
      paddingHorizontal: 0,
      paddingBottom: 8,
    },
    netWorthAmount: {
      fontSize: 40,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      marginTop: 6,
    },
    netWorthChange: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 6,
    },
    netWorthSummary: {
      marginTop: 10,
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    summarySegment: {
      fontWeight: '600',
    },
    summaryValue: {
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    summaryCallout: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    summarySpacer: {
      color: theme.colors.textMuted,
      fontWeight: '400',
    },
    positiveText: {
      color: theme.colors.success,
    },
    negativeText: {
      color: theme.colors.danger,
    },
    netWorthPager: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
    },
    pagerDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
      marginHorizontal: 4,
    },
    pagerDotActive: {
      backgroundColor: theme.colors.primary,
    },
    assetBarContainer: {
      marginTop: 16,
      marginBottom: 20,
    },
    assetBarTrack: {
      flexDirection: 'row',
      height: 14,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: theme.colors.border,
    },
    assetBarSegment: {
      height: '100%',
    },
    assetSummaryText: {
      marginTop: 12,
      color: theme.colors.textMuted,
      fontSize: 13,
    },
    assetList: {
      marginTop: 8,
      gap: 12,
    },
    assetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    assetDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },
    assetInfo: {
      flex: 1,
    },
    assetLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    assetAmount: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    cardSubhead: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 6,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    addButton: {
      alignSelf: 'flex-start',
      marginBottom: 16,
    },
    toggleIcon: {
      fontSize: 18,
      color: theme.colors.textMuted,
      marginLeft: 12,
    },
    legendContainer: {
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 16,
      gap: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    legendSwatch: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 12,
    },
    legendText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    legendValue: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    groupFilterRow: {
      paddingVertical: 4,
      gap: 12,
      paddingHorizontal: 4,
    },
    groupFilterChip: {
      backgroundColor: theme.colors.chipBackground,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    groupFilterChipActive: {
      backgroundColor: theme.colors.chipActiveBackground,
      borderColor: theme.colors.chipActiveBackground,
    },
    groupFilterText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.chipText,
    },
    groupFilterTextActive: {
      color: theme.colors.chipActiveText,
    },
    linkText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 15,
      color: theme.colors.textMuted,
      marginBottom: 16,
    },
    connectButton: {
      marginTop: 4,
    },
    groupSection: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      marginBottom: 16,
      backgroundColor: theme.colors.surfaceElevated,
    },
    groupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
      marginBottom: 8,
    },
    groupTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    groupMeta: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 4,
    },
    accountItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    accountName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    accountMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    accountTypeTag: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderWidth: 1,
    },
    accountTypeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    accountCurrencyText: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    accountSyncText: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    accountBalance: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
  });
