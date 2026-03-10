"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = exports.Plan = void 0;
var Plan;
(function (Plan) {
    Plan["FREE"] = "FREE";
    Plan["PAID"] = "PAID";
})(Plan || (exports.Plan = Plan = {}));
class Company {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new Company({
            ...props,
            createdAt: props.createdAt ?? new Date(),
        });
    }
    get id() {
        return this.props.id;
    }
    get name() {
        return this.props.name;
    }
    get phone() {
        return this.props.phone;
    }
    get plan() {
        return this.props.plan;
    }
    get createdAt() {
        return this.props.createdAt;
    }
}
exports.Company = Company;
