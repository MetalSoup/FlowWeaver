import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function PageSettings() {
  // Load current page props from Inertia page (when editing)
  const { props }: any = usePage();
  // Normalize various Inertia shapes: server may send `page` as the model, or as { data: {...} }, or as a Resource wrapper.
  const rawPage = props?.page ?? null;
  const page = rawPage?.data ?? rawPage ?? rawPage?.resource ?? null;

  // derive initial values from common shapes
  const initialName = page?.name ?? page?.data?.name ?? '';
  const initialSlug = page?.slug ?? page?.data?.slug ?? '';
  const initialTitle = (page?.options && page.options.title) ?? '';
  const initialKeywords = (page?.options && page.options.keywords) ?? '';
  const initialMeta = (page?.options && page.options.meta) ?? '';
  const initialHeaderJS = (page?.options && page.options.header_js) ?? '';
  const initialFooterJS = (page?.options && page.options.footer_js) ?? '';
  const initialHeaderCSS = (page?.options && page.options.header_css) ?? '';
  const initialFooterCSS = (page?.options && page.options.footer_css) ?? '';

  const [name, setName] = useState<string>(initialName);
  const [slug, setSlug] = useState<string>(initialSlug);
  const [title, setTitle] = useState<string>(initialTitle);
  const [keywords, setKeywords] = useState<string>(initialKeywords);
  const [meta, setMeta] = useState<string>(initialMeta);
  const [headerJs, setHeaderJs] = useState<string>(initialHeaderJS);
  const [footerJs, setFooterJs] = useState<string>(initialFooterJS);
  const [headerCss, setHeaderCss] = useState<string>(initialHeaderCSS);
  const [footerCss, setFooterCss] = useState<string>(initialFooterCSS);
  // Track which fields the user has modified so we only send those (prevents accidental overwrites)
  const [modified, setModified] = useState<Record<string, boolean>>({});

  // Keep local state in sync when page prop changes
  useEffect(() => {
    setName(initialName);
    setSlug(initialSlug);
    setTitle(initialTitle);
    setKeywords(initialKeywords);
    setMeta(initialMeta);
    setHeaderJs(initialHeaderJS);
    setFooterJs(initialFooterJS);
    setHeaderCss(initialHeaderCSS);
    setFooterCss(initialFooterCSS);
    // reset modified flags when the page prop changes (e.g. after a successful save)
    setModified({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.page]);

  // Whenever settings change, write them to a global so the main Save button can pick them up
  useEffect(() => {
    try {
      (window as any).__PAGE_SETTINGS = (window as any).__PAGE_SETTINGS || {};
      const key = page?.id ?? page?.data?.id ?? 'unsaved';
      const entry: any = {};

      // top-level fields
      if (modified['name']) entry.name = name;
      if (modified['slug']) entry.slug = slug;

      // options: include only modified option fields
      const opts: Record<string, any> = {};
      if (modified['title']) opts.title = title;
      if (modified['keywords']) opts.keywords = keywords;
      if (modified['meta']) opts.meta = meta;
      if (modified['header_js']) opts.header_js = headerJs;
      if (modified['footer_js']) opts.footer_js = footerJs;
      if (modified['header_css']) opts.header_css = headerCss;
      if (modified['footer_css']) opts.footer_css = footerCss;

      if (Object.keys(opts).length) entry.options = opts;

      // only write an entry if something was modified
      if (Object.keys(entry).length) {
        (window as any).__PAGE_SETTINGS[key] = { ...(window as any).__PAGE_SETTINGS[key] || {}, ...entry };
      }
    } catch (e) {
      // ignore failures writing to window
    }
  }, [name, slug, title, keywords, meta, headerJs, footerJs, headerCss, footerCss, page, modified]);


  return (
    <div className="p-3 space-y-3">
      <h3 className="font-semibold">Page Settings</h3>

      <div>
        <label className="block text-sm text-gray-600">Name</label>
        <input className="w-full border rounded px-2 py-1" value={name} onChange={e => { setName(e.target.value); setModified(m => ({ ...m, name: true })); }} />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Slug</label>
        <input className="w-full border rounded px-2 py-1" value={slug} onChange={e => { setSlug(e.target.value); setModified(m => ({ ...m, slug: true })); }} />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Page title (meta)</label>
        <input className="w-full border rounded px-2 py-1" value={title} onChange={e => { setTitle(e.target.value); setModified(m => ({ ...m, title: true })); }} />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Keywords (comma separated)</label>
        <input className="w-full border rounded px-2 py-1" value={keywords} onChange={e => { setKeywords(e.target.value); setModified(m => ({ ...m, keywords: true })); }} />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Additional meta (raw HTML/meta tags)</label>
        <textarea className="w-full border rounded px-2 py-1 font-mono text-sm" rows={4} value={meta} onChange={e => { setMeta(e.target.value); setModified(m => ({ ...m, meta: true })); }} />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Header CSS (injected into head)</label>
        <textarea className="w-full border rounded px-2 py-1 font-mono text-sm" rows={4} value={headerCss} onChange={e => { setHeaderCss(e.target.value); setModified(m => ({ ...m, header_css: true })); }} />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Footer CSS (injected before body end)</label>
        <textarea className="w-full border rounded px-2 py-1 font-mono text-sm" rows={2} value={footerCss} onChange={e => { setFooterCss(e.target.value); setModified(m => ({ ...m, footer_css: true })); }} />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Header JavaScript (injected into head)</label>
        <textarea className="w-full border rounded px-2 py-1 font-mono text-sm" rows={4} value={headerJs} onChange={e => { setHeaderJs(e.target.value); setModified(m => ({ ...m, header_js: true })); }} />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Footer JavaScript (injected before body end)</label>
        <textarea className="w-full border rounded px-2 py-1 font-mono text-sm" rows={4} value={footerJs} onChange={e => { setFooterJs(e.target.value); setModified(m => ({ ...m, footer_js: true })); }} />
      </div>

      <div className="flex justify-end space-x-2">
        <button type="button" onClick={() => location.reload()} className="px-3 py-1 border rounded text-sm">Cancel</button>
        <span className="text-xs text-gray-500 self-center">Changes are saved when you press the main "Save Changes" button.</span>
      </div>
    </div>
  );
}
