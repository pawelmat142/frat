import { UserRole } from "@shared/interfaces/UserI"

export interface MenuItem {
    to?: string
    onClick?: (event: UIEvent) => void
    label: string
    authGuard?: boolean
    authSkip?: boolean
    rolesGuard?: UserRole[]
    skipHeader?: boolean
    skipMobileMenu?: boolean
    active?: boolean
}