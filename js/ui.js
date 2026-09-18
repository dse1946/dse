(function () {
    var sheets = Array.prototype.slice.call(document.querySelectorAll('.sheet'));
    var desktop = window.matchMedia('(min-width: 721px)');

    function setOpen(sheet, open) {
        var toggle = sheet.querySelector('.sheet-toggle');
        sheet.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    sheets.forEach(function (sheet) {
        setOpen(sheet, false);
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

    initTimeline();

    function eventYear(date) {
        var match = String(date).match(/(\d{4})$/);
        return match ? match[1] : '';
    }

    function initTimeline() {
        var yearsWrap = document.getElementById('timeline-years');
        var list = document.getElementById('timeline-list');
        if (!yearsWrap || !list || typeof timeline === 'undefined') {
            return;
        }

        var years = [];
        var firstByYear = {};

        timeline.forEach(function (item, index) {
            var year = eventYear(item.date);
            if (years.indexOf(year) === -1) {
                years.push(year);
                firstByYear[year] = index;
            }

            var entry = document.createElement('article');
            entry.className = 'timeline-item';
            entry.dataset.year = year;
            entry.innerHTML =
                '<time class="timeline-item-date">' + item.date + '</time>' +
                '<p class="timeline-item-text">' + item.text + '</p>';
            list.appendChild(entry);
        });

        function setActiveYear(year) {
            Array.prototype.forEach.call(yearsWrap.children, function (button) {
                button.classList.toggle('is-active', button.dataset.year === year);
            });
        }

        years.forEach(function (year) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'timeline-year';
            button.textContent = year;
            button.dataset.year = year;
            button.addEventListener('click', function () {
                var target = list.children[firstByYear[year]];
                if (target) {
                    list.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
                }
            });
            yearsWrap.appendChild(button);
        });

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        setActiveYear(entry.target.dataset.year);
                    }
                });
            }, {
                root: list,
                threshold: 0.4
            });

            Array.prototype.forEach.call(list.children, function (item) {
                observer.observe(item);
            });
        }

        setActiveYear(years[0]);
    }
})();
