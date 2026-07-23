import { useEffect, useRef } from 'react';
import { Bold, Heading2, Image as ImageIcon, Italic, Link2, List, Underline, Upload } from 'lucide-react';

// Редактор на contentEditable + document.execCommand — это устаревший, но всё ещё
// рабочий во всех браузерах способ сделать простой WYSIWYG без тяжёлых зависимостей
// (Tiptap/Slate добавили бы несколько npm-пакетов, которые я не могу проверить
// сборкой в этой среде). Для админки одного человека этого достаточно: жирный,
// курсив, подчёркивание, заголовок, список, ссылка, вставка фото по URL/загрузкой.
//
// Важно: contentEditable — неконтролируемый элемент. Если на каждое нажатие клавиши
// переустанавливать innerHTML из пропса `value`, курсор будет прыгать в начало текста
// при каждом символе. Поэтому HTML ставится в DOM только один раз при монтировании —
// когда открываешь другую статью на редактирование, родитель должен пересоздать
// компонент через `key={id}`, а не полагаться на обновление пропса.
export function RichTextEditor({ value, onChange, onUploadImage }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value || '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command, arg) {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    onChange(editorRef.current?.innerHTML || '');
  }

  function insertImageUrl() {
    const url = prompt('Ссылка на фото:');
    if (url) exec('insertImage', url);
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = await onUploadImage(file);
    if (url) exec('insertImage', url);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function insertLink() {
    const url = prompt('Ссылка (https://...):');
    if (url) exec('createLink', url);
  }

  const buttons = [
    { icon: Bold, label: 'Жирный', action: () => exec('bold') },
    { icon: Italic, label: 'Курсив', action: () => exec('italic') },
    { icon: Underline, label: 'Подчёркнутый', action: () => exec('underline') },
    { icon: Heading2, label: 'Заголовок', action: () => exec('formatBlock', '<h2>') },
    { icon: List, label: 'Список', action: () => exec('insertUnorderedList') },
    { icon: Link2, label: 'Ссылка', action: insertLink },
    { icon: ImageIcon, label: 'Фото', action: insertImageUrl },
  ];

  return (
    <div className="rounded-lg border border-sand-300 dark:border-night-surface2">
      <div className="flex flex-wrap items-center gap-1 border-b border-sand-300 bg-sand-200/60 p-2 dark:border-night-surface2 dark:bg-night-surface2/60">
        {buttons.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={action}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-white dark:text-mist dark:hover:bg-night-surface"
          >
            <Icon size={16} />
          </button>
        ))}
        <label className="grid h-8 w-8 cursor-pointer place-items-center rounded-md text-slate-600 hover:bg-white dark:text-mist dark:hover:bg-night-surface" title="Загрузить фото с компьютера">
          <Upload size={16} />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        className="min-h-[280px] max-w-none p-4 text-[15px] leading-relaxed text-ink outline-none dark:text-white [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_img]:my-3 [&_img]:rounded-lg [&_a]:text-lagoon [&_a]:underline dark:[&_a]:text-aqua"
      />
    </div>
  );
}
