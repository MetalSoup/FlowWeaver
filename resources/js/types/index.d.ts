import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    pages: {
        data: {
            id: number;
            name: string;
            slug: string;
            created_at: string;
            updated_at: string;
        }[];
    }



    ziggy: Config & { location: string };

};
export type SinglePageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    page: {
        data: {
            id: number;
            name: string;
            slug: string;
            content: string;
            created_at: string;
            updated_at: string;
        }
    };
};


export type FlowProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flows: {
        data: {
            id: number;
            name: string;
            sequence: string;
            created_at: string;
            updated_at: string;
        }[];
    }



    ziggy: Config & { location: string };

};


export type SingleFlowProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flow: {
        data: {
            id: number;
            name: string;
            sequence: string;
            created_at: string;
            updated_at: string;
        }
    };
};


