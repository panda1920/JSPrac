(function (global, $) {
    // define a function that returns an instance
    // common pattern to avoid 'new'ing an instance every time
    let Greetr = function(firstName, lastName, language) {
        return new Greetr.init(firstName, lastName, language);
    };

    // object constructor function
    Greetr.init = function(firstName, lastName, language) {
        var self       = this;
        self.firstName = firstName || "";
        self.lastName  = lastName  || "";
        self.language  = language  || "en";

        self.validateLang();
    };
    
    ////////
    // constants
    ////////
    
    // languages
    const SUPPORTED_LANGS = ["en", "es"];
    // informal greet text
    const GREETINGS = {
        en: "Hello",
        es: "Hola"
    }
    // formal greet text
    const FORMAL_GREETINGS = {
        en: "Greetings",
        es: "Saludos"
    }
    // log text
    const LOG_MESSAGES = {
        en: "Logged in",
        es: "Inicio sesion"
    }

    // functions of Greetr
    Greetr.prototype = {
        fullName: function() {
            return this.firstName + " " + this.lastName;
        },
        validateLang: function() {
            if ( SUPPORTED_LANGS.indexOf(this.language) === -1 ) {
                throw "Invalid language";
            }
        },
        greeting: function() {
            return GREETINGS[this.language] + ' ' + this.firstName;
        },
        formalGreeting: function() {
            return FORMAL_GREETINGS[this.language] + ', ' + this.fullName();
        },
        greet: function(formal) {
            var msg = formal ? this.formalGreeting() : this.greeting();
            if (console) console.log(msg);
            return this;
        },
        log: function() {
            if (console) {
                console.log(LOG_MESSAGES[this.language] + ": " + this.fullName());
            }
        },
        setLang: function(lang) {
            this.language = lang;
            this.validateLang();
            return this;
        },
        updateWithGreeting: function(selector, formal) {
            if (!$) {
                throw "jquery not available";
            }
            if (!selector) {
                throw "selector not available";
            }

            $(selector).text(this.greeting());
            return this;
        }
    };

    // add functions to the prototype chain
    Greetr.init.prototype = Greetr.prototype;

    // expose to outside world
    global.Greetr = global.G$ = Greetr;

})(window, jQuery);