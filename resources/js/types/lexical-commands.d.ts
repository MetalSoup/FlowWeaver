declare module '@lexical/rich-text' {
    // Minimal command declarations used by the editor toolbar.
    // Real types live in the package; these stubs let the project compile when node_modules types aren't available.
    export const FORMAT_TEXT_COMMAND: any;
    export const FORMAT_ELEMENT_COMMAND: any;
    export const INSERT_ORDERED_LIST_COMMAND: any;
    export const INSERT_UNORDERED_LIST_COMMAND: any;
}

declare module '@lexical/link' {
    export const TOGGLE_LINK_COMMAND: any;
}

declare module '@lexical/list' {
    export const INSERT_ORDERED_LIST_COMMAND: any;
    export const INSERT_UNORDERED_LIST_COMMAND: any;
    export const TOGGLE_LIST: any;
}

declare module 'lexical' {
    // Core utilities and commands
    export const $getRoot: any;
    export const $getSelection: any;
    export const $isRangeSelection: any;
    export const FORMAT_TEXT_COMMAND: any;
    export const FORMAT_ELEMENT_COMMAND: any;
    export const UNDO_COMMAND: any;
    export const REDO_COMMAND: any;
}
