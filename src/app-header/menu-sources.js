import { Observable } from 'rx';
import { getInstance, config } from 'd2/lib/d2';

// Profile menu
config.i18n.strings.add('settings');
config.i18n.strings.add('profile');
config.i18n.strings.add('account');
config.i18n.strings.add('help');
config.i18n.strings.add('log_out');
config.i18n.strings.add('about_dhis2');

const profileMenuData = [
    {
        name: 'settings',
        namespace: '/dhis-web-commons-about',
        defaultAction: '/dhis-web-commons-about/userSettings.action',
        icon: '/icons/usersettings.png',
        description: '',
    },
    {
        name: 'profile',
        namespace: '/dhis-web-commons-about',
        defaultAction: '/dhis-web-commons-about/showUpdateUserProfileForm.action',
        icon: '/icons/function-profile.png',
        description: '',
    },
    {
        name: 'account',
        namespace: '/dhis-web-commons-about',
        defaultAction: '/dhis-web-commons-about/showUpdateUserAccountForm.action',
        icon: '/icons/function-account.png',
        description: '',
    },
    {
        name: 'help',
        namespace: '/dhis-web-commons-about',
        defaultAction: '/dhis-web-commons-about/help.action',
        icon: '/icons/function-account.png',
        description: '',
    },
    {
        name: 'about_dhis2',
        namespace: '/dhis-web-commons-about',
        defaultAction: '/dhis-web-commons-about/about.action',
        icon: '/icons/function-about-dhis2.png',
        description: '',
    },
];

function addHelpLinkToProfileData() {
    return getInstance()
        .then(d2 => d2.system.settings.get('helpPageLink'))
        // When the request for the system setting fails we return false to not set the help link
        .catch(() => false)
        .then(helpPageLink => profileMenuData
            .map((profileMenuItem) => {
                // Override the defaultAction with the helpPageLink when one was found.
                if (helpPageLink && profileMenuItem.name === 'help') {
                    return Object.assign({}, profileMenuItem, { defaultAction: helpPageLink });
                }

                return profileMenuItem;
            })
        );
}

export const profileSource$ = Observable.fromPromise(addHelpLinkToProfileData(profileMenuData));

function loadMenuItems() {
    return getInstance()
        .then(d2 => {
            const api = d2.Api.getApi();
            const baseUrl = d2.Api.getApi().baseUrl.replace('/api', '') || '';

            return api.get(baseUrl + '/dhis-web-commons/menu/getModules.action');
        })
        .then(({modules}) => modules);
}

export const appsMenuSource$ = Observable
    .fromPromise(loadMenuItems())
    .catch(Observable.just([]));
