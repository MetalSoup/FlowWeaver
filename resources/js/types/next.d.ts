declare module 'next/document' {
  import * as React from 'react';
  export type DocumentContext = any;
  export type DocumentInitialProps = any;

  export default class Document extends React.Component<any, any> {
    static getInitialProps?(ctx: DocumentContext): Promise<DocumentInitialProps>;
    render(): React.ReactNode;
  }
}
