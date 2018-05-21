var app = angular.module('app.factories', []);

app.factory('BaseService', function () {
    return {
        apiUrl: function() {
            //return 'https://chat.openenglish.com:12003/api';
            //return 'https://megachat.stg.openenglish.com:12003/api';
            return 'https://chat.openenglish.com:12003/api';
        }
    }
})
.factory('FilterFactory', function () {
    return {
        getStatuses: function(){
            return {
                All: { label: 'All', id: -1 },
                Online: { label: 'Online', id: 1 },
                Offline: { label: 'Offline', id: 0 },
            }
        },
        getMemberships: function(){
            return {
                All: { label: 'All', id: -1 },
                Expired: { label: 'Expired', id: 0 },
                FreeTrial: { label: 'Free Trial', id: 1 },
                Premium: { label: 'Premium', id: 2 },
            }
        },
        getBlockedUnblockedStatus: function(){
            return {
                All: { label: 'All', id: -1 },
                Unblocked: { label: 'Only Actives', id: 0 },
                Blocked: { label: 'Only Blocked', id: 1 }
            }
        }
    }
})
.factory('ReportFactory', function(){
    return {

        /** Generate CSV
        * @param headers
        * @param values
        */

        generateCSV : function(args) {
            var result, ctr, keys, columnDelimiter, lineDelimiter, data;

            data = args.data || null;
            if (data == null || !data.length) {
                return null;
            }

            columnDelimiter = args.columnDelimiter || ',';
            lineDelimiter = args.lineDelimiter || '\n';

            keys = Object.keys(data[0]);

            result = '';
            result += keys.join(columnDelimiter);
            result += lineDelimiter;

            data.forEach(function(item) {
                ctr = 0;
                keys.forEach(function(key) {
                    //if (ctr > 0) result += columnDelimiter;
                    if (ctr > 0){
                        result += columnDelimiter;
                    }

                    if(typeof(item[key]) == 'string'){
                        item[key] = item[key].toString().replace(';', '');
                        item[key] = item[key].toString().replace('null', '-');
                        item[key] = item[key].toString().replace('undefined', '-');
                        item[key] = item[key].toString().replace("'", '');
                        item[key] = item[key].toString().replace(/[\n\r]/g, '');
                        //item[key] = 'EMPTY';
                    }
                    if(item[key] == null || item[key] == undefined)
                        item[key] = '-';
                    result += item[key];
                    ctr++;
                });
                result += lineDelimiter;
            });

            return result;
        },

        /**
        * @param headers The headers for the table. It should be an array
        * @param data Data for the table. The function will analyze how any headers the table has then separate the data automatically.
        */
        tableWithHeaderAndData: function(reportName, headers, data, cb) {

            var headersWidth = new Array();
            for(var idx in headers) {
                headers[idx] = {
                    text: headers[idx],
                    style: 'tableHeader',
                    alignment: 'center',
                }
                headersWidth.push('*');
            }

            var docDefinition = {
                content: [
                    {
                        image: 'logo',
			            width: 200,
                        style: 'image'
		            },
                    {text: 'Report - ' + reportName, style: 'header'},
                    {
                        layout: {
                            fillColor: function (i, node) { return (i % 2 === 0) ?  'white' : null; },
			            },
                        color: '#151b1e',
                        table: {
                            // headers are automatically repeated if the table spans over multiple pages
                            // you can declare how many rows should be treated as headers
                            //headerRows: 1,
                            //widths: headersWidth,

                            body: [
                                headers,
                                ...data
                            ]
                        }
                    }
                ],
                images: {
                    logo: null
                },
                styles: {
                    image: {
                        margin: [0, 0, 0, 30]
                    },
            		header: {
                        color: '#0084ff',
            			fontSize: 16,
                        fontFamily: 'ProximaNovaRegular',
            			bold: true,
            			margin: [0, 0, 0, 20]
            		},
            		subheader: {
            			fontSize: 16,
            			bold: true,
            			margin: [0, 10, 0, 5]
            		},
            		tableExample: {
            			margin: [0, 5, 0, 15]
            		},
            		tableHeader: {
            			bold: true,
            			fontSize: 12,
            			color: 'white',
                        fillColor: '#0084ff'
            		},
                    tableData: {
                        bold: false,
            			fontSize: 11,
            			color: '#151b1e'
                    }
            	},
            	defaultStyle: {
            		alignment: 'center'
            	}
            };

            //Logo to base64
            var isFirefox = typeof InstallTrigger !== 'undefined';
            var logo ='img/logo.png';

            toDataUrl(logo,function(base64Image){
                if(isFirefox == true){
                    logo = base64Image;
                } else {
                    docDefinition.images.logo = base64Image;
                }

                cb(pdfMake.createPdf(docDefinition));
            });
        }
    }
});

function toDataUrl(file,callback) {
           var xhr = new XMLHttpRequest();
              xhr.responseType = 'blob';
              xhr.onload = function() {
             var reader = new FileReader();
             reader.onloadend = function() {
              callback(reader.result);
           }
             reader.readAsDataURL(xhr.response);
          };
           xhr.open('GET', file);
           xhr.send();
           }
