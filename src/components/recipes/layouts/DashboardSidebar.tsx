import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useBrand } from '@/hooks/useBrand'
import { 
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  LucideIcon
} from 'lucide-react'
import { useState, ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

export interface NavItem {
  label: string
  icon: LucideIcon
  href: string
  badge?: string | number
  subItems?: Array<{
    label: string
    href: string
  }>
}

export interface DashboardSidebarProps {
  logo?: ReactNode
  logoCollapsed?: ReactNode
  user?: {
    name: string
    email: string
    avatar?: string
  }
  navItems?: NavItem[]
  bottomItems?: NavItem[]
  defaultCollapsed?: boolean
  onLogout?: () => void
  className?: string
}

const defaultNavItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics', badge: 'New' },
  { label: 'Users', icon: Users, href: '/users', badge: 12 },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

const defaultBottomItems: NavItem[] = [
  { label: 'Help & Support', icon: HelpCircle, href: '/help' },
]

/**
 * DashboardSidebar - Modern collapsible sidebar navigation
 * 
 * Perfect for: Admin panels, dashboards, SaaS applications
 * Features: Collapsible, brand-aware, user profile, badges
 * 
 * @example
 * ```tsx
 * <DashboardSidebar
 *   logo={<img src="/logo.png" />}
 *   user={{ name: "John Doe", email: "john@example.com" }}
 *   navItems={navItems}
 *   onLogout={() => handleLogout()}
 * />
 * ```
 */
export function DashboardSidebar({
  logo,
  logoCollapsed,
  user,
  navItems = defaultNavItems,
  bottomItems = defaultBottomItems,
  defaultCollapsed = false,
  onLogout,
  className,
}: DashboardSidebarProps) {
  const { config } = useBrand()
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const location = useLocation()

  const isActive = (href: string) => location.pathname === href

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative flex flex-col border-r bg-background',
        config.preferredCardStyle === 'elevated' && 'shadow-lg',
        className
      )}
    >
      {/* Header - Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center w-full"
            >
              {logoCollapsed || (
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  A
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              {logo || (
                <>
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    A
                  </div>
                  <span className="font-bold text-lg">AnyX</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'h-8 w-8',
            isCollapsed && 'absolute -right-3 top-5 z-10 border bg-background shadow-md'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <div key={item.href}>
              <Link to={item.href}>
                <Button
                  variant={isActive(item.href) ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isCollapsed && 'justify-center',
                    isActive(item.href) && 'bg-primary/10 text-primary hover:bg-primary/20'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex-1 text-left"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!isCollapsed && item.badge && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        'ml-auto',
                        typeof item.badge === 'number' && 'bg-primary/20 text-primary'
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Sub-items */}
              {!isCollapsed && item.subItems && isActive(item.href) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-9 mt-1 space-y-1"
                >
                  {item.subItems.map((subItem) => (
                    <Link key={subItem.href} to={subItem.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                      >
                        {subItem.label}
                      </Button>
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom items */}
      {bottomItems.length > 0 && (
        <div className="border-t px-3 py-3 space-y-1">
          {bottomItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3',
                  isCollapsed && 'justify-center'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* User profile */}
      {user && (
        <div className="border-t p-3">
          <div className={cn(
            'flex items-center gap-3',
            isCollapsed && 'justify-center'
          )}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!isCollapsed && onLogout && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="h-8 w-8 flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </motion.aside>
  )
}

