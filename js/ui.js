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

        var thumb = document.getElementById('timeline-thumb');
        var ticking = false;

        function leadingYear() {
            var edge = list.scrollLeft + 16;
            var chosen = list.children[0];
            for (var i = 0; i < list.children.length; i++) {
                var item = list.children[i];
                if (item.offsetLeft + item.offsetWidth > edge) {
                    chosen = item;
                    break;
                }
            }
            return chosen ? chosen.dataset.year : years[0];
        }

        function syncThumb() {
            if (!thumb) {
                return;
            }
            var maxScroll = list.scrollWidth - list.clientWidth;
            var bar = thumb.parentNode.clientWidth;
            var thumbWidth = maxScroll <= 0
                ? bar
                : Math.max(bar * (list.clientWidth / list.scrollWidth), 36);
            var maxThumb = Math.max(bar - thumbWidth, 0);
            var x = maxScroll <= 0 ? 0 : (list.scrollLeft / maxScroll) * maxThumb;
            thumb.style.width = thumbWidth + 'px';
            thumb.style.transform = 'translateX(' + x + 'px)';
        }

        function onScroll() {
            if (ticking) {
                return;
            }
            ticking = true;
            requestAnimationFrame(function () {
                setActiveYear(leadingYear());
                syncThumb();
                ticking = false;
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

        list.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        if (typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(onScroll).observe(list);
        }

        setActiveYear(years[0]);
        syncThumb();
    }
})();
