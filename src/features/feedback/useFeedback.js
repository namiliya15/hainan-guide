import { useEffect, useState } from 'react';
import { hasSupabaseConfig, supabase } from '../../lib/supabase';

// Работает только когда настроен Supabase — обратная связь без бэкенда
// не имеет смысла (некому это увидеть). Если Supabase не настроен,
// формы всё равно можно показать, но отправка вернёт понятную ошибку.
export function useFeedback(session, isAdmin) {
  const [mySuggestions, setMySuggestions] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [adminSuggestions, setAdminSuggestions] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!hasSupabaseConfig) return;
    if (session) loadMySubmissions();
    if (isAdmin) loadAdminInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, isAdmin]);

  function showNotice(text) {
    setNotice(text);
    setTimeout(() => setNotice(''), 3000);
  }

  async function loadMySubmissions() {
    const [{ data: suggestions }, { data: reports }] = await Promise.all([
      supabase.from('place_suggestions').select('*').eq('submitted_by', session.user.id).order('created_at', { ascending: false }),
      supabase.from('place_reports').select('*').eq('submitted_by', session.user.id).order('created_at', { ascending: false }),
    ]);
    setMySuggestions(suggestions || []);
    setMyReports(reports || []);
  }

  async function loadAdminInbox() {
    const [{ data: suggestions }, { data: reports }] = await Promise.all([
      supabase.from('place_suggestions').select('*').order('created_at', { ascending: false }),
      supabase.from('place_reports').select('*, places(name)').order('created_at', { ascending: false }),
    ]);
    setAdminSuggestions(suggestions || []);
    setAdminReports(reports || []);
  }

  const pendingCount =
    adminSuggestions.filter((s) => s.status === 'pending').length + adminReports.filter((r) => r.status === 'pending').length;

  async function submitSuggestion(draft) {
    if (!hasSupabaseConfig) {
      showNotice('Форма работает только на опубликованном сайте с подключённым Supabase.');
      return false;
    }
    const payload = {
      id: crypto.randomUUID(),
      submitted_by: session?.user?.id && !session.localOnly ? session.user.id : null,
      submitted_email: draft.email || session?.user?.email || null,
      name: draft.name.trim(),
      chinese_name: draft.chinese_name?.trim() || null,
      chinese_address: draft.chinese_address?.trim() || null,
      category: draft.category || null,
      description: draft.description?.trim() || null,
      lat: draft.lat ? Number(draft.lat) : null,
      lng: draft.lng ? Number(draft.lng) : null,
      note: draft.note?.trim() || null,
    };
    const { error } = await supabase.from('place_suggestions').insert(payload);
    if (error) {
      showNotice('Не получилось отправить: ' + error.message);
      return false;
    }
    showNotice('Спасибо! Место отправлено на проверку.');
    if (session && !session.localOnly) await loadMySubmissions();
    return true;
  }

  async function submitReport(placeId, draft) {
    if (!hasSupabaseConfig) {
      showNotice('Форма работает только на опубликованном сайте с подключённым Supabase.');
      return false;
    }
    const payload = {
      id: crypto.randomUUID(),
      place_id: placeId,
      submitted_by: session?.user?.id && !session.localOnly ? session.user.id : null,
      submitted_email: draft.email || session?.user?.email || null,
      message: draft.message.trim(),
    };
    const { error } = await supabase.from('place_reports').insert(payload);
    if (error) {
      showNotice('Не получилось отправить: ' + error.message);
      return false;
    }
    showNotice('Спасибо, передали администратору!');
    if (session && !session.localOnly) await loadMySubmissions();
    return true;
  }

  // Одобрение предложения — переносит его в основную таблицу мест.
  async function approveSuggestion(suggestion) {
    const { id, submitted_by, submitted_email, note, status, admin_reply, created_at, updated_at, ...placeFields } = suggestion;
    const { error: insertError } = await supabase.from('places').insert({
      id: crypto.randomUUID(),
      ...placeFields,
      category: placeFields.category || 'Интересные места',
      is_public: true,
      user_id: session?.user?.id,
    });
    if (insertError) {
      showNotice('Ошибка переноса в места: ' + insertError.message);
      return;
    }
    await supabase.from('place_suggestions').update({ status: 'approved', updated_at: new Date() }).eq('id', suggestion.id);
    showNotice('Место опубликовано и добавлено на сайт.');
    await loadAdminInbox();
  }

  async function rejectSuggestion(id, reply) {
    await supabase
      .from('place_suggestions')
      .update({ status: 'rejected', admin_reply: reply || null, reply_seen: reply ? false : true, updated_at: new Date() })
      .eq('id', id);
    showNotice('Предложение отклонено.');
    await loadAdminInbox();
  }

  async function replySuggestion(id, reply) {
    await supabase.from('place_suggestions').update({ admin_reply: reply, reply_seen: false, updated_at: new Date() }).eq('id', id);
    showNotice('Ответ сохранён.');
    await loadAdminInbox();
  }

  async function resolveReport(id, reply) {
    await supabase
      .from('place_reports')
      .update({ status: 'resolved', admin_reply: reply || null, reply_seen: reply ? false : true, updated_at: new Date() })
      .eq('id', id);
    showNotice('Отмечено как решено.');
    await loadAdminInbox();
  }

  async function replyReport(id, reply) {
    await supabase.from('place_reports').update({ admin_reply: reply, reply_seen: false, updated_at: new Date() }).eq('id', id);
    showNotice('Ответ сохранён.');
    await loadAdminInbox();
  }

  // Отметить у себя (автора заявки) все ответы прочитанными — вызывается,
  // когда пользователь открывает страницу "Мои предложения" или сам
  // всплывающий тост с уведомлением.
  async function markRepliesSeen() {
    if (!session) return;
    await Promise.all([
      supabase.from('place_suggestions').update({ reply_seen: true }).eq('submitted_by', session.user.id).eq('reply_seen', false),
      supabase.from('place_reports').update({ reply_seen: true }).eq('submitted_by', session.user.id).eq('reply_seen', false),
    ]);
    await loadMySubmissions();
  }

  const unreadReplyCount =
    mySuggestions.filter((s) => s.admin_reply && !s.reply_seen).length + myReports.filter((r) => r.admin_reply && !r.reply_seen).length;

  return {
    mySuggestions,
    myReports,
    adminSuggestions,
    adminReports,
    pendingCount,
    unreadReplyCount,
    notice,
    submitSuggestion,
    submitReport,
    approveSuggestion,
    rejectSuggestion,
    replySuggestion,
    resolveReport,
    replyReport,
    markRepliesSeen,
  };
}
