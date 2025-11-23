import React, { useEffect, useState, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import Input from "@/Components/Input";
import TextArea from "@/Components/TextArea";

export default function PageSettings() {
  // Load current page props from Inertia page (when editing)
  const pageContext: any = usePage();
  const props: any = pageContext.props;
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
  const slugInputRef = useRef<HTMLInputElement | null>(null);
  const isComposingRef = useRef<boolean>(false);
  const [title, setTitle] = useState<string>(initialTitle);
  const [keywords, setKeywords] = useState<string>(initialKeywords);
  const [meta, setMeta] = useState<string>(initialMeta);
  const [headerJs, setHeaderJs] = useState<string>(initialHeaderJS);
  const [footerJs, setFooterJs] = useState<string>(initialFooterJS);
  const [headerCss, setHeaderCss] = useState<string>(initialHeaderCSS);
  const [footerCss, setFooterCss] = useState<string>(initialFooterCSS);
  // Track which fields the user has modified so we only send those (prevents accidental overwrites)
  const [modified, setModified] = useState<Record<string, boolean>>({});
  const prevPageRef = useRef<any>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugChecking, setSlugChecking] = useState<boolean>(false);
  const [slugValid, setSlugValid] = useState<boolean>(!!initialSlug);

  // Keep local state in sync when page prop changes
  useEffect(() => {
    // Only overwrite fields that the user hasn't modified locally. This prevents the
    // slug from being reset by an Inertia validation response while the user is typing.
    if (!modified['name']) setName(initialName);
    if (!modified['slug']) setSlug(initialSlug);
    if (!modified['title']) setTitle(initialTitle);
    if (!modified['keywords']) setKeywords(initialKeywords);
    if (!modified['meta']) setMeta(initialMeta);
    if (!modified['header_js']) setHeaderJs(initialHeaderJS);
    if (!modified['footer_js']) setFooterJs(initialFooterJS);
    if (!modified['header_css']) setHeaderCss(initialHeaderCSS);
    if (!modified['footer_css']) setFooterCss(initialFooterCSS);

    // Detect whether the incoming page props actually changed compared to the last
    // known props (so we only clear modified flags on a real save/refresh).
    const prev = prevPageRef.current;
    const curr = props?.page ?? null;
    let propsChanged: boolean;
    try {
      propsChanged = JSON.stringify(prev) !== JSON.stringify(curr);
    } catch (e) {
      propsChanged = prev !== curr;
    }

    if (propsChanged) {
      // Clear modified only when props differ (indicates a server-side save/refresh)
      setModified({});
    }

    // update prev ref for next comparison
    prevPageRef.current = curr;


  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.page]);



  // Whenever settings change, write them to a global so the main Save button can pick them up
  useEffect(() => {
    try {
      (window as any).__PAGE_SETTINGS = (window as any).__PAGE_SETTINGS || {};
      (window as any).__PAGE_SETTINGS_VALID = (window as any).__PAGE_SETTINGS_VALID || {};
      const key = page?.id ?? page?.data?.id ?? 'unsaved';
      const entry: any = {};

      // top-level fields
      if (modified['name']) entry.name = name;
           if (modified['slug']) entry.slug = slug;

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

      // write a lightweight validation status so the global editor can disable save when necessary
      (window as any).__PAGE_SETTINGS_VALID[key] = {
        slugValid: slugValid,
        slugChecking: slugChecking,
      };
      try { console.debug('[PageSettings] wrote', { key, entry, pageSettings: (window as any).__PAGE_SETTINGS[key] }); } catch(e){}
       // Dispatch a global event so the editor (or any listener) can react immediately
       try {
         if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
           window.dispatchEvent(new CustomEvent('page-settings-updated', { detail: { pageKey: key } }));
         }
       } catch (e) {
         // ignore
       }
     } catch (e) {
       // ignore failures writing to window
     }
   }, [name, slug, title, keywords, meta, headerJs, footerJs, headerCss, footerCss, page, modified, slugValid]);


   return (
    <div className="p-3 space-y-3">
      <h3 className="font-semibold">Page Settings</h3>

      <div>
        <label className="text-sm">Name</label>
        <Input value={name} onChange={e => { setName(e.target.value); setModified(m => ({ ...m, name: true })); }} />
      </div>

      <div>
        <label className="text-sm">Slug</label>
        <Input
          className={`w-full dark:bg-gray-600 border rounded px-2 py-1 ${slugError ? 'border-red-500' : ''}`}
          value={slug}
          onChange={e => { setSlug(e.target.value); setModified(m => ({ ...m, slug: true })); }} />
      </div>

      <div>
        <label className="text-sm">Page title (meta)</label>
        <Input value={title} onChange={e => { setTitle(e.target.value); setModified(m => ({ ...m, title: true })); }} />
      </div>

      <div>
        <label className="text-sm">Keywords (comma separated)</label>
        <Input value={keywords} onChange={e => { setKeywords(e.target.value); setModified(m => ({ ...m, keywords: true })); }} />
      </div>

      <div>
        <label className="text-sm">Additional meta (raw HTML/meta tags)</label>
        <TextArea rows={4} value={meta} onChange={e => { setMeta(e.target.value); setModified(m => ({ ...m, meta: true })); }} />
      </div>

      <div>
        <label className="text-sm">Header CSS (injected into head)</label>
        <TextArea rows={4} value={headerCss} onChange={e => { setHeaderCss(e.target.value); setModified(m => ({ ...m, header_css: true })); }} />
      </div>

      <div>
        <label className="text-sm">Footer CSS (injected before body end)</label>
        <TextArea rows={2} value={footerCss} onChange={e => { setFooterCss(e.target.value); setModified(m => ({ ...m, footer_css: true })); }} />
      </div>

      <div>
        <label className="text-sm">Header JavaScript (injected into head)</label>
        <TextArea rows={4} value={headerJs} onChange={e => { setHeaderJs(e.target.value); setModified(m => ({ ...m, header_js: true })); }} />
      </div>

      <div>
        <label className="text-sm">Footer JavaScript (injected before body end)</label>
        <TextArea rows={4} value={footerJs} onChange={e => { setFooterJs(e.target.value); setModified(m => ({ ...m, footer_js: true })); }} />
      </div>

      <div className="flex justify-end space-x-2">
        <button type="button" onClick={() => location.reload()} className="px-3 py-1 border rounded text-sm">Cancel</button>
        <span className="text-xs text-gray-500 self-center">Changes are saved when you press the main "Save Changes" button.</span>
      </div>
    </div>
  );
}
