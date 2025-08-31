export interface MenuItem {
    to?: string
    onClick?: (event: UIEvent) => void
    label: string
    authGuard?: boolean
    authSkip?: boolean
    rolesGuard?: string[]
    skipHeader?: boolean
    skipMobileMenu?: boolean
    active?: boolean
}

// TODO - make it shared 
export type Payload = { roles: UserRole[] }
export type UserRole = string