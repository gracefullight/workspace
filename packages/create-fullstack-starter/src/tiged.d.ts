declare module "tiged" {
  interface TigedOptions {
    disableCache?: boolean;
    force?: boolean;
    verbose?: boolean;
    mode?: "tar" | "git";
  }

  interface TigedInfo {
    code: string;
    message: string;
    repo?: {
      user: string;
      name: string;
    };
    dest?: string;
  }

  interface TigedEmitter {
    on(event: "info", callback: (info: TigedInfo) => void): void;
    on(event: "warn", callback: (info: TigedInfo) => void): void;
    clone(dest: string): Promise<void>;
  }

  function tiged(src: string, options?: TigedOptions): TigedEmitter;

  export default tiged;
}
