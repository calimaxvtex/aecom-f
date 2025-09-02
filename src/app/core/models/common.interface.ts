export interface BaseEntity {
    id: number | string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface AuditableEntity extends BaseEntity {
    isActive: boolean;
    isDeleted: boolean;
    deletedAt?: string;
    deletedBy?: string;
}

export interface SearchableEntity extends BaseEntity {
    name: string;
    description?: string;
    code?: string;
}

export interface StatusEntity extends BaseEntity {
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    statusDate?: string;
    statusNotes?: string;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface ContactInfo {
    email: string;
    phone?: string;
    mobile?: string;
    website?: string;
    socialMedia?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
    };
}

export interface FileAttachment {
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
}



