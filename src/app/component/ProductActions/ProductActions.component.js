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

/* eslint-disable no-restricted-syntax */
/* eslint-disable react/no-array-index-key */
// Disabled due placeholder needs

import './ProductActions.style';

import PropTypes from 'prop-types';
import { createRef, PureComponent } from 'react';

import AddToCart from 'Component/AddToCart';
import Field from 'Component/Field';
import GroupedProductList from 'Component/GroupedProductsList';
import Html from 'Component/Html';
import ProductBundleItems from 'Component/ProductBundleItems';
import ProductConfigurableAttributes from 'Component/ProductConfigurableAttributes';
import ProductCustomizableOptions from 'Component/ProductCustomizableOptions';
import ProductPrice from 'Component/ProductPrice';
import ProductReviewRating from 'Component/ProductReviewRating';
import ProductWishlistButton from 'Component/ProductWishlistButton';
import TextPlaceholder from 'Component/TextPlaceholder';
import TierPrices from 'Component/TierPrices';
import { PriceType, ProductType } from 'Type/ProductList';
import isMobile from 'Util/Mobile';
import {
    BUNDLE,
    GROUPED,
    SIMPLE
} from 'Util/Product';

/**
 * Product actions
 * @class ProductActions
 */
export default class ProductActions extends PureComponent {
    static propTypes = {
        product: ProductType.isRequired,
        productOrVariant: ProductType.isRequired,
        minQuantity: PropTypes.number.isRequired,
        maxQuantity: PropTypes.number.isRequired,
        configurableVariantIndex: PropTypes.number,
        showOnlyIfLoaded: PropTypes.func.isRequired,
        quantity: PropTypes.number.isRequired,
        areDetailsLoaded: PropTypes.bool.isRequired,
        getLink: PropTypes.func.isRequired,
        setQuantity: PropTypes.func.isRequired,
        updateConfigurableVariant: PropTypes.func.isRequired,
        parameters: PropTypes.objectOf(PropTypes.string).isRequired,
        getIsConfigurableAttributeAvailable: PropTypes.func.isRequired,
        groupedProductQuantity: PropTypes.objectOf(PropTypes.number).isRequired,
        clearGroupedProductQuantity: PropTypes.func.isRequired,
        setGroupedProductQuantity: PropTypes.func.isRequired,
        onProductValidationError: PropTypes.func.isRequired,
        getSelectedCustomizableOptions: PropTypes.func.isRequired,
        productOptionsData: PropTypes.object.isRequired,
        setBundlePrice: PropTypes.func.isRequired,
        productPrice: PriceType,
        productName: PropTypes.string,
        offerCount: PropTypes.number.isRequired,
        offerType: PropTypes.string.isRequired,
        stockMeta: PropTypes.string.isRequired,
        metaLink: PropTypes.string.isRequired
    };

    static defaultProps = {
        configurableVariantIndex: 0,
        productPrice: {},
        productName: ''
    };

    configurableOptionsRef = createRef();

    groupedProductsRef = createRef();

    renderStock(stockStatus) {
        if (stockStatus === 'OUT_OF_STOCK') {
            return __('Out of stock');
        }

        return __('In stock');
    }

    renderSkuAndStock() {
        const {
            product,
            product: { variants },
            configurableVariantIndex,
            showOnlyIfLoaded
        } = this.props;

        const productOrVariant = variants && variants[configurableVariantIndex] !== undefined
            ? variants[configurableVariantIndex]
            : product;

        const { sku, stock_status } = productOrVariant;

        return (
            <section
              block="ProductActions"
              elem="Section"
              mods={ { type: 'sku' } }
              aria-label="Product SKU and availability"
            >
                { showOnlyIfLoaded(
                    sku,
                    (
                        <>
                            <span block="ProductActions" elem="Sku">
                                SKU:
                            </span>
                            <span block="ProductActions" elem="Sku" itemProp="sku">
                                { `${ sku }` }
                            </span>
                            <span block="ProductActions" elem="Stock">
                                { this.renderStock(stock_status) }
                            </span>
                        </>
                    ),
                    <TextPlaceholder />
                ) }
            </section>
        );
    }

