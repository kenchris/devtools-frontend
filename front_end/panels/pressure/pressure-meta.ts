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
   *@description A tag of Sensors tool that can be searched in the command menu
   */
  geolocation: 'geolocation',
  /**
   *@description A tag of Sensors tool that can be searched in the command menu
   */
  timezones: 'timezones',
  /**
   *@description Text in Sensors View of the Device Toolbar
   */
  locale: 'locale',
  /**
   *@description A tag of Sensors tool that can be searched in the command menu
   */
  locales: 'locales',
  /**
   *@description A tag of Sensors tool that can be searched in the command menu
   */
  accelerometer: 'accelerometer',
  /**
   * @description A tag of Sensors tool that can be searched in the command menu. Refers to the
   * orientation of a device (e.g. phone) in 3D space, e.g. tilted right/left.
   */
  deviceOrientation: 'device orientation',
  /**
   *@description Title of Locations settings. Refers to geographic locations for GPS.
   */
  locations: 'Locations',
  /**
   * @description Text for the touch type to simulate on a device. Refers to touch input as opposed to
   * mouse input.
   */
  touch: 'Touch',
  /**
   *@description Text in Sensors View of the Device Toolbar. Refers to device-based touch input,
   *which means the input type will be 'touch' only if the device normally has touch input e.g. a
   *phone or tablet.
   */
  devicebased: 'Device-based',
  /**
   *@description Text in Sensors View of the Device Toolbar. Means that touch input will be forced
   *on, even if the device type e.g. desktop computer does not normally have touch input.
   */
  forceEnabled: 'Force enabled',
  /**
   *@description Title of a section option in Sensors tab for idle emulation. This is a command, to
   *emulate the state of the 'Idle Detector'.
   */
  emulateIdleDetectorState: 'Emulate Idle Detector state',
  /**
   *@description Title of an option in Sensors tab idle emulation drop-down. Turns off emulation of idle state.
   */
  noIdleEmulation: 'No idle emulation',
  /**
   *@description Title of an option in Sensors tab idle emulation drop-down.
   */
  userActiveScreenUnlocked: 'User active, screen unlocked',
  /**
   *@description Title of an option in Sensors tab idle emulation drop-down.
   */
  userActiveScreenLocked: 'User active, screen locked',
  /**
   *@description Title of an option in Sensors tab idle emulation drop-down.
   */
  userIdleScreenUnlocked: 'User idle, screen unlocked',
  /**
   *@description Title of an option in Sensors tab idle emulation drop-down.
   */
  userIdleScreenLocked: 'User idle, screen locked',
  /**
   * @description Command that opens the Sensors view/tool. The sensors tool contains GPS,
   * orientation sensors, touch settings, etc.
   */
  showPressure: 'Show Pressure',
  /**
   *@description Command that shows geographic locations.
   */
  showLocations: 'Show Locations',
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
  tags: [
    i18nLazyString(UIStrings.timezones),
    i18nLazyString(UIStrings.locale),
    i18nLazyString(UIStrings.locales),
  ],
});
