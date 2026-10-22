import React from 'react';
import { X, Download, Trash2 } from 'lucide-react';
import { sites } from '../mock';
import { APP_STORE_ICON } from '../constants';
import SiteIcon from './SiteIcon';

const AppStorePanel = ({ installed, onInstall, onUninstall, onClose }) => (
  <div data-testid="app-store-panel" className="overflow-hidden rounded-3xl border border-black/10 bg-white text-gray-900 shadow-2xl">
    <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-6 py-4">
      <img src={APP_STORE_ICON} alt="App Store" className="h-9 w-9 rounded-lg" />
      <div className="flex-1">
        <h2 className="text-lg font-bold">App Store</h2>
        <p className="text-xs text-gray-500">Install or remove apps from your home screen.</p>
      </div>
      <button
        data-testid="app-store-close-btn"
        onClick={onClose}
        aria-label="Close App Store"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {sites.map((site) => {
        const isInstalled = installed.includes(site.id);
        return (
          <div key={site.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200">
              <SiteIcon site={site} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold">{site.name}</span>
              {isInstalled ? (
                <button
                  data-testid={`uninstall-btn-${site.id}`}
                  onClick={() => onUninstall(site.id)}
                  className="mt-1 inline-flex items-center gap-1 self-start rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-200"
                >
                  <Trash2 className="h-3 w-3" /> Uninstall
                </button>
              ) : (
                <button
                  data-testid={`install-btn-${site.id}`}
                  onClick={() => onInstall(site.id)}
                  className="mt-1 inline-flex items-center gap-1 self-start rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Download className="h-3 w-3" /> Install
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default AppStorePanel;
