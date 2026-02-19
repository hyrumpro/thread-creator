export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          username: string
          display_name: string
          email: string
          bio: string | null
          avatar: string | null
          cover_image: string | null
          location: string | null
          website: string | null
          is_verified: boolean
          is_pro: boolean
          followers_count: number
          following_count: number
          tweets_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          username: string
          display_name: string
          email: string
          bio?: string | null
          avatar?: string | null
          cover_image?: string | null
          location?: string | null
          website?: string | null
          is_verified?: boolean
          is_pro?: boolean
          followers_count?: number
          following_count?: number
          tweets_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          username?: string
          display_name?: string
          email?: string
          bio?: string | null
          avatar?: string | null
          cover_image?: string | null
          location?: string | null
          website?: string | null
          is_verified?: boolean
          is_pro?: boolean
          followers_count?: number
          following_count?: number
          tweets_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: string
          status: string
          provider: string | null
          provider_customer_id: string | null
          provider_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: string
          status?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          status?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['user_id']
          }
        ]
      }
      tweets: {
        Row: {
          id: string
          user_id: string
          content: string
          images: string[] | null
          parent_tweet_id: string | null
          quoted_tweet_id: string | null
          is_edited: boolean
          edited_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          images?: string[] | null
          parent_tweet_id?: string | null
          quoted_tweet_id?: string | null
          is_edited?: boolean
          edited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          images?: string[] | null
          parent_tweet_id?: string | null
          quoted_tweet_id?: string | null
          is_edited?: boolean
          edited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tweets_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'tweets_parent_tweet_id_fkey'
            columns: ['parent_tweet_id']
            isOneToOne: false
            referencedRelation: 'tweets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tweets_quoted_tweet_id_fkey'
            columns: ['quoted_tweet_id']
            isOneToOne: false
            referencedRelation: 'tweets'
            referencedColumns: ['id']
          }
        ]
      }
      tweet_stats: {
        Row: {
          tweet_id: string
          likes_count: number
          retweets_count: number
          quotes_count: number
          comments_count: number
          views_count: number
          bookmarks_count: number
          updated_at: string
        }
        Insert: {
          tweet_id: string
          likes_count?: number
          retweets_count?: number
          quotes_count?: number
          comments_count?: number
          views_count?: number
          bookmarks_count?: number
          updated_at?: string
        }
        Update: {
          tweet_id?: string
          likes_count?: number
          retweets_count?: number
          quotes_count?: number
          comments_count?: number
          views_count?: number
          bookmarks_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tweet_stats_tweet_id_fkey'
            columns: ['tweet_id']
            isOneToOne: true
            referencedRelation: 'tweets'
            referencedColumns: ['id']
          }
        ]
      }
      tweet_interactions: {
        Row: {
          id: string
          user_id: string
          tweet_id: string
          interaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tweet_id: string
          interaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tweet_id?: string
          interaction_type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tweet_interactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'tweet_interactions_tweet_id_fkey'
            columns: ['tweet_id']
            isOneToOne: false
            referencedRelation: 'tweets'
            referencedColumns: ['id']
          }
        ]
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey'
            columns: ['follower_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'follows_following_id_fkey'
            columns: ['following_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['user_id']
          }
        ]
      }
      hashtags: {
        Row: {
          id: string
          tag: string
          tweet_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tag: string
          tweet_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tag?: string
          tweet_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tweet_hashtags: {
        Row: {
          tweet_id: string
          hashtag_id: string
          created_at: string
        }
        Insert: {
          tweet_id: string
          hashtag_id: string
          created_at?: string
        }
        Update: {
          tweet_id?: string
          hashtag_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tweet_hashtags_tweet_id_fkey'
            columns: ['tweet_id']
            isOneToOne: false
            referencedRelation: 'tweets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tweet_hashtags_hashtag_id_fkey'
            columns: ['hashtag_id']
            isOneToOne: false
            referencedRelation: 'hashtags'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string
          tweet_id: string | null
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id: string
          tweet_id?: string | null
          type: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          actor_id?: string
          tweet_id?: string | null
          type?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'notifications_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'notifications_tweet_id_fkey'
            columns: ['tweet_id']
            isOneToOne: false
            referencedRelation: 'tweets'
            referencedColumns: ['id']
          }
        ]
      }
      user_roles: {
        Row: {
          user_id: string
          role: string
          granted_by: string | null
          granted_at: string
        }
        Insert: {
          user_id: string
          role?: string
          granted_by?: string | null
          granted_at?: string
        }
        Update: {
          user_id?: string
          role?: string
          granted_by?: string | null
          granted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['user_id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_tweet_views: {
        Args: { p_tweet_id: string }
        Returns: void
      }
      get_scored_timeline: {
        Args: {
          p_user_id: string
          p_limit?: number
          p_hours_ago?: number
          p_offset?: number
        }
        Returns: {
          tweet_id: string
          content: string
          images: string[] | null
          created_at: string
          score: number
          likes_count: number
          retweets_count: number
          comments_count: number
          views_count: number
          bookmarks_count: number
          author_id: string
          author_username: string
          author_display_name: string
          author_avatar: string | null
          author_is_verified: boolean
          author_is_pro: boolean
          author_followers_count: number
          author_following_count: number
        }[]
      }
    }
    Enums: {
      subscription_plan: 'free' | 'pro'
      subscription_status: 'inactive' | 'active' | 'past_due' | 'canceled'
      interaction_type: 'like' | 'retweet' | 'bookmark'
      notification_type: 'like' | 'retweet' | 'comment' | 'follow' | 'mention' | 'quote'
      user_role: 'user' | 'moderator' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
