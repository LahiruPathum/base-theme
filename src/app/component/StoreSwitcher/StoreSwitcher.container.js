/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ConfigQuery from 'Query/Config.query';
import { showNotification } from 'Store/Notification/Notification.action';
import DataContainer from 'Util/Request/DataContainer';

import StoreSwitcher from './StoreSwitcher.component';

export const mapStateToProps = (state) => ({
    currentStoreCode: state.ConfigReducer.code
});

export const mapDispatchToProps = (dispatch) => ({
    showErrorNotification: (message) => dispatch(showNotification('error', message))
});

export class StoreSwitcherContainer extends DataContainer {
    static propTypes = {
        showErrorNotification: PropTypes.func.isRequired,
        currentStoreCode: PropTypes.string
    };

    static defaultProps = {
        currentStoreCode: 'default'
    };

    state = {
        storeList: [],
        isOpened: false,
        storeLabel: ''
    };

    containerFunctions = {
        handleStoreSelect: this._handleStoreSelect.bind(this),
        onStoreSwitcherClick: this.onStoreSwitcherClick.bind(this),
        onStoreSwitcherOutsideClick: this.onStoreSwitcherOutsideClick.bind(this)
    };

    componentDidMount() {
        this._getStoreList();
    }

    componentDidUpdate() {
        const { currentStoreCode } = this.props;
        const { storeLabel } = this.state;

        if (currentStoreCode && !storeLabel) {
            this.getCurrentLabel(currentStoreCode);
        }
    }

    containerProps = () => {
        const { currentStoreCode } = this.props;
        return { currentStoreCode };
    };

    onStoreSwitcherClick() {
        const { isOpened } = this.state;

        this.setState({ isOpened: !isOpened });
    }

    onStoreSwitcherOutsideClick() {
        this.setState({ isOpened: false });
    }

    _getStoreList() {
        this.fetchData(
            [ConfigQuery.getStoreListField()],
            ({ storeList }) => this.setState({
                storeList: this._formatStoreList(storeList)
            })
        );
    }

    _formatStoreList(storeList) {
        return storeList.reduce((acc, {
            name, code, is_active, base_url
        }) => {
            if (!is_active) {
                return acc;
            }

            return [
                ...acc,
                {
                    id: `store_${ code }`,
                    value: code,
                    storeUrl: base_url,
                    label: name
                }
            ];
        }, []);
    }

    getCurrentLabel(storeCode) {
        const { storeList } = this.state;

        const store = storeList.find(
            ({ value }) => value === storeCode
        );
        const { label } = store;

        this.setState({ storeLabel: label });
    }

    _handleStoreSelect(storeCode) {
        const { showErrorNotification } = this.props;
        const { storeList } = this.state;

        const store = storeList.find(
            ({ value }) => value === storeCode
        );

        if (!store) {
            showErrorNotification(__('This store can not be opened!'));
            return;
        }

        window.location = store.storeUrl;
    }

    render() {
        return (
            <StoreSwitcher
              { ...this.containerFunctions }
              { ...this.containerProps() }
              { ...this.state }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreSwitcherContainer);
