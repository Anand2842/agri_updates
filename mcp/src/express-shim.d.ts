declare module 'express' {
    export interface Request {
        headers: Record<string, string | string[] | undefined>
        body?: unknown
    }

    export interface Response {
        headersSent: boolean
        status(code: number): this
        json(body: unknown): this
        setHeader(name: string, value: string): this
        on(event: 'close', listener: () => void): this
    }

    export interface Express {
        use(...args: any[]): any
        get(...args: any[]): any
        post(...args: any[]): any
        delete(...args: any[]): any
    }
}
