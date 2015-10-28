import {PropTypes, createClass, default as React} from 'react';
import Heading from '../headings/Heading.component';
import CreatedBy from './CreatedBy.component';
import ExternalAccess from './ExternalAccess.component';
import PublicAccess from './PublicAccess.component';
import sharingActions from './sharing.actions';
import sharingStore from './sharing.store';
import UserGroupAccesses from './UserGroupAccesses.component';
import LoadingMask from '../loading-mask/LoadingMask.component';
import AutoComplete from '../auto-complete/AutoComplete.component';
import {config} from 'd2/lib/d2';

config.i18n.strings.add('external_access');
config.i18n.strings.add('public_access');

export default createClass({
    propTypes: {
        objectToShare: PropTypes.shape({
            name: PropTypes.string.isRequired,
            user: PropTypes.object.isRequired,
        }).isRequired,
    },

    getInitialState() {
        return {
            objectToShare: null,
        };
    },

    componentWillMount() {
        sharingActions.loadObjectSharingState(this.props.objectToShare);

        this.disposable = sharingStore
            .subscribe((newState) => {
                this.setState({
                    objectToShare: newState,
                });
            });
    },

    componentWillUnmount() {
        this.disposable.dispose();
    },

    render() {
        const loadingMaskStyle = {
            position: 'relative',
        };

        if (!this.state.objectToShare) {
            return (
                <LoadingMask style={loadingMaskStyle} size={1} />
            );
        }

        function doesNotContainItemWithId(collection = []) {
            return function checkForItemWithId(object = {}) {
                return collection.every(item => item.id !== object.id);
            };
        }

        const canSetExternalAccess = () => {
            return Boolean(this.state.objectToShare.meta && this.state.objectToShare.meta.allowExternalAccess);
        };

        const canSetPublicAccess = () => {
            return Boolean(this.state.objectToShare.meta && this.state.objectToShare.meta.allowPublicAccess);
        };

        const getExternalAccessValue = () => {
            if (canSetExternalAccess()) {
                return this.state.objectToShare.externalAccess;
            }
            return false;
        };

        return (
            <div>
                <Heading text={this.props.objectToShare.name} level={2} />
                <CreatedBy user={this.state.objectToShare.user} />
                <div>
                    <AutoComplete
                        forType="userGroup"
                        onSuggestionClicked={this.addUserGroup}
                        filterForSuggestions={doesNotContainItemWithId(this.state.objectToShare.userGroupAccesses)}
                        />
                </div>
                <ExternalAccess disabled={!canSetExternalAccess()} externalAccess={getExternalAccessValue()} onChange={this.updatedExternalAccess} />
                <PublicAccess disabled={!canSetPublicAccess()} publicAccess={this.state.objectToShare.publicAccess} onChange={this.updatePublicAccess} />
                <UserGroupAccesses userGroupAccesses={this.state.objectToShare.userGroupAccesses} onChange={this.updateUserGroupAccesses} />
            </div>
        );
    },

    updatedExternalAccess(externalAccessValue) {
        sharingActions.externalAccessChanged(externalAccessValue);
    },

    updatePublicAccess(publicAccessValue) {
        sharingActions.publicAccessChanged(publicAccessValue);
    },

    updateUserGroupAccesses(userGroupAccesses) {
        sharingActions.userGroupAcessesChanged(userGroupAccesses);
    },

    addUserGroup(userGroup) {
        sharingActions.userGroupAcessesChanged(this.state.objectToShare.userGroupAccesses.concat(userGroup));
    },
});