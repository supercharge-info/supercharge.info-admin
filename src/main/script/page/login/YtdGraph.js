import Highcharts from "highcharts";

export default class YtdGraph {

    static draw(target, title, ytdData) {

        Highcharts.chart(target, {
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
                text: title
            },
            subtitle: {
                text: null
            },
            legend: {
                borderWidth: 0,
                enabled: true
            },
            plotOptions: {
                series: {
                    lineWidth: 1,
                    marker: { enabled: false }
                }
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%b %e',
                    week: '%b %e',
                    month: '%b %e',
                    year: '%b'
                },
                max: Date.UTC(2020, 11, 31)
            },
            yAxis: {
                min: 0
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + ' ' + Highcharts.dateFormat('%b %e', this.x) + '</b><br/>' +
                        "YTD Count: " + this.y;
                }
            },

            series: Object.entries(ytdData).map(([y, d]) => ({ name: y, data: d }))
        });


    };

};
