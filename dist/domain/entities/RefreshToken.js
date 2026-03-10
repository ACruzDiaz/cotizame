"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
class RefreshToken {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new RefreshToken({
            ...props,
            createdAt: props.createdAt ?? new Date(),
        });
    }
    get id() {
        return this.props.id;
    }
    get userId() {
        return this.props.userId;
    }
    get token() {
        return this.props.token;
    }
    get expiresAt() {
        return this.props.expiresAt;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    isExpired() {
        return new Date() > this.props.expiresAt;
    }
}
exports.RefreshToken = RefreshToken;
