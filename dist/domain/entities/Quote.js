"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quote = exports.QuoteItem = exports.QuoteStatus = void 0;
var QuoteStatus;
(function (QuoteStatus) {
    QuoteStatus["DRAFT"] = "DRAFT";
    QuoteStatus["SENT"] = "SENT";
    QuoteStatus["APPROVED"] = "APPROVED";
    QuoteStatus["REJECTED"] = "REJECTED";
})(QuoteStatus || (exports.QuoteStatus = QuoteStatus = {}));
class QuoteItem {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new QuoteItem(props);
    }
    get id() {
        return this.props.id;
    }
    get quoteId() {
        return this.props.quoteId;
    }
    get serviceId() {
        return this.props.serviceId;
    }
    get quantity() {
        return this.props.quantity;
    }
    get unitPrice() {
        return this.props.unitPrice;
    }
    get total() {
        return this.props.total;
    }
}
exports.QuoteItem = QuoteItem;
class Quote {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new Quote({
            ...props,
            createdAt: props.createdAt ?? new Date(),
        });
    }
    get id() {
        return this.props.id;
    }
    get companyId() {
        return this.props.companyId;
    }
    get clientId() {
        return this.props.clientId;
    }
    get status() {
        return this.props.status;
    }
    get subtotal() {
        return this.props.subtotal;
    }
    get tax() {
        return this.props.tax;
    }
    get total() {
        return this.props.total;
    }
    get expiresAt() {
        return this.props.expiresAt;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get items() {
        return this.props.items;
    }
    approve() {
        if (this.props.status !== QuoteStatus.SENT) {
            throw new Error('Only SENT quotes can be approved');
        }
        this.props.status = QuoteStatus.APPROVED;
    }
    reject() {
        if (this.props.status !== QuoteStatus.SENT) {
            throw new Error('Only SENT quotes can be rejected');
        }
        this.props.status = QuoteStatus.REJECTED;
    }
}
exports.Quote = Quote;
