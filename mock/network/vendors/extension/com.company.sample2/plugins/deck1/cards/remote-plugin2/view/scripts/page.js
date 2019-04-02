(function () {

    function normalizeDomain() {
        var isD = false;

        try {
            if (isD = !document.domain.match(/^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/)) {
                // policy for opening cross frame communication. Critical as this opens permissions for onprem and hosted solutions
                var _spExp, _spTok = ".";
                document.domain = ((_spExp = document.domain.split(_spTok)) && _spExp.length === 1
                    ? _spExp.pop() : [_spExp.pop(), _spExp.pop()].reverse().join(_spTok));

            } else {
                // IP based, children must be equivalent
            }
        } catch (e) {
            // domainless..
        }
        return isD;
    }

    function generateVideoMetadata() {
        var library = [
            {id: 276694728, provider: "vimeo", name: "Volcano Tour"},
            {id: 77730331, provider: "vimeo", name: "Iceland Overview"},
            {id: 67449472, provider: "vimeo", name: "Nature of Light"},
            {id: 174312494, provider: "vimeo", name: "Vorticity of Clouds"},
            {id: 163469326 , provider: "vimeo", name: "Street wanderer - 日本"},
            {id: 26913792, provider: "vimeo", name: "Kagurazaka Matsuri"},
            {id: 52123950, provider: "vimeo", name: "Biker Sand Race"},
            {id: 45293777, provider: "vimeo", name: "Fiji Surfin'"},
            {id: 22877633, provider: "vimeo", name: "Up! Animation"}
        ];


        var item = library[(Math.random() * library.length) >> 0];

        if (item.provider === "vimeo") {
            item.link = "//player.vimeo.com/video/" + item.id;
        }

        return item;
    }


    function contentInitialize() {

        var videoLibraryItem = generateVideoMetadata();

        var videoFrame = document.getElementById("videoPlayer");
        if (videoFrame) {
            videoFrame.src = videoLibraryItem.link;
        }

        var videoTitle = document.getElementById("videoTitle");
        videoTitle.innerHTML = videoLibraryItem.name; // tooltip emulation
    }


    function pageInitialize() {
        normalizeDomain();

        if (window.frameElement) {
            // having access to DashboardComponent that encompasses this plugin
        }

        setTimeout(function () {
            var toastElem = document.getElementById("toast");
            toastElem.parentNode.removeChild(toastElem);
        }, 3 * 1000);


        document.addEventListener("DOMContentLoaded", contentInitialize);
    }

    pageInitialize();
})
();

