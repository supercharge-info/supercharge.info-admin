class EventBusClass {
    constructor() {
        this.listeners = {};
    }

    addListener(type, callback, scope) {
        let args = [];
        const numOfArgs = arguments.length;
        for (let i = 0; i < numOfArgs; i++) {
            args.push(arguments[i]);
        }
        args = args.length > 3 ? args.splice(3, args.length - 1) : [];
        if (typeof this.listeners[type] !== "undefined") {
            this.listeners[type].push({ scope, callback, args });
        } else {
            this.listeners[type] = [
                { scope, callback, args }
            ];
        }
    }

    dispatch(type, ...target) {
        const args = [{ type }, ...target];
        if (typeof this.listeners[type] !== "undefined") {
            const numOfCallbacks = this.listeners[type].length;
            for (let i = 0; i < numOfCallbacks; i++) {
                const listener = this.listeners[type][i];
                if (listener && listener.callback) {
                    const concatArgs = args.concat(listener.args);
                    listener.callback.apply(listener.scope, concatArgs);
                }
            }
        }
    }

}

export default new EventBusClass();
