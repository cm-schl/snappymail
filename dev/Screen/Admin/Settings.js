import { addSettingsViewModel } from 'Knoin/Knoin';
import { runSettingsViewModelHooks } from 'Common/Plugins';

import { AbstractSettingsScreen } from 'Screen/AbstractSettings';

import { GeneralAdminSettings } from 'Settings/Admin/General';
import { DomainsAdminSettings } from 'Settings/Admin/Domains';
import { LoginAdminSettings } from 'Settings/Admin/Login';
import { ContactsAdminSettings } from 'Settings/Admin/Contacts';
import { SecurityAdminSettings } from 'Settings/Admin/Security';
import { PluginsAdminSettings } from 'Settings/Admin/Plugins';
import { PackagesAdminSettings } from 'Settings/Admin/Packages';
import { AboutAdminSettings } from 'Settings/Admin/About';
import { BrandingAdminSettings } from 'Settings/Admin/Branding';

import { MenuSettingsAdminView } from 'View/Admin/Settings/Menu';
import { PaneSettingsAdminView } from 'View/Admin/Settings/Pane';

export class SettingsAdminScreen extends AbstractSettingsScreen {
	constructor() {
		super([MenuSettingsAdminView, PaneSettingsAdminView]);
	}

	/**
	 * @param {Function=} fCallback = null
	 */
	setupSettings(fCallback = null) {
		addSettingsViewModel(
			GeneralAdminSettings,
			'AdminSettingsGeneral',
			'TABS_LABELS/LABEL_GENERAL_NAME',
			'general',
			true
		);

		[
			[DomainsAdminSettings, 'Domains'],
			[LoginAdminSettings, 'Login'],
			[BrandingAdminSettings, 'Branding'],
			[ContactsAdminSettings, 'Contacts'],
			[SecurityAdminSettings, 'Security'],
			[PluginsAdminSettings, 'Plugins'],
			[PackagesAdminSettings, 'Packages'],
			[AboutAdminSettings, 'About'],
		].forEach(item =>
			addSettingsViewModel(
				item[0],
				'AdminSettings'+item[1],
				'TABS_LABELS/LABEL_'+item[1].toUpperCase()+'_NAME',
				item[1].toLowerCase()
			)
		);

		runSettingsViewModelHooks(true);

		if (fCallback) {
			fCallback();
		}
	}

	onShow() {
		rl.setWindowTitle();
	}
}
