import { matchPath, useLocation } from 'react-router-dom';
import { history } from 'src/store';

/**
 * Get current route (location pathname).
 */
export const getRoute = () => {
  return history.location.pathname;
};

/**
 * Go to home page.
 */
export function goHome() {
  history.push('/');
}

/**
 * Go to back page.
 */
export function goBack() {
  history.goBack();
}

/**
 * Go to page.
 */
export function goTo(path: string) {
  history.push(path);
}

/**
 * Replace the current page.
 */
export function replaceRoute(path: string) {
  history.replace(path);
}

/**
 * Hook to parse query string.
 */
export function useQuery() {
  return new URLSearchParams(useLocation().search);
}
