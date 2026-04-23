export type ObfBlock = {
    raw: string;
    attributes: Record<string, string>;
};
export declare function parseObfFences(markdown: string): ObfBlock[];
export declare function renderObfHtml(block: ObfBlock): string;
