export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_profiles: {
        Row: {
          active_listings: number
          agent_type: Database["public"]["Enums"]["agent_type"]
          bio: string | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string
          current_plan_id: string
          free_leads_remaining: number
          id: string
          leads_cycle_reset_at: string
          office_address: string | null
          onboarding_step: number
          plan_expires_at: string | null
          plan_skipped: boolean
          plan_started_at: string
          profile_id: string
          rating_avg: number | null
          rating_count: number
          rera_doc_url: string | null
          rera_number: string | null
          specializations: string[] | null
          total_leads_converted: number
          total_leads_received: number
          total_listings: number
          updated_at: string
          verification_note: string | null
          verification_skipped: boolean
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          website_url: string | null
          years_of_experience: number | null
        }
        Insert: {
          active_listings?: number
          agent_type?: Database["public"]["Enums"]["agent_type"]
          bio?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          current_plan_id?: string
          free_leads_remaining?: number
          id?: string
          leads_cycle_reset_at?: string
          office_address?: string | null
          onboarding_step?: number
          plan_expires_at?: string | null
          plan_skipped?: boolean
          plan_started_at?: string
          profile_id: string
          rating_avg?: number | null
          rating_count?: number
          rera_doc_url?: string | null
          rera_number?: string | null
          specializations?: string[] | null
          total_leads_converted?: number
          total_leads_received?: number
          total_listings?: number
          updated_at?: string
          verification_note?: string | null
          verification_skipped?: boolean
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          website_url?: string | null
          years_of_experience?: number | null
        }
        Update: {
          active_listings?: number
          agent_type?: Database["public"]["Enums"]["agent_type"]
          bio?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          current_plan_id?: string
          free_leads_remaining?: number
          id?: string
          leads_cycle_reset_at?: string
          office_address?: string | null
          onboarding_step?: number
          plan_expires_at?: string | null
          plan_skipped?: boolean
          plan_started_at?: string
          profile_id?: string
          rating_avg?: number | null
          rating_count?: number
          rera_doc_url?: string | null
          rera_number?: string | null
          specializations?: string[] | null
          total_leads_converted?: number
          total_leads_received?: number
          total_listings?: number
          updated_at?: string
          verification_note?: string | null
          verification_skipped?: boolean
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          website_url?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_profiles_current_plan_id_fkey"
            columns: ["current_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_reviews: {
        Row: {
          admin_note: string | null
          agent_id: string
          body: string | null
          created_at: string
          id: string
          is_verified: boolean
          lead_id: string | null
          moderation_status: string
          rating: number
          reviewer_id: string
          title: string | null
        }
        Insert: {
          admin_note?: string | null
          agent_id: string
          body?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean
          lead_id?: string | null
          moderation_status?: string
          rating: number
          reviewer_id: string
          title?: string | null
        }
        Update: {
          admin_note?: string | null
          agent_id?: string
          body?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean
          lead_id?: string | null
          moderation_status?: string
          rating?: number
          reviewer_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_reviews_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "admin_agent_performance"
            referencedColumns: ["agent_profile_id"]
          },
          {
            foreignKeyName: "agent_reviews_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_reviews_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "agent_reviews_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      amenities: {
        Row: {
          category: Database["public"]["Enums"]["amenity_category"]
          icon_key: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          category: Database["public"]["Enums"]["amenity_category"]
          icon_key?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["amenity_category"]
          icon_key?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      banner_ads: {
        Row: {
          activated_at: string | null
          advertiser_id: string | null
          alt_text: string | null
          city_id: string | null
          click_url: string
          clicks: number
          created_at: string
          ctr: number | null
          ends_at: string
          id: string
          image_url: string
          impressions: number
          payment_id: string | null
          placement: string
          starts_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          advertiser_id?: string | null
          alt_text?: string | null
          city_id?: string | null
          click_url: string
          clicks?: number
          created_at?: string
          ctr?: number | null
          ends_at: string
          id?: string
          image_url: string
          impressions?: number
          payment_id?: string | null
          placement: string
          starts_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          advertiser_id?: string | null
          alt_text?: string | null
          city_id?: string | null
          click_url?: string
          clicks?: number
          created_at?: string
          ctr?: number | null
          ends_at?: string
          id?: string
          image_url?: string
          impressions?: number
          payment_id?: string | null
          placement?: string
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banner_ads_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banner_ads_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banner_ads_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          canonical_url: string | null
          category: string
          content: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          loan_cta_enabled: boolean
          loan_cta_text: string | null
          loan_cta_url: string | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          related_city_id: string | null
          scheduled_at: string | null
          slug: string
          status: Database["public"]["Enums"]["blog_status"]
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_id: string
          canonical_url?: string | null
          category: string
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          loan_cta_enabled?: boolean
          loan_cta_text?: string | null
          loan_cta_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          related_city_id?: string | null
          scheduled_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_id?: string
          canonical_url?: string | null
          category?: string
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          loan_cta_enabled?: boolean
          loan_cta_text?: string | null
          loan_cta_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          related_city_id?: string | null
          scheduled_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_related_city_id_fkey"
            columns: ["related_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          state: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          state: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          state?: string
        }
        Relationships: []
      }
      contact: {
        Row: {
          created_at: string
          email: string | null
          id: number
          message: string | null
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          message?: string | null
          name?: string | null
        }
        Relationships: []
      }
      featured_listings: {
        Row: {
          activated_at: string | null
          agent_id: string
          clicks: number
          created_at: string
          ends_at: string | null
          id: string
          impressions: number
          payment_id: string | null
          placement: Database["public"]["Enums"]["featured_placement"]
          price_paid: number | null
          property_id: string
          starts_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          agent_id: string
          clicks?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          impressions?: number
          payment_id?: string | null
          placement: Database["public"]["Enums"]["featured_placement"]
          price_paid?: number | null
          property_id: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          agent_id?: string
          clicks?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          impressions?: number
          payment_id?: string | null
          placement?: Database["public"]["Enums"]["featured_placement"]
          price_paid?: number | null
          property_id?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_listings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "admin_agent_performance"
            referencedColumns: ["agent_profile_id"]
          },
          {
            foreignKeyName: "featured_listings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_listings_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "featured_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_assignments: {
        Row: {
          agent_id: string
          agent_note: string | null
          agent_status: string
          contact_revealed: boolean
          contacted_at: string | null
          converted_at: string | null
          created_at: string
          id: string
          lead_id: string
          notified_at: string | null
          payment_id: string | null
          reminder_sent_at: string | null
          unlock_method:
            | Database["public"]["Enums"]["lead_unlock_method"]
            | null
          unlocked_at: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          agent_note?: string | null
          agent_status?: string
          contact_revealed?: boolean
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          lead_id: string
          notified_at?: string | null
          payment_id?: string | null
          reminder_sent_at?: string | null
          unlock_method?:
            | Database["public"]["Enums"]["lead_unlock_method"]
            | null
          unlocked_at?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          agent_note?: string | null
          agent_status?: string
          contact_revealed?: boolean
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          notified_at?: string | null
          payment_id?: string | null
          reminder_sent_at?: string | null
          unlock_method?:
            | Database["public"]["Enums"]["lead_unlock_method"]
            | null
          unlocked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lead_assignments_payment"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "admin_agent_performance"
            referencedColumns: ["agent_profile_id"]
          },
          {
            foreignKeyName: "lead_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_pricing_rules: {
        Row: {
          category: Database["public"]["Enums"]["property_category"] | null
          created_at: string
          id: string
          is_active: boolean
          label: string | null
          max_property_price: number | null
          min_property_price: number
          unlock_price: number
        }
        Insert: {
          category?: Database["public"]["Enums"]["property_category"] | null
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string | null
          max_property_price?: number | null
          min_property_price: number
          unlock_price: number
        }
        Update: {
          category?: Database["public"]["Enums"]["property_category"] | null
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string | null
          max_property_price?: number | null
          min_property_price?: number
          unlock_price?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string
          id: string
          intent: Database["public"]["Enums"]["lead_intent"]
          loan_type_preferred: Database["public"]["Enums"]["loan_type"] | null
          message: string | null
          preferred_localities: string[] | null
          property_id: string | null
          property_price_at_lead: number | null
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          unlock_price: number | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_city: string | null
          visitor_email: string | null
          visitor_id: string | null
          visitor_name: string
          visitor_phone: string
          wants_loan_assistance: boolean
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          id?: string
          intent?: Database["public"]["Enums"]["lead_intent"]
          loan_type_preferred?: Database["public"]["Enums"]["loan_type"] | null
          message?: string | null
          preferred_localities?: string[] | null
          property_id?: string | null
          property_price_at_lead?: number | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          unlock_price?: number | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_city?: string | null
          visitor_email?: string | null
          visitor_id?: string | null
          visitor_name: string
          visitor_phone: string
          wants_loan_assistance?: boolean
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          id?: string
          intent?: Database["public"]["Enums"]["lead_intent"]
          loan_type_preferred?: Database["public"]["Enums"]["loan_type"] | null
          message?: string | null
          preferred_localities?: string[] | null
          property_id?: string | null
          property_price_at_lead?: number | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          unlock_price?: number | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_city?: string | null
          visitor_email?: string | null
          visitor_id?: string | null
          visitor_name?: string
          visitor_phone?: string
          wants_loan_assistance?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_inquiries: {
        Row: {
          amount_required: number | null
          annual_income: number | null
          assigned_at: string | null
          assigned_dsa_id: string | null
          commission_amount: number | null
          commission_rate: number | null
          commission_received: boolean
          commission_received_at: string | null
          created_at: string
          credit_score_self: number | null
          disbursed_amount: number | null
          employment_type: string | null
          existing_emi: number | null
          id: string
          interest_rate: number | null
          lead_id: string | null
          loan_type: Database["public"]["Enums"]["loan_type"]
          property_id: string | null
          property_price_ref: number | null
          sanctioned_amount: number | null
          status: Database["public"]["Enums"]["loan_inquiry_status"]
          status_note: string | null
          tenure_months: number | null
          updated_at: string
          visitor_email: string | null
          visitor_name: string
          visitor_phone: string
        }
        Insert: {
          amount_required?: number | null
          annual_income?: number | null
          assigned_at?: string | null
          assigned_dsa_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          commission_received?: boolean
          commission_received_at?: string | null
          created_at?: string
          credit_score_self?: number | null
          disbursed_amount?: number | null
          employment_type?: string | null
          existing_emi?: number | null
          id?: string
          interest_rate?: number | null
          lead_id?: string | null
          loan_type?: Database["public"]["Enums"]["loan_type"]
          property_id?: string | null
          property_price_ref?: number | null
          sanctioned_amount?: number | null
          status?: Database["public"]["Enums"]["loan_inquiry_status"]
          status_note?: string | null
          tenure_months?: number | null
          updated_at?: string
          visitor_email?: string | null
          visitor_name: string
          visitor_phone: string
        }
        Update: {
          amount_required?: number | null
          annual_income?: number | null
          assigned_at?: string | null
          assigned_dsa_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          commission_received?: boolean
          commission_received_at?: string | null
          created_at?: string
          credit_score_self?: number | null
          disbursed_amount?: number | null
          employment_type?: string | null
          existing_emi?: number | null
          id?: string
          interest_rate?: number | null
          lead_id?: string | null
          loan_type?: Database["public"]["Enums"]["loan_type"]
          property_id?: string | null
          property_price_ref?: number | null
          sanctioned_amount?: number | null
          status?: Database["public"]["Enums"]["loan_inquiry_status"]
          status_note?: string | null
          tenure_months?: number | null
          updated_at?: string
          visitor_email?: string | null
          visitor_name?: string
          visitor_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_inquiries_assigned_dsa_id_fkey"
            columns: ["assigned_dsa_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_inquiries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "loan_inquiries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "loan_inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      localities: {
        Row: {
          city_id: string
          created_at: string
          id: string
          is_active: boolean
          lat: number | null
          lng: number | null
          name: string
          slug: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          slug: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "localities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          action: Database["public"]["Enums"]["moderation_action"]
          admin_id: string
          after_state: Json | null
          before_state: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          note: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["moderation_action"]
          admin_id: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          note?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["moderation_action"]
          admin_id?: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          body: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          failure_reason: string | null
          id: string
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          retry_count: number
          send_at: string
          sent_at: string | null
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          failure_reason?: string | null
          id?: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          retry_count?: number
          send_at?: string
          sent_at?: string | null
          status?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          failure_reason?: string | null
          id?: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          retry_count?: number
          send_at?: string
          sent_at?: string | null
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          banner_ad_id: string | null
          created_at: string
          currency: string
          failure_reason: string | null
          featured_listing_id: string | null
          gateway: string
          gateway_order_id: string | null
          gateway_payment_id: string | null
          gateway_response: Json | null
          gateway_signature: string | null
          id: string
          invoice_number: string | null
          invoice_url: string | null
          lead_assignment_id: string | null
          plan_id: string | null
          profile_id: string
          property_id: string | null
          purpose: Database["public"]["Enums"]["payment_purpose"]
          refund_id: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount: number
          banner_ad_id?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          featured_listing_id?: string | null
          gateway?: string
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gateway_response?: Json | null
          gateway_signature?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          lead_assignment_id?: string | null
          plan_id?: string | null
          profile_id: string
          property_id?: string | null
          purpose: Database["public"]["Enums"]["payment_purpose"]
          refund_id?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tax_amount?: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          amount?: number
          banner_ad_id?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          featured_listing_id?: string | null
          gateway?: string
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gateway_response?: Json | null
          gateway_signature?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          lead_assignment_id?: string | null
          plan_id?: string | null
          profile_id?: string
          property_id?: string | null
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          refund_id?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_banner"
            columns: ["banner_ad_id"]
            isOneToOne: false
            referencedRelation: "banner_ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payments_featured"
            columns: ["featured_listing_id"]
            isOneToOne: false
            referencedRelation: "featured_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_lead_assignment_id_fkey"
            columns: ["lead_assignment_id"]
            isOneToOne: false
            referencedRelation: "agent_lead_view"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "payments_lead_assignment_id_fkey"
            columns: ["lead_assignment_id"]
            isOneToOne: false
            referencedRelation: "lead_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          analytics_access: boolean
          created_at: string
          duration_days: number | null
          duration_type: Database["public"]["Enums"]["plan_duration"]
          featured_credits_included: number
          free_leads_per_cycle: number
          id: string
          is_active: boolean
          max_active_listings: number
          name: string
          price: number
          priority_support: boolean
          slug: string
          sort_order: number
          verified_badge_included: boolean
        }
        Insert: {
          analytics_access?: boolean
          created_at?: string
          duration_days?: number | null
          duration_type: Database["public"]["Enums"]["plan_duration"]
          featured_credits_included?: number
          free_leads_per_cycle?: number
          id?: string
          is_active?: boolean
          max_active_listings?: number
          name: string
          price?: number
          priority_support?: boolean
          slug: string
          sort_order?: number
          verified_badge_included?: boolean
        }
        Update: {
          analytics_access?: boolean
          created_at?: string
          duration_days?: number | null
          duration_type?: Database["public"]["Enums"]["plan_duration"]
          featured_credits_included?: number
          free_leads_per_cycle?: number
          id?: string
          is_active?: boolean
          max_active_listings?: number
          name?: string
          price?: number
          priority_support?: boolean
          slug?: string
          sort_order?: number
          verified_badge_included?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address_line: string | null
          admin_note: string | null
          area_unit: Database["public"]["Enums"]["area_unit"]
          available_from: string | null
          balconies: number | null
          bathrooms: number | null
          bedrooms: number | null
          builder_name: string | null
          builtup_area: number | null
          carpet_area: number | null
          category: Database["public"]["Enums"]["property_category"]
          city_id: string
          created_at: string
          description: string | null
          expires_at: string | null
          extra_details: Json
          facing: Database["public"]["Enums"]["facing_direction"] | null
          floor_number: number | null
          furnishing: Database["public"]["Enums"]["furnishing_status"] | null
          highlights: string[] | null
          id: string
          is_exclusive: boolean
          is_featured: boolean
          is_premium: boolean
          is_price_negotiable: boolean
          is_rera_registered: boolean
          is_verified: boolean
          landmark: string | null
          lat: number | null
          leads_count: number
          lng: number | null
          locality_id: string | null
          maintenance_charge: number | null
          meta_description: string | null
          meta_title: string | null
          overlooking: string[] | null
          owner_id: string
          pincode: string | null
          plot_area: number | null
          plot_area_unit: Database["public"]["Enums"]["area_unit"] | null
          pooja_room: boolean
          possession_date: string | null
          possession_status: Database["public"]["Enums"]["possession_status"]
          price: number
          price_on_request: boolean
          price_unit: Database["public"]["Enums"]["price_unit"]
          project_name: string | null
          property_age: Database["public"]["Enums"]["property_age"] | null
          property_type: Database["public"]["Enums"]["property_type"]
          published_at: string | null
          rejection_reason: string | null
          renewal_count: number
          renewed_at: string | null
          rera_number: string | null
          saved_count: number
          security_deposit: number | null
          servant_room: boolean
          shortlisted_count: number
          slug: string
          society_name: string | null
          status: Database["public"]["Enums"]["listing_status"]
          store_room: boolean
          study_room: boolean
          super_builtup_area: number | null
          tags: string[] | null
          title: string
          toilets: number | null
          total_floors: number | null
          tower_name: string | null
          unique_views_count: number
          unit_number: string | null
          updated_at: string
          views_count: number
        }
        Insert: {
          address_line?: string | null
          admin_note?: string | null
          area_unit?: Database["public"]["Enums"]["area_unit"]
          available_from?: string | null
          balconies?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          builder_name?: string | null
          builtup_area?: number | null
          carpet_area?: number | null
          category: Database["public"]["Enums"]["property_category"]
          city_id: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          extra_details?: Json
          facing?: Database["public"]["Enums"]["facing_direction"] | null
          floor_number?: number | null
          furnishing?: Database["public"]["Enums"]["furnishing_status"] | null
          highlights?: string[] | null
          id?: string
          is_exclusive?: boolean
          is_featured?: boolean
          is_premium?: boolean
          is_price_negotiable?: boolean
          is_rera_registered?: boolean
          is_verified?: boolean
          landmark?: string | null
          lat?: number | null
          leads_count?: number
          lng?: number | null
          locality_id?: string | null
          maintenance_charge?: number | null
          meta_description?: string | null
          meta_title?: string | null
          overlooking?: string[] | null
          owner_id: string
          pincode?: string | null
          plot_area?: number | null
          plot_area_unit?: Database["public"]["Enums"]["area_unit"] | null
          pooja_room?: boolean
          possession_date?: string | null
          possession_status?: Database["public"]["Enums"]["possession_status"]
          price: number
          price_on_request?: boolean
          price_unit?: Database["public"]["Enums"]["price_unit"]
          project_name?: string | null
          property_age?: Database["public"]["Enums"]["property_age"] | null
          property_type: Database["public"]["Enums"]["property_type"]
          published_at?: string | null
          rejection_reason?: string | null
          renewal_count?: number
          renewed_at?: string | null
          rera_number?: string | null
          saved_count?: number
          security_deposit?: number | null
          servant_room?: boolean
          shortlisted_count?: number
          slug: string
          society_name?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          store_room?: boolean
          study_room?: boolean
          super_builtup_area?: number | null
          tags?: string[] | null
          title: string
          toilets?: number | null
          total_floors?: number | null
          tower_name?: string | null
          unique_views_count?: number
          unit_number?: string | null
          updated_at?: string
          views_count?: number
        }
        Update: {
          address_line?: string | null
          admin_note?: string | null
          area_unit?: Database["public"]["Enums"]["area_unit"]
          available_from?: string | null
          balconies?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          builder_name?: string | null
          builtup_area?: number | null
          carpet_area?: number | null
          category?: Database["public"]["Enums"]["property_category"]
          city_id?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          extra_details?: Json
          facing?: Database["public"]["Enums"]["facing_direction"] | null
          floor_number?: number | null
          furnishing?: Database["public"]["Enums"]["furnishing_status"] | null
          highlights?: string[] | null
          id?: string
          is_exclusive?: boolean
          is_featured?: boolean
          is_premium?: boolean
          is_price_negotiable?: boolean
          is_rera_registered?: boolean
          is_verified?: boolean
          landmark?: string | null
          lat?: number | null
          leads_count?: number
          lng?: number | null
          locality_id?: string | null
          maintenance_charge?: number | null
          meta_description?: string | null
          meta_title?: string | null
          overlooking?: string[] | null
          owner_id?: string
          pincode?: string | null
          plot_area?: number | null
          plot_area_unit?: Database["public"]["Enums"]["area_unit"] | null
          pooja_room?: boolean
          possession_date?: string | null
          possession_status?: Database["public"]["Enums"]["possession_status"]
          price?: number
          price_on_request?: boolean
          price_unit?: Database["public"]["Enums"]["price_unit"]
          project_name?: string | null
          property_age?: Database["public"]["Enums"]["property_age"] | null
          property_type?: Database["public"]["Enums"]["property_type"]
          published_at?: string | null
          rejection_reason?: string | null
          renewal_count?: number
          renewed_at?: string | null
          rera_number?: string | null
          saved_count?: number
          security_deposit?: number | null
          servant_room?: boolean
          shortlisted_count?: number
          slug?: string
          society_name?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          store_room?: boolean
          study_room?: boolean
          super_builtup_area?: number | null
          tags?: string[] | null
          title?: string
          toilets?: number | null
          total_floors?: number | null
          tower_name?: string | null
          unique_views_count?: number
          unit_number?: string | null
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "properties_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "localities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_amenities: {
        Row: {
          amenity_id: string
          property_id: string
        }
        Insert: {
          amenity_id: string
          property_id: string
        }
        Update: {
          amenity_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_media: {
        Row: {
          caption: string | null
          created_at: string
          duration_seconds: number | null
          file_size_kb: number | null
          filename_original: string | null
          height_px: number | null
          id: string
          is_watermarked: boolean
          media_type: Database["public"]["Enums"]["media_type"]
          moderation_status: string
          property_id: string
          sort_order: number
          thumbnail_url: string | null
          url: string
          width_px: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          file_size_kb?: number | null
          filename_original?: string | null
          height_px?: number | null
          id?: string
          is_watermarked?: boolean
          media_type?: Database["public"]["Enums"]["media_type"]
          moderation_status?: string
          property_id: string
          sort_order?: number
          thumbnail_url?: string | null
          url: string
          width_px?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          file_size_kb?: number | null
          filename_original?: string | null
          height_px?: number | null
          id?: string
          is_watermarked?: boolean
          media_type?: Database["public"]["Enums"]["media_type"]
          moderation_status?: string
          property_id?: string
          sort_order?: number
          thumbnail_url?: string | null
          url?: string
          width_px?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_views: {
        Row: {
          city: string | null
          id: string
          property_id: string
          session_id: string | null
          source: string | null
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          city?: string | null
          id?: string
          property_id: string
          session_id?: string | null
          source?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          city?: string | null
          id?: string
          property_id?: string
          session_id?: string | null
          source?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reported_listings: {
        Row: {
          admin_note: string | null
          created_at: string
          details: string | null
          id: string
          property_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string | null
          reporter_phone: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          details?: string | null
          id?: string
          property_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string | null
          reporter_phone?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          details?: string | null
          id?: string
          property_id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string | null
          reporter_phone?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reported_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "reported_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_listings_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_properties: {
        Row: {
          property_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          property_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          property_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_alerts: {
        Row: {
          category: Database["public"]["Enums"]["property_category"] | null
          city_id: string | null
          created_at: string
          frequency: string
          furnishing: Database["public"]["Enums"]["furnishing_status"] | null
          id: string
          is_active: boolean
          label: string | null
          last_sent_at: string | null
          locality_ids: string[] | null
          max_area: number | null
          max_bedrooms: number | null
          max_price: number | null
          min_area: number | null
          min_bedrooms: number | null
          min_price: number | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["property_category"] | null
          city_id?: string | null
          created_at?: string
          frequency?: string
          furnishing?: Database["public"]["Enums"]["furnishing_status"] | null
          id?: string
          is_active?: boolean
          label?: string | null
          last_sent_at?: string | null
          locality_ids?: string[] | null
          max_area?: number | null
          max_bedrooms?: number | null
          max_price?: number | null
          min_area?: number | null
          min_bedrooms?: number | null
          min_price?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["property_category"] | null
          city_id?: string | null
          created_at?: string
          frequency?: string
          furnishing?: Database["public"]["Enums"]["furnishing_status"] | null
          id?: string
          is_active?: boolean
          label?: string | null
          last_sent_at?: string | null
          locality_ids?: string[] | null
          max_area?: number | null
          max_bedrooms?: number | null
          max_price?: number | null
          min_area?: number | null
          min_bedrooms?: number | null
          min_price?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_alerts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_history: {
        Row: {
          agent_id: string
          created_at: string
          expires_at: string | null
          id: string
          leads_quota: number
          payment_id: string | null
          plan_id: string
          started_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          leads_quota: number
          payment_id?: string | null
          plan_id: string
          started_at: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          leads_quota?: number
          payment_id?: string | null
          plan_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "admin_agent_performance"
            referencedColumns: ["agent_profile_id"]
          },
          {
            foreignKeyName: "subscription_history_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_agent_performance: {
        Row: {
          active_listings: number | null
          agent_name: string | null
          agent_profile_id: string | null
          agent_type: Database["public"]["Enums"]["agent_type"] | null
          conversion_rate_pct: number | null
          current_plan: string | null
          free_leads_remaining: number | null
          joined_at: string | null
          phone: string | null
          plan_expires_at: string | null
          rating_avg: number | null
          rating_count: number | null
          total_leads_converted: number | null
          total_leads_received: number | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      admin_live_lead_feed: {
        Row: {
          agent_name: string | null
          agent_phone: string | null
          agent_status: string | null
          agent_verified:
            | Database["public"]["Enums"]["verification_status"]
            | null
          contact_revealed: boolean | null
          created_at: string | null
          intent: Database["public"]["Enums"]["lead_intent"] | null
          lead_id: string | null
          lead_status: Database["public"]["Enums"]["lead_status"] | null
          message: string | null
          property_category:
            | Database["public"]["Enums"]["property_category"]
            | null
          property_city: string | null
          property_id: string | null
          property_locality: string | null
          property_price: number | null
          property_title: string | null
          source: string | null
          unlock_method:
            | Database["public"]["Enums"]["lead_unlock_method"]
            | null
          unlock_price: number | null
          unlocked_at: string | null
          visitor_city: string | null
          visitor_email: string | null
          visitor_name: string | null
          visitor_phone: string | null
          wants_loan_assistance: boolean | null
        }
        Relationships: []
      }
      admin_loan_pipeline: {
        Row: {
          amount_required: number | null
          assigned_at: string | null
          commission_amount: number | null
          commission_rate: number | null
          commission_received: boolean | null
          created_at: string | null
          days_open: number | null
          disbursed_amount: number | null
          dsa_name: string | null
          employment_type: string | null
          id: string | null
          loan_type: Database["public"]["Enums"]["loan_type"] | null
          property_price: number | null
          property_title: string | null
          status: Database["public"]["Enums"]["loan_inquiry_status"] | null
          visitor_email: string | null
          visitor_name: string | null
          visitor_phone: string | null
        }
        Relationships: []
      }
      admin_loan_revenue: {
        Row: {
          avg_commission_rate: number | null
          disbursals: number | null
          month: string | null
          total_commission: number | null
          total_loan_value: number | null
        }
        Relationships: []
      }
      admin_moderation_queue: {
        Row: {
          current_status: string | null
          entity_id: string | null
          entity_type: string | null
          extra_info: string | null
          label: string | null
          submitted_at: string | null
          submitted_by: string | null
          submitter_phone: string | null
        }
        Relationships: []
      }
      admin_revenue_summary: {
        Row: {
          failed: number | null
          gross_revenue: number | null
          month: string | null
          purpose: Database["public"]["Enums"]["payment_purpose"] | null
          refunded: number | null
          successful: number | null
          tax_collected: number | null
          total_collected: number | null
          transaction_count: number | null
        }
        Relationships: []
      }
      agent_lead_view: {
        Row: {
          agent_note: string | null
          agent_status: string | null
          assigned_at: string | null
          assignment_id: string | null
          budget_max: number | null
          budget_min: number | null
          contact_revealed: boolean | null
          intent: Database["public"]["Enums"]["lead_intent"] | null
          lead_id: string | null
          lead_received_at: string | null
          lead_status: Database["public"]["Enums"]["lead_status"] | null
          message: string | null
          notified_at: string | null
          preferred_localities: string[] | null
          property_category:
            | Database["public"]["Enums"]["property_category"]
            | null
          property_city: string | null
          property_id: string | null
          property_locality: string | null
          property_price: number | null
          property_price_at_lead: number | null
          property_slug: string | null
          property_title: string | null
          source: string | null
          unlock_method:
            | Database["public"]["Enums"]["lead_unlock_method"]
            | null
          unlock_price: number | null
          unlocked_at: string | null
          visitor_city: string | null
          visitor_email: string | null
          visitor_name: string | null
          visitor_phone: string | null
          wants_loan_assistance: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["lead_id"]
          },
          {
            foreignKeyName: "lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "admin_live_lead_feed"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_and_downgrade_plans: { Args: never; Returns: undefined }
      complete_onboarding_step1: {
        Args: {
          p_agent_type: Database["public"]["Enums"]["agent_type"]
          p_bio: string
          p_company_name: string
          p_office_address: string
          p_operating_city_ids: string[]
          p_profile_id: string
          p_specializations: string[]
          p_website_url: string
          p_years_experience: number
        }
        Returns: undefined
      }
      complete_onboarding_step2: {
        Args: {
          p_profile_id: string
          p_rera_doc_url: string
          p_rera_number: string
          p_skipped: boolean
        }
        Returns: undefined
      }
      complete_onboarding_step3: {
        Args: { p_plan_id: string; p_profile_id: string; p_skipped: boolean }
        Returns: undefined
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      expire_featured_listings: { Args: never; Returns: undefined }
      expire_old_listings: { Args: never; Returns: undefined }
      get_free_plan_id: { Args: never; Returns: string }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_agent_or_builder: { Args: never; Returns: boolean }
      match_search_alerts: { Args: never; Returns: undefined }
      reset_monthly_free_leads: { Args: never; Returns: undefined }
      search_properties: {
        Args: {
          p_amenity_ids?: string[]
          p_bedrooms?: number
          p_category?: Database["public"]["Enums"]["property_category"]
          p_city_id?: string
          p_furnishing?: Database["public"]["Enums"]["furnishing_status"]
          p_is_verified?: boolean
          p_limit?: number
          p_locality_ids?: string[]
          p_max_area?: number
          p_max_price?: number
          p_min_area?: number
          p_min_price?: number
          p_offset?: number
          p_possession?: Database["public"]["Enums"]["possession_status"]
          p_property_type?: Database["public"]["Enums"]["property_type"]
          p_search_text?: string
          p_sort?: string
        }
        Returns: {
          area_unit: Database["public"]["Enums"]["area_unit"]
          bathrooms: number
          bedrooms: number
          carpet_area: number
          category: Database["public"]["Enums"]["property_category"]
          city_name: string
          cover_image_url: string
          furnishing: Database["public"]["Enums"]["furnishing_status"]
          id: string
          is_featured: boolean
          is_verified: boolean
          landmark: string
          leads_count: number
          locality_name: string
          possession_status: Database["public"]["Enums"]["possession_status"]
          price: number
          price_unit: Database["public"]["Enums"]["price_unit"]
          property_type: Database["public"]["Enums"]["property_type"]
          published_at: string
          slug: string
          society_name: string
          title: string
          total_count: number
          views_count: number
        }[]
      }
      search_properties_near: {
        Args: {
          p_category?: Database["public"]["Enums"]["property_category"]
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_km?: number
        }
        Returns: {
          bedrooms: number
          city_name: string
          cover_image_url: string
          distance_km: number
          id: string
          locality_name: string
          price: number
          slug: string
          title: string
        }[]
      }
      send_lead_followup_reminders: { Args: never; Returns: undefined }
      send_listing_expiry_warnings: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
      unlock_lead: {
        Args: { p_assignment_id: string; p_payment_id: string }
        Returns: undefined
      }
      upgrade_agent_plan: {
        Args: {
          p_agent_profile_id: string
          p_payment_id: string
          p_plan_id: string
        }
        Returns: undefined
      }
      verify_is_admin: { Args: { p_user_id: string }; Returns: boolean }
      verify_is_agent: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      agent_type:
        | "individual_agent"
        | "agency"
        | "builder_developer"
        | "individual_owner"
      amenity_category:
        | "basic"
        | "security"
        | "parking"
        | "recreation"
        | "green"
        | "convenience"
        | "connectivity"
      area_unit: "sqft" | "sqm" | "sqyd" | "acre" | "gunta" | "bigha" | "marla"
      blog_status: "draft" | "scheduled" | "published" | "archived"
      facing_direction:
        | "north"
        | "south"
        | "east"
        | "west"
        | "north_east"
        | "north_west"
        | "south_east"
        | "south_west"
      featured_placement:
        | "homepage_banner"
        | "homepage_cards"
        | "category_top"
        | "search_top"
        | "city_page_top"
      furnishing_status: "unfurnished" | "semi_furnished" | "fully_furnished"
      lead_intent:
        | "contact_owner"
        | "schedule_visit"
        | "callback_request"
        | "loan_inquiry"
        | "price_negotiation"
        | "project_brochure"
      lead_status:
        | "new"
        | "routed"
        | "unlocked"
        | "contacted"
        | "converted"
        | "dead"
      lead_unlock_method:
        | "free_credit"
        | "paid_unlock"
        | "plan_included"
        | "admin_granted"
      listing_status:
        | "draft"
        | "pending_review"
        | "live"
        | "rejected"
        | "sold"
        | "rented"
        | "expired"
        | "archived"
      loan_inquiry_status:
        | "new"
        | "assigned"
        | "documents_pending"
        | "in_progress"
        | "sanctioned"
        | "disbursed"
        | "rejected"
        | "cancelled"
      loan_type:
        | "home_loan"
        | "loan_against_property"
        | "machinery_loan"
        | "unsecured_business_loan"
        | "personal_loan"
        | "construction_loan"
        | "working_capital"
        | "balance_transfer"
        | "lease_rent_discounting"
        | "car_loan_new"
        | "car_loan_used"
      media_type:
        | "image"
        | "floor_plan"
        | "video"
        | "virtual_tour"
        | "brochure_pdf"
        | "rera_certificate"
        | "ownership_proof"
      moderation_action:
        | "approved"
        | "rejected"
        | "edited"
        | "suspended"
        | "restored"
        | "escalated"
      notification_channel: "in_app" | "email" | "sms" | "whatsapp"
      payment_purpose:
        | "subscription"
        | "lead_unlock"
        | "featured_listing"
        | "verified_badge"
        | "banner_ad"
        | "listing_renewal"
      payment_status: "created" | "success" | "failed" | "refunded" | "disputed"
      plan_duration: "monthly" | "quarterly" | "annual" | "lifetime"
      possession_status: "ready_to_move" | "under_construction" | "new_launch"
      price_unit: "total" | "per_month" | "per_sqft"
      property_age:
        | "new_construction"
        | "less_than_5_years"
        | "5_to_10_years"
        | "10_to_20_years"
        | "more_than_20_years"
      property_category:
        | "buy"
        | "sell"
        | "rent"
        | "commercial"
        | "plot_land"
        | "project"
        | "pg_coliving"
      property_type:
        | "apartment"
        | "independent_house"
        | "villa"
        | "row_house"
        | "penthouse"
        | "studio"
        | "office_space"
        | "shop"
        | "showroom"
        | "warehouse"
        | "industrial"
        | "coworking"
        | "plot"
        | "agricultural_land"
        | "farmhouse"
        | "townhouse"
        | "builder_floor"
        | "service_apartment"
      report_reason:
        | "already_sold_or_rented"
        | "wrong_price"
        | "wrong_location"
        | "fake_listing"
        | "duplicate_listing"
        | "misleading_photos"
        | "spam"
        | "other"
      user_role: "user" | "agent" | "builder" | "admin"
      verification_status: "pending" | "verified" | "rejected" | "not_submitted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_type: [
        "individual_agent",
        "agency",
        "builder_developer",
        "individual_owner",
      ],
      amenity_category: [
        "basic",
        "security",
        "parking",
        "recreation",
        "green",
        "convenience",
        "connectivity",
      ],
      area_unit: ["sqft", "sqm", "sqyd", "acre", "gunta", "bigha", "marla"],
      blog_status: ["draft", "scheduled", "published", "archived"],
      facing_direction: [
        "north",
        "south",
        "east",
        "west",
        "north_east",
        "north_west",
        "south_east",
        "south_west",
      ],
      featured_placement: [
        "homepage_banner",
        "homepage_cards",
        "category_top",
        "search_top",
        "city_page_top",
      ],
      furnishing_status: ["unfurnished", "semi_furnished", "fully_furnished"],
      lead_intent: [
        "contact_owner",
        "schedule_visit",
        "callback_request",
        "loan_inquiry",
        "price_negotiation",
        "project_brochure",
      ],
      lead_status: [
        "new",
        "routed",
        "unlocked",
        "contacted",
        "converted",
        "dead",
      ],
      lead_unlock_method: [
        "free_credit",
        "paid_unlock",
        "plan_included",
        "admin_granted",
      ],
      listing_status: [
        "draft",
        "pending_review",
        "live",
        "rejected",
        "sold",
        "rented",
        "expired",
        "archived",
      ],
      loan_inquiry_status: [
        "new",
        "assigned",
        "documents_pending",
        "in_progress",
        "sanctioned",
        "disbursed",
        "rejected",
        "cancelled",
      ],
      loan_type: [
        "home_loan",
        "loan_against_property",
        "machinery_loan",
        "unsecured_business_loan",
        "personal_loan",
        "construction_loan",
        "working_capital",
        "balance_transfer",
        "lease_rent_discounting",
        "car_loan_new",
        "car_loan_used",
      ],
      media_type: [
        "image",
        "floor_plan",
        "video",
        "virtual_tour",
        "brochure_pdf",
        "rera_certificate",
        "ownership_proof",
      ],
      moderation_action: [
        "approved",
        "rejected",
        "edited",
        "suspended",
        "restored",
        "escalated",
      ],
      notification_channel: ["in_app", "email", "sms", "whatsapp"],
      payment_purpose: [
        "subscription",
        "lead_unlock",
        "featured_listing",
        "verified_badge",
        "banner_ad",
        "listing_renewal",
      ],
      payment_status: ["created", "success", "failed", "refunded", "disputed"],
      plan_duration: ["monthly", "quarterly", "annual", "lifetime"],
      possession_status: ["ready_to_move", "under_construction", "new_launch"],
      price_unit: ["total", "per_month", "per_sqft"],
      property_age: [
        "new_construction",
        "less_than_5_years",
        "5_to_10_years",
        "10_to_20_years",
        "more_than_20_years",
      ],
      property_category: [
        "buy",
        "sell",
        "rent",
        "commercial",
        "plot_land",
        "project",
        "pg_coliving",
      ],
      property_type: [
        "apartment",
        "independent_house",
        "villa",
        "row_house",
        "penthouse",
        "studio",
        "office_space",
        "shop",
        "showroom",
        "warehouse",
        "industrial",
        "coworking",
        "plot",
        "agricultural_land",
        "farmhouse",
        "townhouse",
        "builder_floor",
        "service_apartment",
      ],
      report_reason: [
        "already_sold_or_rented",
        "wrong_price",
        "wrong_location",
        "fake_listing",
        "duplicate_listing",
        "misleading_photos",
        "spam",
        "other",
      ],
      user_role: ["user", "agent", "builder", "admin"],
      verification_status: ["pending", "verified", "rejected", "not_submitted"],
    },
  },
} as const
