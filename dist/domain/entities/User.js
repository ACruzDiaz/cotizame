"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["CLIENT"] = "CLIENT";
})(Role || (exports.Role = Role = {}));
class User {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new User({
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
    get email() {
        return this.props.email;
    }
    get passwordHash() {
        return this.props.passwordHash;
    }
    get role() {
        return this.props.role;
    }
    get createdAt() {
        return this.props.createdAt;
    }
}
exports.User = User;
