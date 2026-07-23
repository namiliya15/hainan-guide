// Email администратора вынесен в одну константу.
// Раньше эта строка была продублирована в 3 местах кода (PlaceCard, GuideApp x2),
// и в каждой карточке места делался отдельный запрос supabase.auth.getUser() —
// это лишняя сетевая нагрузка на каждую карточку на экране.
// Теперь считаем один раз на уровне App и передаём флагом вниз через пропсы.
export const ADMIN_EMAIL = 'namiliya15@gmail.com';

export function useIsAdmin(session) {
  return session?.user?.email === ADMIN_EMAIL;
}
