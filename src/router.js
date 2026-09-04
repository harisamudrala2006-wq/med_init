// Client-Side Router with Protected Routes (Phase 3)
import { authState } from './context/authState.js';
import { pharmacyState } from './context/pharmacyState.js';
import { themeState } from './context/themeState.js';
import { i18n } from './context/i18nState.js';

import { renderHeader, bindHeaderEvents } from './components/Header.js';
import { renderBottomNav, renderDesktopSidebar, bindNavigationEvents } from './components/Navigation.js';

import { renderLoginView, bindLoginEvents } from './views/LoginView.js';
import { renderDashboardView, bindDashboardEvents } from './views/DashboardView.js';
import { renderBillsView, bindBillsEvents } from './views/BillsView.js';
import { renderUploadOCRView, bindUploadOCREvents } from './views/UploadOCRView.js';
import { renderDistributorsView, bindDistributorsEvents } from './views/DistributorsView.js';
import { renderDistributorDetailView, bindDistributorDetailEvents } from './views/DistributorDetailView.js';
import { renderInventoryView, bindInventoryEvents } from './views/InventoryView.js';
import { renderPaymentsView, bindPaymentsEvents } from './views/PaymentsView.js';
import { renderReviewCenterView, bindReviewCenterEvents } from './views/ReviewCenterView.js';
import { renderReportsView, bindReportsEvents } from './views/ReportsView.js';
import { renderAuditLogsView, bindAuditLogsEvents } from './views/AuditLogsView.js';
import { renderSettingsView, bindSettingsEvents } from './views/SettingsView.js';

class Router {
  constructor(appContainer) {
    this.app = appContainer;
    this.currentRoute = 'login';
    this.params = {};

    // Subscribe to state updates to automatically re-render current view if active
    pharmacyState.subscribe(() => this.renderCurrentView());
    themeState.subscribe(() => this.renderCurrentView());
    i18n.subscribe(() => this.renderCurrentView());
    authState.subscribe((user) => {
      if (!user && this.currentRoute !== 'login') {
        this.navigate('login');
      } else {
        this.renderCurrentView();
      }
    });

    window.addEventListener('popstate', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.navigate(hash, false);
    });
  }

  navigate(routePath, push = true) {
    const [path, queryString] = routePath.split('?');
    this.params = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((val, key) => {
        this.params[key] = val;
      });
    }

    // Auth Route Guard (Phase 3)
    if (!authState.isAuthenticated && path !== 'login') {
      this.currentRoute = 'login';
      if (push) window.history.pushState(null, '', '#login');
      this.renderCurrentView();
      return;
    }

    // If authenticated and trying to go to login, send to dashboard
    if (authState.isAuthenticated && path === 'login') {
      this.currentRoute = 'dashboard';
      if (push) window.history.pushState(null, '', '#dashboard');
      this.renderCurrentView();
      return;
    }

    this.currentRoute = path;
    if (push) window.history.pushState(null, '', `#${routePath}`);
    this.renderCurrentView();
    window.scrollTo(0, 0);
  }

  renderCurrentView() {
    // If not authenticated, render Login view without header/nav
    if (!authState.isAuthenticated || this.currentRoute === 'login') {
      this.app.innerHTML = renderLoginView();
      bindLoginEvents(this.app, this);
      return;
    }

    // Authenticated App Shell: Header + Desktop Sidebar + Main Content + Mobile Bottom Nav
    let viewHtml = '';
    switch (this.currentRoute) {
      case 'dashboard':
        viewHtml = renderDashboardView();
        break;
      case 'bills':
        viewHtml = renderBillsView();
        break;
      case 'upload-ocr':
        viewHtml = renderUploadOCRView();
        break;
      case 'distributors':
        viewHtml = renderDistributorsView();
        break;
      case 'distributor-detail':
        viewHtml = renderDistributorDetailView(this.params.id);
        break;
      case 'inventory':
      case 'expiry':
        viewHtml = renderInventoryView();
        break;
      case 'payments':
        viewHtml = renderPaymentsView();
        break;
      case 'review-center':
      case 'anomalies':
        viewHtml = renderReviewCenterView();
        break;
      case 'reports':
        viewHtml = renderReportsView();
        break;
      case 'audit':
        viewHtml = renderAuditLogsView();
        break;
      case 'settings':
        viewHtml = renderSettingsView();
        break;
      default:
        viewHtml = renderDashboardView();
        break;
    }

    this.app.innerHTML = `
      ${renderHeader()}
      ${renderDesktopSidebar(this.currentRoute)}
      <div id="view-content" class="w-full flex-1">
        ${viewHtml}
      </div>
      ${renderBottomNav(this.currentRoute)}
    `;

    // Bind all events
    bindHeaderEvents(this.app, this);
    bindNavigationEvents(this.app, this);

    const viewContainer = this.app.querySelector('#view-content');
    switch (this.currentRoute) {
      case 'dashboard':
        bindDashboardEvents(viewContainer, this);
        break;
      case 'bills':
        bindBillsEvents(viewContainer, this);
        break;
      case 'upload-ocr':
        bindUploadOCREvents(viewContainer, this);
        break;
      case 'distributors':
        bindDistributorsEvents(viewContainer, this);
        break;
      case 'distributor-detail':
        bindDistributorDetailEvents(viewContainer, this, this.params.id);
        break;
      case 'inventory':
      case 'expiry':
        bindInventoryEvents(viewContainer, this);
        break;
      case 'payments':
        bindPaymentsEvents(viewContainer, this);
        break;
      case 'review-center':
      case 'anomalies':
        bindReviewCenterEvents(viewContainer, this);
        break;
      case 'reports':
        bindReportsEvents(viewContainer, this);
        break;
      case 'audit':
        bindAuditLogsEvents(viewContainer, this);
        break;
      case 'settings':
        bindSettingsEvents(viewContainer, this);
        break;
      default:
        bindDashboardEvents(viewContainer, this);
        break;
    }
  }
}

export { Router };