    renderConfigurableAttributes() {
        const {
            getLink,
            updateConfigurableVariant,
            parameters,
            areDetailsLoaded,
            product: { configurable_options, type_id },
            getIsConfigurableAttributeAvailable
        } = this.props;

        if (type_id !== 'configurable') {
            return null;
        }

        return (
            <div
              ref={ this.configurableOptionsRef }
              block="ProductActions"
              elem="AttributesWrapper"
            >
                <ProductConfigurableAttributes
                    // eslint-disable-next-line no-magic-numbers
                  numberOfPlaceholders={ [2, 4] }
                  mix={ { block: 'ProductActions', elem: 'Attributes' } }
                  isReady={ areDetailsLoaded }
                  getLink={ getLink }
                  parameters={ parameters }
                  updateConfigurableVariant={ updateConfigurableVariant }
                  configurable_options={ configurable_options }
                  getIsConfigurableAttributeAvailable={ getIsConfigurableAttributeAvailable }
                  isContentExpanded
                />
            </div>
        );
    }

    renderBundleItems() {
        const {
            product: { items, type_id },
            maxQuantity,
            getSelectedCustomizableOptions,
            productOptionsData,
            setBundlePrice
        } = this.props;

        if (type_id !== BUNDLE) {
            return null;
        }

        return (
            <section
              block="ProductActions"
              elem="Section"
              mods={ { type: 'bundle_items' } }
            >
                <ProductBundleItems
                  items={ items }
                  getSelectedCustomizableOptions={ getSelectedCustomizableOptions }
                  maxQuantity={ maxQuantity }
                  productOptionsData={ productOptionsData }
                  setBundlePrice={ setBundlePrice }
                />
            </section>
        );
    }

    renderShortDescriptionContent() {
        const { product: { short_description } } = this.props;
        const { html } = short_description || {};

        const htmlWithItemProp = `<div itemProp="description">${ html }</div>`;

        return (
            <div block="ProductActions" elem="ShortDescription">
                { html ? <Html content={ htmlWithItemProp } /> : <p><TextPlaceholder length="long" /></p> }
            </div>
        );
    }

    renderShortDescription() {
        const { product: { short_description, id } } = this.props;
        const { html } = short_description || {};

        if (!html && id) {
            return null;
        }

        return (
            <section
              block="ProductActions"
              elem="Section"
              mods={ { type: 'short' } }
              aria-label="Product short description"
            >
                { this.renderShortDescriptionContent() }
            </section>
        );
    }

    renderNameAndBrand() {
        const {
            product:
                {
                    name,
                    attributes: { brand: { attribute_value: brand } = {} } = {}
                },
            showOnlyIfLoaded
        } = this.props;

        return (
            <section
              block="ProductActions"
              elem="Section"
              mods={ { type: 'name' } }
            >
                { showOnlyIfLoaded(
                    brand,
                    (
                        <h4 block="ProductActions" elem="Brand" itemProp="brand">
                            <TextPlaceholder content={ brand } />
                        </h4>
                    )
                ) }
                <h1 block="ProductActions" elem="Title" itemProp="name">
                    <TextPlaceholder content={ name } length="medium" />
                </h1>
            </section>
        );
    }

    renderCustomizableOptions() {
        const {
            product: { type_id, options },
            getSelectedCustomizableOptions,
            productOptionsData
        } = this.props;

        if (type_id !== SIMPLE || isMobile.any()) {
            return null;
        }

        return (
            <section
              block="ProductActions"
              elem="Section"
              mods={ { type: 'customizable_options' } }
            >
                <ProductCustomizableOptions
                  options={ options }
                  getSelectedCustomizableOptions={ getSelectedCustomizableOptions }
                  productOptionsData={ productOptionsData }
                />
            </section>
        );
    }

    renderQuantityInput() {
        const {
            quantity,
            maxQuantity,
            minQuantity,
            setQuantity,
            product: { type_id }
        } = this.props;

        if (type_id === GROUPED) {
            return null;
        }

        return (
            <Field
              id="item_qty"
              name="item_qty"
              type="number"
              value={ quantity }
              max={ maxQuantity }
              min={ minQuantity }
              mix={ { block: 'ProductActions', elem: 'Qty' } }
              onChange={ setQuantity }
            />
        );
    }

