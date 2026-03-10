"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
class Client {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new Client({
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
    get phone() {
        return this.props.phone;
    }
    get email() {
        return this.props.email;
    }
    get userId() {
        return this.props.userId;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    isRegistered() {
        return !!this.props.userId;
    }
    register(userId) {
        if (this.props.userId) {
            throw new Error('Client is already registered');
        }
        this.props.userId = userId;
    }
}
exports.Client = Client;
