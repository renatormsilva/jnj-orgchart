import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initializeAnalytics = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
  }
};

export const trackPageView = (path: string) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

export const trackEvent = (category: string, action: string, label?: string) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event({ category, action, label });
  }
};

export const AnalyticsEvents = {
  PERSON_SELECTED: (personName: string) => trackEvent('Person', 'select', personName),
  HIERARCHY_NODE_EXPANDED: (personName: string) => trackEvent('Hierarchy', 'expand_node', personName),
  HIERARCHY_NODE_COLLAPSED: (personName: string) => trackEvent('Hierarchy', 'collapse_node', personName),
  VIEW_CHANGED: (view: 'list' | 'hierarchy') => trackEvent('Navigation', 'view_change', view),
  FILTER_APPLIED: (filterType: string, value: string) => trackEvent('Filter', filterType, value),
  SEARCH_PERFORMED: (query: string) => trackEvent('Search', 'search', query),
  ZOOM_IN: () => trackEvent('Hierarchy', 'zoom_in'),
  ZOOM_OUT: () => trackEvent('Hierarchy', 'zoom_out'),
  ZOOM_RESET: () => trackEvent('Hierarchy', 'zoom_reset'),
};
