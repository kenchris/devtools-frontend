// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';

import type * as Pressure from './pressure.js';

const UIStrings = {
  /**
   * @description Title of the Pressure tool.
   */
  sensors: 'Pressure',
  /**
   * @description Command that opens the Sensors view/tool. The sensors tool contains GPS,
   * orientation sensors, touch settings, etc.
   */
  showPressure: 'Show Pressure',
};
const str_ = i18n.i18n.registerUIStrings('panels/pressure/pressure-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);

let loadedPressureModule: (typeof Pressure|undefined);

async function loadEmulationModule(): Promise<typeof Pressure> {
  if (!loadedPressureModule) {
    loadedPressureModule = await import('./pressure.js');
  }
  return loadedPressureModule;
}

UI.ViewManager.registerViewExtension({
  location: UI.ViewManager.ViewLocationValues.DRAWER_VIEW,
  commandPrompt: i18nLazyString(UIStrings.showPressure),
  title: i18nLazyString(UIStrings.sensors),
  id: 'pressure',
  persistence: UI.ViewManager.ViewPersistence.CLOSEABLE,
  order: 100,
  async loadView() {
    const Pressure = await loadEmulationModule();
    return new Pressure.PressureView.PressureView();
  },
});
