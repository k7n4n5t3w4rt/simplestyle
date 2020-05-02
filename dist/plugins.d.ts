export declare type PosthookPlugin = (sheetContents: string) => string;
export declare function getPosthooks(): PosthookPlugin[];
export declare function registerPosthook(posthook: PosthookPlugin): void;
