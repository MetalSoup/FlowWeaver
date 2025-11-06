import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    selected_instance_id?: number | null;
    selected_organization_id?: number | null;
}

export type MaybeSelectedInstance = { id: number; name: string } | null;
export type MaybeSelectedOrganization = { id: number; name: string } | null;

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
    selected_instance?: MaybeSelectedInstance;
    selected_organization?: MaybeSelectedOrganization;

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

export type SingleInstanceProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    instance: {
        id: number;
        name: string;
        description?: string;
        organization_id?: number;
        created_at: string;
        updated_at: string;

    };
};
