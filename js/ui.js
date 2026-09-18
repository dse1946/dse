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
            var id = sheet.getAttribute('data-sheet');
            setOpen(sheet, isDesktop && id !== 'timeline');
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
    initTimeline();

    function eventYear(date) {
        var match = String(date).match(/(\d{4})$/);
        return match ? match[1] : '';
    }

    function initTimeline() {
        var yearsWrap = document.getElementById('timeline-years');
        var track = document.getElementById('timeline-track');
        if (!yearsWrap || !track || typeof timeline === 'undefined') {
            return;
        }

        var years = [];
        timeline.forEach(function (item, index) {
            var year = eventYear(item.date);
            if (years.indexOf(year) === -1) {
                years.push(year);
            }

            var card = document.createElement('article');
            card.className = 'timeline-card';
            card.dataset.year = year;
            card.dataset.index = String(index);
            card.innerHTML =
                '<time class="timeline-card-date">' + item.date + '</time>' +
                '<p class="timeline-card-text">' + item.text + '</p>';
            track.appendChild(card);
        });

        years.forEach(function (year) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'timeline-year';
            button.textContent = year;
            button.dataset.year = year;
            button.addEventListener('click', function () {
                var first = track.querySelector('.timeline-card[data-year="' + year + '"]');
                if (first) {
                    first.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
                }
            });
            yearsWrap.appendChild(button);
        });

        function setActiveYear(year) {
            Array.prototype.forEach.call(yearsWrap.querySelectorAll('.timeline-year'), function (button) {
                button.classList.toggle('is-active', button.dataset.year === year);
            });
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        setActiveYear(entry.target.dataset.year);
                    }
                });
            }, {
                root: track,
                threshold: 0.6
            });

            Array.prototype.forEach.call(track.querySelectorAll('.timeline-card'), function (card) {
                observer.observe(card);
            });
        }

        setActiveYear(years[0]);
    }
})();
