"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
class Service {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new Service({
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
    get name() {
        return this.props.name;
    }
    get description() {
        return this.props.description;
    }
    get basePrice() {
        return this.props.basePrice;
    }
    get taxRate() {
        return this.props.taxRate;
    }
    get createdAt() {
        return this.props.createdAt;
    }
}
exports.Service = Service;
