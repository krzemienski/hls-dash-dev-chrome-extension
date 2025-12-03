// src/types/mpd-parser.d.ts
// Type definitions for mpd-parser
declare module 'mpd-parser' {
  export function parse(content: string, options?: { manifestUri?: string }): any;
}
