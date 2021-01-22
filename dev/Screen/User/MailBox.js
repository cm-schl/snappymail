import { Focused, Capa, ClientSideKeyName } from 'Common/Enums';
import { leftPanelDisabled, leftPanelType, moveAction } from 'Common/Globals';
import { pString, pInt } from 'Common/Utils';
import { getFolderFromCacheList, getFolderFullNameRaw, getFolderInboxName } from 'Common/Cache';
import { i18n } from 'Common/Translator';

import AppStore from 'Stores/User/App';
import AccountStore from 'Stores/User/Account';
import SettingsStore from 'Stores/User/Settings';
import FolderStore from 'Stores/User/Folder';
import MessageStore from 'Stores/User/Message';

import { SystemDropDownMailBoxUserView } from 'View/User/MailBox/SystemDropDown';
import { FolderListMailBoxUserView } from 'View/User/MailBox/FolderList';
import { MessageListMailBoxUserView } from 'View/User/MailBox/MessageList';
import { MessageViewMailBoxUserView } from 'View/User/MailBox/MessageView';

import { warmUpScreenPopup } from 'Knoin/Knoin';

import { AbstractScreen } from 'Knoin/AbstractScreen';

const Settings = rl.settings;

export class MailBoxUserScreen extends AbstractScreen {
	constructor() {
		super('mailbox', [
			SystemDropDownMailBoxUserView,
			FolderListMailBoxUserView,
			MessageListMailBoxUserView,
			MessageViewMailBoxUserView
		]);
	}

	/**
	 * @returns {void}
	 */
	updateWindowTitle() {
		let foldersInboxUnreadCount = FolderStore.foldersInboxUnreadCount();
		const email = AccountStore.email();

		if (Settings.app('listPermanentFiltered')) {
			foldersInboxUnreadCount = 0;
		}

		rl.setWindowTitle(
			(email
				? '' + (0 < foldersInboxUnreadCount ? '(' + foldersInboxUnreadCount + ') ' : ' ') + email + ' - '
				: ''
			) + i18n('TITLES/MAILBOX')
		);
	}

	/**
	 * @returns {void}
	 */
	onShow() {
		this.updateWindowTitle();

		AppStore.focusedState(Focused.None);
		AppStore.focusedState(Focused.MessageList);

		if (Settings.app('mobile')) {
			leftPanelDisabled(true);
		}

		if (!Settings.capa(Capa.Folders)) {
			leftPanelType(Settings.capa(Capa.Composer) || Settings.capa(Capa.Contacts) ? 'short' : 'none');
		} else {
			leftPanelType('');
		}
	}

	/**
	 * @param {string} folderHash
	 * @param {number} page
	 * @param {string} search
	 * @returns {void}
	 */
	onRoute(folderHash, page, search) {
		let threadUid = folderHash.replace(/^(.+)~([\d]+)$/, '$2');
		const folder = getFolderFromCacheList(getFolderFullNameRaw(folderHash.replace(/~([\d]+)$/, '')));

		if (folder) {
			if (folderHash === threadUid) {
				threadUid = '';
			}

			FolderStore.currentFolder(folder);

			MessageStore.messageListPage(page);
			MessageStore.messageListSearch(search);
			MessageStore.messageListThreadUid(threadUid);

			rl.app.reloadMessageList();
		}
	}

	/**
	 * @returns {void}
	 */
	onStart() {
		setTimeout(() => SettingsStore.layout.valueHasMutated(), 50);
		setTimeout(() => warmUpScreenPopup(require('View/Popup/Compose')), 500);

		addEventListener('mailbox.inbox-unread-count', e => {
			FolderStore.foldersInboxUnreadCount(e.detail);

			const email = AccountStore.email();
			AccountStore.accounts.forEach(item => {
				if (item && email === item.email) {
					item.count(e.detail);
				}
			});

			this.updateWindowTitle();
		});
	}

	/**
	 * @returns {void}
	 */
	onBuild() {
		if (!Settings.app('mobile')) {
			setTimeout(() =>
				rl.app.initHorizontalLayoutResizer(ClientSideKeyName.MessageListSize)
			, 1);
		}

		document.addEventListener('click', event =>
			event.target.closest('#rl-right') && moveAction(false)
		);
	}

	/**
	 * @returns {Array}
	 */
	routes() {
		const inboxFolderName = getFolderInboxName(),
			fNormS = (request, vals) => {
				vals[0] = pString(vals[0]);
				vals[1] = pInt(vals[1]);
				vals[1] = 0 >= vals[1] ? 1 : vals[1];
				vals[2] = pString(vals[2]);

				if (!request) {
					vals[0] = inboxFolderName;
					vals[1] = 1;
				}

				return [decodeURI(vals[0]), vals[1], decodeURI(vals[2])];
			},
			fNormD = (request, vals) => {
				vals[0] = pString(vals[0]);
				vals[1] = pString(vals[1]);

				if (!request) {
					vals[0] = inboxFolderName;
				}

				return [decodeURI(vals[0]), 1, decodeURI(vals[1])];
			};

		return [
			[/^([a-zA-Z0-9~]+)\/p([1-9][0-9]*)\/(.+)\/?$/, { 'normalize_': fNormS }],
			[/^([a-zA-Z0-9~]+)\/p([1-9][0-9]*)$/, { 'normalize_': fNormS }],
			[/^([a-zA-Z0-9~]+)\/(.+)\/?$/, { 'normalize_': fNormD }],
			[/^([^/]*)$/, { 'normalize_': fNormS }]
		];
	}
}
