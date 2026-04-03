import homeViewTemplate from "../templates/views/home.view.template.js";
import BaseView from "./base.view.js";

export default class HomeView extends BaseView {
    constructor () {
        super();
        this.template.append(this.nav);
        this.template.innerHTML += homeViewTemplate;
    };

    async init () {
        this.setTitle('Librería Rubén Dario - Inicio');
        this.setView(this.view);
    };
};