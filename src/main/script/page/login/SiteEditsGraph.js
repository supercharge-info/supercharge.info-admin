import Highcharts from "highcharts";

export default class SiteEditsGraph {

    static draw(siteEdits) {

        Highcharts.chart("ytd-site-edits-graph", {
            chart: {
                zoomType: 'x',
                type: 'spline'
            },
            accessibility: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Sites Edited Year-to-Date'
            },
            subtitle: {
                text: null
            },
            legend: {
                borderWidth: 0,
                enabled: true
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%b %e',
                    week: '%b %e',
                    month: '%b %e',
                    year: '%b'
                },
                showLastLabel: false
            },
            yAxis: {
                title: {
                    text: 'Sites Edited'
                },
                min: 0
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + ' ' + Highcharts.dateFormat('%b %e', this.x) + '</b><br/>' +
                        "sites edited: " + this.y;
                }
            },

            series: Object.entries(Object.entries(siteEdits).reduce((a, [d, c]) => {
                const [year, month, day] = d.split('-');
                if (!(year in a)) {
                    a[year] = [];
                }
                a[year].push([Date.UTC(2020, month - 1, day), c]);
                return a;
            }, {})).map(([y, d]) => ({ name: y, data: d.sort(), lineWidth: 1 }))
        });


    };

};
