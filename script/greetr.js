(function (global, $) {
    // define a function that returns an instance
    let Greetr = function(firstName, lastName, language) {
        return new Greetr.init(firstName, lastName, language);
    };

    // functions of Greetr
    Greetr.prototype = {};

    // object constructor function
    Greetr.init = function(firstName, lastName, language) {
        var self       = this;
        this.firstName = firstName;
        this.lastName  = lastName;
        this.language  = language;
    };

    Greetr.init.prototype = Greetr.prototype;

    // expose to outside world
    global.Greetr = global.G$ = Greetr;

})(window, jQuery);