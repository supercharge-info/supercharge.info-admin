import Highcharts from "highcharts"; import Sunburst from "highcharts/modules/sunburst";

export default class SiteEditsSunburst {

    constructor() {
        Sunburst(Highcharts);
    }

    static getChildren(item) {
        return item.children
            ? Object.entries(item.children)
                .sort(([z, a], [y, b]) => b.value - a.value)
                .reduce((a, [z, c]) => a.concat(SiteEditsSunburst.getChildren(c)), [{ id: item.id, parent: item.parent, name: item.name }])
            : [item];
    }

    draw(siteEdits) {

        const data = SiteEditsSunburst.getChildren(siteEdits.reduce((a, { address: { regionId, region, countryId, country, state }}) => {
            if (!(regionId in a.children)) {
                a.children[regionId] = {
                    id: String(regionId),
                    parent: '0',
                    name: region,
                    value: 0,
                    children: {}
                };
            }
            if (!(countryId in a.children[regionId].children)) {
                a.children[regionId].children[countryId] = {
                    id: regionId + '.' + countryId,
                    parent: String(regionId),
                    name: country,
                    value: 0,
                    children: {}
                };
            }
            if (!((state || country) in a.children[regionId].children[countryId].children)) {
                a.children[regionId].children[countryId].children[state || country] = {
                    id: regionId + '.' + countryId + '.' + (state || country),
                    parent: regionId + '.' + countryId,
                    name: state || country,
                    value: 0
                };
            }

            a.children[regionId].value++;
            a.children[regionId].children[countryId].value++;
            a.children[regionId].children[countryId].children[state || country].value++;
            return a;
        }, { id: '0', parent: '', name: 'World', children: {} }))

        Highcharts.chart("site-edits-pie", {
            chart: {
                type: 'sunburst',
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
                text: "Your Regional Edits"
            },
            series: [{
                data: data,
                name: 'Root',
                allowDrillToNode: true,
                borderRadius: 3,
                cursor: 'pointer',
                levels: [{
                    level: 1,
                    color: 'transparent'
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
