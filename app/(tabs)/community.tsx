import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { communityService } from '../../src/services/communityService';
import { Post } from '../../src/types';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { AppTheme, useAppTheme } from '../../src/theme';

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const loadPosts = useCallback(async () => {
    try {
      const data = await communityService.listFeed(sort);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setRefreshing(false);
    }
  }, [sort]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postCard} onPress={() => router.push(`/post/${item.id}`)}>
      <View style={styles.postHeader}>
        <View style={styles.authorRow}>
          <Text style={styles.author}>{item.alias}</Text>
          {item.verified && <VerifiedBadge size="small" />}
        </View>
        <View style={styles.topicTag}>
          <Text style={styles.topicText}>{item.topic}</Text>
        </View>
      </View>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postBody} numberOfLines={3}>
        {item.body}
      </Text>
      <View style={styles.postFooter}>
        <Text style={styles.votes}>↑ {item.votes}</Text>
        <Text style={styles.comments}>{item.commentCount} comments</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <View style={styles.sortRow}>
          {(['hot', 'new', 'top'] as const).map((s) => (
            <TouchableOpacity key={s} onPress={() => setSort(s)} style={[styles.sortButton, sort === s && styles.sortButtonActive]}>
              <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>{s.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: 24, paddingTop: 60, backgroundColor: theme.colors.surface },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 16,
    },
    sortRow: { flexDirection: 'row', gap: 8 },
    sortButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.chipBackground,
    },
    sortButtonActive: { backgroundColor: theme.colors.primary },
    sortText: { fontSize: 14, fontWeight: '600', color: theme.colors.textMuted },
    sortTextActive: { color: theme.colors.onPrimary },
    list: { padding: 16 },
    postCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.isDark ? 'transparent' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.isDark ? 0 : 0.05,
      shadowRadius: 4,
      elevation: theme.isDark ? 0 : 1,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.isDark ? theme.colors.border : 'transparent',
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    author: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
    topicTag: {
      backgroundColor: theme.colors.accentSoft,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    topicText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.accent,
    },
    postTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    postBody: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 },
    postFooter: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    votes: { fontSize: 14, fontWeight: '600', color: theme.colors.success },
    comments: { fontSize: 14, color: theme.colors.textMuted },
  });
