export type UsxdSurface = {
    title: string;
    body: string;
};
export declare function parseUsxdFences(markdown: string): UsxdSurface[];
export declare function renderUsxdHtml(surface: UsxdSurface): string;
