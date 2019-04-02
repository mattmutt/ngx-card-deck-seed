// sample boilerplate for reacting to theme changes
(function () {
        var supportedThemeClassList = ["light", "dark"];
        var state = {
            _pageTheme: null,

            // assign theme
            setTheme: function (newTheme) {
                // change detection
                if (newTheme !== state._pageTheme) {
                    setTimeout(function () {
                        changePageTheme(newTheme);
                    }, 0);
                }

                state._pageTheme = newTheme;
            },

            getTheme: function () {
                return state._pageTheme;
            }

        };

        // annotate demo frame with correct theme class
        function changePageTheme(isLightThemeFlag) {
            var doc = document.documentElement;
            doc.classList.remove.apply(doc.classList, supportedThemeClassList);
            doc.classList.add(supportedThemeClassList[isLightThemeFlag ? 0 : 1]);
        }

        function normalizeDomain() {
            var isDomain = false;

            try {
                if (isDomain = !document.domain.match(/^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/)) {
                    var _spExp, _spTok = ".";
                    document.domain = ((_spExp = document.domain.split(_spTok)) && _spExp.length === 1
                        ? _spExp.pop() : [_spExp.pop(), _spExp.pop()].reverse().join(_spTok));

                } else {
                    // IP based
                }
            } catch (e) {
                // lacks domain
            }
            return isDomain;
        }


        function pageInitialize() {
            normalizeDomain();
            initializeTheme();
        }

        function subscribeThemeChanges() {
            // primitive sample code only -- it will *not* scale beyond demo
            // Desired: message passing API for decoupled approach
            var fe = window.frameElement;

            if (fe) {
                var callback = function (mutationsList, observer) {
                    var classAttrMutation = mutationsList
                        .filter(function (item) {
                            return item.type === "attributes" && item.attributeName === "class";
                        })[0];
                    if (classAttrMutation) {
                        state.setTheme(isLightTheme());
                    }
                };

                var mo = new MutationObserver(callback);
                mo.observe(fe.ownerDocument.documentElement, {
                    attributes: true,
                    attributeOldValue: true,
                    characterData: false,
                    childList: false,
                    subtree: false,
                    characterDataOldValue: false
                });

            }
        }

        function findThemeProducerElement() {
            return window.frameElement.ownerDocument.documentElement;
        }

        function initializeTheme() {
            state.setTheme(isLightTheme());
            subscribeThemeChanges();
        }

        function isLightTheme() {
            var lightThemeClass = "light-theme";
            return findThemeProducerElement().className.indexOf(lightThemeClass) >= 0;
        }


        pageInitialize();
    }

)();
