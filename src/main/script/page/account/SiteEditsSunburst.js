import Highcharts from "highcharts";
import Sunburst from "highcharts/modules/sunburst";

export default class SiteEditsSunburst {

    constructor() {
        Sunburst(Highcharts);
    }

    draw(siteEdits) {

        const data = Object.entries(siteEdits.reduce((a, c) => {
            if (!(c.address.regionId in a)) {
                a[c.address.regionId] = { parent: '0', name: c.address.region };
            }
            if (!(c.address.regionId + '.' + c.address.countryId in a)) {
                a[c.address.regionId + '.' + c.address.countryId] = { parent: String(c.address.regionId), name: c.address.country };
            }
            const key = c.address.state ? c.address.state : c.address.country;
            if (!(c.address.regionId + '.' + c.address.countryId + '.' + key in a)) {
                a[c.address.regionId + '.' + c.address.countryId + '.' + key] = { parent: c.address.regionId + '.' + c.address.countryId, name: key, value: 0 };
            }
            a[c.address.regionId + '.' + c.address.countryId + '.' + key].value++;
            return a;
        }, { '0': { parent: '', name: 'World' }})).map(([k, v]) => ({ id: k, ...v }));

        Highcharts.chart("site-edits-pie", {
            accessibility: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: "Regional Edits"
            },
            colors: ['transparent', ...Highcharts.getOptions().colors],
            series: [{
                type: 'sunburst',
                data: data,
                name: 'Root',
                allowDrillToNode: true,
                cursor: 'pointer',
                dataLabels: {
                    format: '{point.name}',
                    filter: {
                        property: 'innerArcLength',
                        operator: '>',
                        value: 16
                    }
                },
                levels: [{
                    level: 1,
                    levelIsConstant: false,
                    dataLabels: {
                        filter: {
                            property: 'outerArcLength',
                            operator: '>',
                            value: 64
                        }
                    }
                }, {
                    level: 2,
                    colorByPoint: true
                },
                {
                    level: 3,
                    colorVariation: {
                        key: 'brightness',
                        to: 0.5
                    }
                },
                {
                    level: 4,
                    colorVariation: {
                        key: 'brightness',
                        to: -0.5
                    }
                }],
                tooltip: {
                    headerFormat: '',
                    pointFormat: "You've made <b>{point.value}</b> edits in <b>{point.name}</b>"
                }

            }]
        });

    };

};
