import BaseView from "./base.view.js";

export default class ErrorView extends BaseView {
    constructor () {
        super();
    };

    async init () {
        this.setTitle('¡Error!');
        this.setView(this.view);
    };
};