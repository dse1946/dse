(function () {
    var sheets = Array.prototype.slice.call(document.querySelectorAll('.sheet'));
    var desktop = window.matchMedia('(min-width: 721px)');

    function setOpen(sheet, open) {
        var toggle = sheet.querySelector('.sheet-toggle');
        sheet.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function applyDefaults() {
        var isDesktop = desktop.matches;
        sheets.forEach(function (sheet) {
            setOpen(sheet, isDesktop);
        });
    }

    sheets.forEach(function (sheet) {
        sheet.querySelector('.sheet-toggle').addEventListener('click', function () {
            var willOpen = !sheet.classList.contains('is-open');

            if (!desktop.matches && willOpen) {
                sheets.forEach(function (other) {
                    setOpen(other, false);
                });
            }

            setOpen(sheet, willOpen);
        });
    });

    if (desktop.addEventListener) {
        desktop.addEventListener('change', applyDefaults);
    } else if (desktop.addListener) {
        desktop.addListener(applyDefaults);
    }

    applyDefaults();
})();
