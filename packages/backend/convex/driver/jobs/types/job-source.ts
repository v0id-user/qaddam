export interface JobSource {
    source: 'linked-in' | 'indeed' | 'google';
    searchUrl: string;
}