    renderAddToCart() {
        const {
            configurableVariantIndex,
            product,
            quantity,
            groupedProductQuantity,
            onProductValidationError,
            productOptionsData
        } = this.props;

        return (
            <AddToCart
              product={ product }
              configurableVariantIndex={ configurableVariantIndex }
              mix={ { block: 'ProductActions', elem: 'AddToCart' } }
              quantity={ quantity }
              groupedProductQuantity={ groupedProductQuantity }
              onProductValidationError={ onProductValidationError }
              productOptionsData={ productOptionsData }
            />
        );
    }

    renderOfferCount() {
        const { offerCount } = this.props;

        if (offerCount > 1) {
            return (
                <meta
                  itemProp="offerCount"
                  content={ offerCount }
                />
            );
        }

        return null;
    }

    renderSchema() {
        const {
            productName,
            stockMeta,
            metaLink
        } = this.props;

        return (
            <>
                { this.renderOfferCount() }
                <meta itemProp="availability" content={ stockMeta } />
                <a
                  block="ProductActions"
                  elem="Schema-Url"
                  itemProp="url"
                  href={ metaLink }
                >
                    { productName }
                </a>
            </>
        );
    }

    renderPriceWithSchema() {
        const {
            productPrice,
            offerCount
        } = this.props;

        return (
            <div>
                { this.renderSchema() }
                <ProductPrice
                  isSchemaRequired
                  variantsCount={ offerCount }
                  price={ productPrice }
                  mix={ { block: 'ProductActions', elem: 'Price' } }
                />
            </div>
        );
    }

    renderPriceWithGlobalSchema() {
        const {
            offerType,
            product: {
                type_id
            }
        } = this.props;

        if (type_id === GROUPED) {
            return null;
        }

        return (
            <div
              block="ProductActions"
              elem="Schema"
              itemType={ offerType }
              itemProp="offers"
              itemScope
            >
                { this.renderPriceWithSchema() }
            </div>
        );
    }

    renderProductWishlistButton() {
        const {
            product,
            quantity,
            configurableVariantIndex,
            onProductValidationError
        } = this.props;

        return (
            <ProductWishlistButton
              product={ product }
              quantity={ quantity }
              configurableVariantIndex={ configurableVariantIndex }
              onProductValidationError={ onProductValidationError }
            />
        );
    }

    renderReviews() {
        const {
            product: {
                review_summary: {
                    rating_summary,
                    review_count
                } = {}
            }
        } = this.props;

        if (!rating_summary) {
            return null;
        }

        const ONE_FIFTH_OF_A_HUNDRED = 20;
        const rating = parseFloat(rating_summary / ONE_FIFTH_OF_A_HUNDRED).toFixed(2);

        return (
            <div
              block="ProductActions"
              elem="Reviews"
            >
                <ProductReviewRating summary={ rating_summary || 0 } />
                <p block="ProductActions" elem="ReviewLabel">
                    { rating }
                    <span>{ __('%s reviews', review_count) }</span>
                </p>
            </div>
        );
    }

    renderGroupedItems() {
        const {
            product,
            product: {
                type_id
            },
            groupedProductQuantity,
            setGroupedProductQuantity,
            clearGroupedProductQuantity
        } = this.props;

        if (type_id !== GROUPED) {
            return null;
        }

        return (
            <div
              block="ProductActions"
              elem="GroupedItems"
              ref={ this.groupedProductsRef }
            >
                <GroupedProductList
                  product={ product }
                  clearGroupedProductQuantity={ clearGroupedProductQuantity }
                  groupedProductQuantity={ groupedProductQuantity }
                  setGroupedProductQuantity={ setGroupedProductQuantity }
                />
            </div>
        );
    }

    renderTierPrices() {
        const { productOrVariant } = this.props;

        return (
            <div block="ProductActions" elem="TierPrices">
                <TierPrices product={ productOrVariant } />
            </div>
        );
    }

    render() {
        return (
            <article block="ProductActions">
                { this.renderPriceWithGlobalSchema() }
                { this.renderShortDescription() }
                { this.renderCustomizableOptions() }
                <div block="ProductActions" elem="AddToCartWrapper">
                    { this.renderQuantityInput() }
                    { this.renderAddToCart() }
                    { this.renderProductWishlistButton() }
                </div>
                { this.renderReviews() }
                { this.renderNameAndBrand() }
                { this.renderSkuAndStock() }
                { this.renderConfigurableAttributes() }
                { this.renderBundleItems() }
                { this.renderGroupedItems() }
                { this.renderTierPrices() }
            </article>
        );
    }
}
