//var searchResultFormat = '<tr><td>$machine</td><td>$line</td><td><a href="$link" target="_blank">YouTube</a></td></tr>';
var searchResultFormat = '<tr><td><a href="$link" target="_blank">$machine</a></td><td align="left">$line</td></tr>';
var totalLimit = 250;

var controls = {
    oldColor: '',
    displayResults: function() {
        if (results.style) {
            results.style.display = '';
        }
        resultsTableHideable.classList.remove('hide');
    },
    hideResults: function() {
        if (results.style) {
            results.style.display = 'none';
        }
        resultsTableHideable.classList.add('hide');
    },
    doSearch: function(match, dataset) {
        const filteredList = dataset.filter(item => {
            return JSON.stringify(item).toLowerCase().includes(match.toLowerCase());
          });
        return filteredList;
    },
    updateResults: function(loc, results) {
        if (results.length == 0) {
            noResults.style.display = '';
            noResults.textContent = 'No Results Found';

            resultsTableHideable.classList.add('hide');
       } else {
            var tableRows = loc.getElementsByTagName('tr');
            for (var x = tableRows.length - 1; x >= 0; x--) {
                loc.removeChild(tableRows[x]);
            }

            noResults.style.display = 'none';
            resultsTableHideable.classList.remove('hide');

            results.slice(0, totalLimit).forEach(r => {

                var wrapper = document.createElement('table');
                wrapper.innerHTML = "<tr style=\"background-color: black;\"><td>" + r.term + "</td><td>" + r.description + "</td></tr>"

                var div = wrapper.querySelector('tr');

                loc.appendChild(div);
            });
        }
    },
    setColor: function(loc, indicator) {
        if (this.oldColor == indicator) return;
        var colorTestRegex = /^color-/i;

        loc.classList.forEach(cls => {
            //we cant use class so we use cls instead :>
            if (cls.match(colorTestRegex)) loc.classList.remove(cls);
        });
        loc.classList.add('color-' + indicator);
        this.oldColor = indicator;
    }
};
window.controls = controls;

document.addEventListener('DOMContentLoaded', function() {
    results = document.querySelector('div.results');
    searchValue = document.querySelector('input.search');
    form = document.querySelector('form.searchForm');
    resultsTableHideable = document.getElementsByClassName('results-table').item(0);
    resultsTable = document.querySelector('tbody.results');
    resultsTable = document.querySelector('tbody.results');
    noResults = document.querySelector('div.noResults');
    colorUpdate = document.body;

    // Preventing initial fade
    document.body.classList.add('fade');

    var currentSet = [];
    var oldSearchValue = '';

    function doSearch(event) {
        var val = searchValue.value;

        if (val != '') {
            controls.displayResults();
            currentSet = window.dataset;
            oldSearchValue = val;

            currentSet = window.controls.doSearch(val, currentSet);
            if (currentSet.length < totalLimit) window.controls.setColor(colorUpdate, currentSet.length == 0 ? 'no-results' : 'results-found');

            window.controls.updateResults(resultsTable, currentSet);
        } else {
            controls.hideResults();
            window.controls.setColor(colorUpdate, 'no-search');
            noResults.style.display = 'none';
            currentSet = window.dataset;
        }

        if (event.type == 'submit') event.preventDefault();
    }

     function dailyTerm(dataset){
        const date = new Date();
        date.setHours(1, 0, 0, 0); // set the time to 1 o'clock
        const seed = date.getTime();
        const randomNumber = Math.floor(Math.abs(Math.sin(seed)) * dataset.length);
        const daily = document.getElementById('daily');
        daily.innerHTML += dataset[randomNumber].term;
    }

    fetch('./dataset.json')
        .then(res => res.json())
        .then(data => {
            console.log(data)
            window.dataset = data;
            dailyTerm(data)
            currentSet = window.dataset;
            window.controls.updateResults(resultsTable, window.dataset);
            doSearch({ type: 'none' });
        });

    form.submit(doSearch);

    searchValue.addEventListener('input', doSearch);
});
