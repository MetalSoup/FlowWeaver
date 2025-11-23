import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import Modal from '@/Components/Modal';
import MediaPicker from './MediaPicker';

export const ImageSettings = () => {
  // cast node to any so TypeScript allows access to node.actions
  const { actions, props } = useNode((node: any) => ({ actions: node.actions, props: node.data.props }));
  const setProp = actions?.setProp as any;

  const [showPicker, setShowPicker] = useState(false);

  const openMediaManager = () => setShowPicker(true);
  const closeMediaManager = () => setShowPicker(false);

  const onSelect = (m: any) => {
    if (typeof setProp === 'function') {
      setProp((p: any) => {
        p.public_url = m.public_url ?? m.url;
        p.url = m.url;
        p.file_name = m.file_name;
        p.mime_type = m.mime_type;
        p.media_id = m.id;
      });
    }
    closeMediaManager();
  };

  return (
    <div className="p-2">
      <div className="mb-2">
                <button type="button" onClick={openMediaManager} className="px-3 py-1 bg-indigo-500 text-white rounded dark:bg-indigo-600 dark:text-white">Choose Image</button>
      </div>

      <div className="mb-2">
                <label className="block text-xs text-gray-600 dark:text-gray-400">Alt text</label>
        <input defaultValue={props?.alt ?? ''} onBlur={(e) => { if (typeof setProp === 'function') setProp((p: any) => p.alt = e.target.value); }} className="w-full border rounded px-2 py-1" />
      </div>

      <div className="mb-2">
        <label className="block text-xs text-gray-600 dark:text-gray-400">Caption</label>
        <input defaultValue={props?.caption ?? ''} onBlur={(e) => { if (typeof setProp === 'function') setProp((p: any) => p.caption = e.target.value); }} className="w-full border rounded px-2 py-1" />
      </div>

      <div className="mb-2">
        <label className="block text-xs text-gray-600 dark:text-gray-400">Width (px or %)</label>
        <input defaultValue={props?.width ?? ''} onBlur={(e) => { if (typeof setProp === 'function') setProp((p: any) => p.width = e.target.value); }} className="w-full border rounded px-2 py-1" />
      </div>

      <div className="mb-2">
        <label className="block text-xs text-gray-600 dark:text-gray-400">Height (px or auto)</label>
        <input defaultValue={props?.height ?? ''} onBlur={(e) => { if (typeof setProp === 'function') setProp((p: any) => p.height = e.target.value); }} className="w-full border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>

      <div>
        <small>Current: {props?.file_name ?? 'Placeholder'}</small>
      </div>

      <Modal show={showPicker} onClose={closeMediaManager} maxWidth="2xl">
        <MediaPicker onSelect={onSelect} />
      </Modal>
    </div>
  );
};

export default ImageSettings;
