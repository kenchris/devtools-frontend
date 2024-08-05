// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';

import pressureStyles from './pressure.css.js';

const UIStrings = {
  /**
   *@description Title for a group of pressure states
   */
  cpuPressure: 'CPU Global Pressure',
  /**
   *@description An option that appears in a drop-down to prevent the pressure states of the system from being overridden.
   */
  noOverride: 'No override',
  /**
   *@description An option that appears in a drop-down that represents the nominal state.
   */
  nominal: 'Nominal',
  /**
   *@description An option that appears in a drop-down that represents the fair state.
   */
  fair: 'Fair',
  /**
   *@description An option that appears in a drop-down that represents the serious state.
   */
  serious: 'Serious',
  /**
   *@description An option that appears in a drop-down that represents the critical state.
   */
  critical: 'Critical',
};
const str_ = i18n.i18n.registerUIStrings('panels/pressure/PressureView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);

export class PressureView extends UI.Widget.VBox {
  readonly #pressureSetting: Common.Settings.Setting<string>;
  #pressureState: string;
  #pressureOverrideEnabled: boolean;
  private pressureSelectElement!: HTMLSelectElement;

  constructor() {
    super(true);
    this.element.setAttribute('jslog', `${VisualLogging.panel('pressure').track({resize: true})}`);
    this.contentElement.classList.add('pressure-view');

    this.#pressureSetting = Common.Settings.Settings.instance().createSetting('emulation.cpu-pressure-override', '');
    this.#pressureState = this.#pressureSetting.get();
    this.#pressureOverrideEnabled = false;

    this.createCPUSection();
  }

  override wasShown(): void {
    super.wasShown();
    this.registerCSSFiles([pressureStyles]);
  }

  private createCPUSection(): void {
    const group = this.contentElement.createChild('section', 'pressure-group');
    group.setAttribute('jslog', `${VisualLogging.section('cpu-pressure')}`);
    const groupTitle = UI.UIUtils.createLabel(i18nString(UIStrings.cpuPressure), 'pressure-group-title');
    group.appendChild(groupTitle);
    const fields = group.createChild('div', 'pressure-fields');

    const noOverrideOption = {title: i18nString(UIStrings.noOverride), state: NonPresetOptions.NoOverride};
    const nominalOption = {title: i18nString(UIStrings.nominal), state: NonPresetOptions.Nominal};
    const fairOption = {title: i18nString(UIStrings.fair), state: NonPresetOptions.Fair};
    const seriousOption = {title: i18nString(UIStrings.serious), state: NonPresetOptions.Serious};
    const criticalOption = {title: i18nString(UIStrings.critical), state: NonPresetOptions.Critical};

    this.pressureSelectElement = (fields.createChild('select', 'chrome-select') as HTMLSelectElement);
    this.pressureSelectElement.setAttribute('jslog', `${VisualLogging.dropDown().track({change: true})}`);
    UI.ARIAUtils.bindLabelToControl(groupTitle, this.pressureSelectElement);

    // No override
    this.pressureSelectElement.appendChild(
        UI.UIUtils.createOption(noOverrideOption.title, noOverrideOption.state, 'no-override'));

    // Nominal
    this.pressureSelectElement.appendChild(
        UI.UIUtils.createOption(nominalOption.title, nominalOption.state, 'nominal'));

    // Fair
    this.pressureSelectElement.appendChild(UI.UIUtils.createOption(fairOption.title, fairOption.state, 'fair'));

    // Serious
    this.pressureSelectElement.appendChild(
        UI.UIUtils.createOption(seriousOption.title, seriousOption.state, 'serious'));

    // Critical
    this.pressureSelectElement.appendChild(
        UI.UIUtils.createOption(criticalOption.title, criticalOption.state, 'critical'));

    this.pressureSelectElement.addEventListener('change', this.pressureSelectChanged.bind(this));

    //this.selectPressureState(this.#pressureState);
  }

  selectPressureState(state: string) {
    const optionValues = Array.prototype.map.call(this.pressureSelectElement.options, x => x.value);
    this.pressureSelectElement.selectedIndex = optionValues.indexOf(state);
  }

  async setPressureSourceOverrideEnabled(enabled: boolean) {
    if (enabled === this.#pressureOverrideEnabled) {
      return;
    }
    this.#pressureOverrideEnabled = enabled;

    for (const emulationModel of SDK.TargetManager.TargetManager.instance().models(SDK.EmulationModel.EmulationModel)) {
      await emulationModel.setPressureSourceOverrideEnabled(enabled);
    }
  }

  async setPressureStateOverride(state: string) {
    if (state === 'no-override') {
      return;
    }

    for (const emulationModel of SDK.TargetManager.TargetManager.instance().models(SDK.EmulationModel.EmulationModel)) {
      await emulationModel.setPressureStateOverride(state as string);
    }
  }

  private async pressureSelectChanged(): Promise<void> {
    this.#pressureState = this.pressureSelectElement.options[this.pressureSelectElement.selectedIndex].value;
    this.#pressureSetting.set(this.#pressureState);

    await this.setPressureSourceOverrideEnabled(this.#pressureState != 'no-override');
    await this.setPressureStateOverride(this.#pressureState);
  }
}

/** {string} */
export const NonPresetOptions = {
  NoOverride: 'no-override',
  Nominal: 'nominal',
  Fair: 'fair',
  Serious: 'serious',
  Critical: 'critical',
};

export class ShowActionDelegate implements UI.ActionRegistration.ActionDelegate {
  handleAction(_context: UI.Context.Context, _actionId: string): boolean {
    void UI.ViewManager.ViewManager.instance().showView('pressure');
    return true;
  }
}
