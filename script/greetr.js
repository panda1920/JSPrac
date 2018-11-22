jQuery = undefined;

(function (global, $) {
    // define a function that returns an instance
    let Greetr = function(firstName, lastName, language) {
        return new Greetr.init(firstName, lastName, language);
    };

    // object constructor function
    Greetr.init = function(firstName, lastName, language) {
        var self       = this;
        self.firstName = firstName || "";
        self.lastName  = lastName  || "";
        self.language  = language  || "en";
    };

    const SUPPORTED_LANGS = ["en", "es"];
    const GREETINGS = {
        en: "Hello",
        es: "Hola"
    }
    const FORMAL_GREETINGS = {
        en: "Greetings",
        es: "Saludos"
    }
    const LOG_MESSAGES = {
        en: "Logged in",
        es: "Inicio sesion"
    }

    // functions of Greetr
    Greetr.prototype = {
        fullName: function() {
            return this.firstName + " " +  this.lastName;
        },
        validateLang: function() {
            if ( supportedLangs.indexOf(this.language) === -1 ) {
                throw "Invalid language";
            }
        },
        greeting: function() {
            return GREETINGS[this.language] + ' ' + this.firstName;
        },
        formalGreeting: function() {
            return FORMAL_GREETINGS[this.language] + ', ' + thisfirstName();
        },

        setLang: function(lang) {
            this.language = lang;
            this.validateLang();
            return this;
        }
    };
    Greetr.init.prototype = Greetr.prototype;

    // expose to outside world
    global.Greetr = global.G$ = Greetr;

})(window, jQuery);