import type { NavigationGuard, Router } from 'vue-router'

/**
 * Prepare for route title management
 */
export const titleGuard: NavigationGuard = (to, from, next) => {
  // Set document title based on route
  const baseTitle = 'TCG Collector'
  const pageTitle = to.name as string
  document.title = pageTitle ? `${baseTitle} - ${pageTitle}` : baseTitle
  next()
}

/**
 * Prepare for future authentication needs
 * Currently just passes through but structure is in place
 */
export const authGuard: NavigationGuard = (to, from, next) => {
  // Future: Check authentication status
  // if (!isAuthenticated && to.meta.requiresAuth) {
  //   next({ name: 'login' })
  //   return
  // }
  next()
}

// Combine all guards into a single guard for the router
export const setupGuards = (router: Router) => {
  router.beforeEach(titleGuard)
  router.beforeEach(authGuard)
}
