import { useEditor } from '@craftjs/core';
import cx from 'classnames';
import React, { useEffect } from 'react';

import { Header } from './Header';
import { Toolbox } from './Toolbox';

export const Viewport: React.FC<{
  children?: React.ReactNode;
  viewportSize?: 'mobile' | 'tablet' | 'desktop';
}> = ({ children, viewportSize = 'desktop' }) => {
  const {
    enabled,
    connectors,
    actions: { setOptions },
  } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  useEffect(() => {
    if (!window) {
      return;
    }

    window.requestAnimationFrame(() => {
      // Notify doc site
      window.parent.postMessage(
        {
          LANDING_PAGE_LOADED: true,
        },
        '*'
      );

      setTimeout(() => {
        setOptions((options) => {
          options.enabled = true;
        });
      }, 200);
    });
  }, [setOptions]);

  // Compute an inline width for the preview frame based on selected size
  const previewWidthStyle: React.CSSProperties = (() => {
    switch (viewportSize) {
      case 'mobile':
        return { width: '375px', maxWidth: '100%' };
      case 'tablet':
        return { width: '768px', maxWidth: '100%' };
      case 'desktop':
      default:
        return { width: '100%' };
    }
  })();

  return (
    <div className="viewport w-full h-full">
      <div
        className={cx(['flex h-full overflow-hidden flex-row w-full relative'])}
      >

        <div className="page-container flex flex-1 h-full flex-col">

          <div
            className={cx([
              'craftjs-renderer flex-1 h-full w-full transition pb-8 overflow-auto',
              {
                'bg-renderer-gray': enabled,
              },
            ])}
            ref={(ref) => {
              connectors.select(connectors.hover(ref, null), null);
            }}
          >
            {/* center the preview area and constrain its width based on `viewportSize` */}
            <div className="relative flex-col flex items-center pt-8">
              <div
                className={cx([
                  'preview-frame bg-white border rounded overflow-hidden',
                  // smooth transitions on width/box-shadow
                  'transition-all duration-300 ease-in-out',
                  // subtle different elevation when constrained to smaller devices
                  { 'shadow-lg': viewportSize !== 'desktop', 'shadow-sm': viewportSize === 'desktop' },
                ])}
                style={previewWidthStyle}
                data-viewport-size={viewportSize}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
