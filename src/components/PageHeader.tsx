import { useState, useRef, useEffect } from 'react';
import { PageIcon, PAGE_ICON_KEYS, pageIconValue } from './PageIcon';
import { Page } from '@/hooks/usePages';
import { Button } from '@/components/ui/button';
import { PageTags } from './PageTags';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PageHeaderProps {
  page: Page;
  onUpdatePage: (id: string, updates: Partial<Page>) => void;
}

export function PageHeader({ page, onUpdatePage }: PageHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(page.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(page.title);
  }, [page.title]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title !== page.title) {
      onUpdatePage(page.id, { title: title || 'Untitled' });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
    if (e.key === 'Escape') {
      setTitle(page.title);
      setIsEditingTitle(false);
    }
  };

  const handleIconSelect = (icon: string) => {
    onUpdatePage(page.id, { icon });
  };

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-start gap-2 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto p-2 text-4xl hover:bg-muted"
              aria-label="Change page icon"
            >
              <PageIcon icon={page.icon} className="size-9" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="grid grid-cols-5 gap-1">
              {PAGE_ICON_KEYS.map((key) => (
                <Button
                  key={key}
                  variant="ghost"
                  className="h-10 w-10 p-0 hover:bg-muted"
                  aria-label={key}
                  onClick={() => handleIconSelect(pageIconValue(key))}
                >
                  <PageIcon icon={pageIconValue(key)} className="size-5" />
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isEditingTitle ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="text-4xl font-bold w-full bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
          placeholder="Untitled"
        />
      ) : (
        <h1 className="text-4xl font-bold">
          <button
            type="button"
            className="w-full text-left cursor-text hover:bg-muted/50 rounded px-1 -mx-1 transition-colors focus-visible:outline-2 focus-visible:outline-ring"
            aria-label="Rename page"
            onClick={() => setIsEditingTitle(true)}
          >
            {page.title || 'Untitled'}
          </button>
        </h1>
      )}
      <PageTags pageId={page.id} />
    </div>
  );
}
