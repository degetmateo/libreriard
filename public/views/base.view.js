export default class BaseView {
    constructor () {
        this.app = document.getElementById('app');
        this.view = document.createElement('div');
        this.view.classList.add('view');
        this.template = document.createElement('div');
        this.template.classList.add('template');
        this.view.append(this.template);
    };

    async init () {};

    setTitle (title) {
        document.title = title;
    };

    setView (view) {
        this.app.innerHTML = '';
        this.app.append(view);
    };
};