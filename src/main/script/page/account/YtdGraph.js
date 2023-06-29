import Highcharts from "highcharts";

export default class YtdGraph {

    static draw(target, title, label, ytdData) {

        Highcharts.chart(target, {
            chart: {
                zoomType: 'x',
                type: 'spline',
                style: {
                    fontSize: '16px'
                }
            },
            accessibility: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: title,
                style: { fontWeight: 'normal' }
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
                title: { text: label },
                min: 0
            },
            tooltip: {
                formatter: function () {
                    return `<b>${this.series.name} ${Highcharts.dateFormat('%b %e', this.x)}</b><br/>` +
                        `${label}: ${this.y}`;
                }
            },

            series: Object.entries(ytdData).map(([y, d]) => ({ name: y, data: d, color: Highcharts.getOptions().colors[(y - 2016) % 10] }))
        });


    };

};
