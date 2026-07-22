import { useEffect, useState } from 'react';
import { hasSupabaseConfig, supabase } from '../../lib/supabase';
import { defaultCategories } from '../../data/categories';

const LOCAL_CATEGORY_KEY = 'hainan-guide-category-order';

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useCategoryOrder(session) {
  const [categoryOrder, setCategoryOrder] = useState(defaultCategories);

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  async function loadOrder() {
    if (!session || !hasSupabaseConfig || session.localOnly) {
      setCategoryOrder(readJson(LOCAL_CATEGORY_KEY, defaultCategories));
      return;
    }
    const { data } = await supabase.from('profiles').select('category_order').eq('id', session.user.id).maybeSingle();
    setCategoryOrder(data?.category_order?.length ? data.category_order : defaultCategories);
  }

  async function saveCategoryOrder(nextOrder) {
    setCategoryOrder(nextOrder);
    if (!session || !hasSupabaseConfig || session.localOnly) {
      writeJson(LOCAL_CATEGORY_KEY, nextOrder);
      return;
    }
    await supabase.from('profiles').upsert({ id: session.user.id, email: session.user.email, category_order: nextOrder });
  }

  return { categoryOrder, saveCategoryOrder };
}
