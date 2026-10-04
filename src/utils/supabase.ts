import { createClient } from '@supabase/supabase-js';
import type { PlanItem } from '../types';

export function createSupabaseClient(url: string, anonKey: string) {
  try {
    return createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error('Invalid Supabase connection settings', error);
    return null;
  }
}

export async function fetchSharedPlans(client: ReturnType<typeof createSupabaseClient>): Promise<PlanItem[]> {
  if (!client) throw new Error('การตั้งค่า Supabase ไม่ถูกต้อง');

  const { data, error } = await client
    .from('plan_items')
    .select('data')
    .order('id', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(row => row.data as PlanItem);
}
