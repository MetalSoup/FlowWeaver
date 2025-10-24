declare module '*.svg' {
  import * as React from 'react';
  const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module 'react-color' {
  import * as React from 'react';
  export const ChromePicker: React.ComponentType<any>;
  const exports: any;
  export default exports;
}
