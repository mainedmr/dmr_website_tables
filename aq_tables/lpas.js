// JavaScript to populate the LPA table

$(document).ready(function() {
        // Setup - add a text input to each footer cell. Omit this if no search fields needed.
        $('#lpa_table tfoot th').each(function() { // Change table element ID here
            var title = $('#lpa_table thead th').eq($(this).index()).text(); // Change table element ID here
            $(this).html('<input type="text" placeholder="Search ' + title + '" />');
        });
        // Put in URL to AGOL JSON, build using ArcGIS REST endpoint query tool (query 1=1, fields = *)
        var url = "https://gis.maine.gov/mapservices/rest/services/dmr/DMR_Aquaculture/MapServer/1/query?where=STATUS%3D%27A%27&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=SITE_ID&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=pjson";
        // URL to AQ web app
        var aq_map_url = 'https://experience.arcgis.com/experience/12b3838db40b4484a6b39858528749ed';
        // Query string to LPA layer source, application must have selections enabled and zoom to selection on
        var query_string = '#data_s=where:13fa6ea6032449f7849ce430f879a454-1976558bce4-layer-38:SITE_ID=';
        // DataTable settings - for more help see here: https://datatables.net/reference/option/
        var table = $('#lpa_table').DataTable({ // Change table element ID here
            dom: 'Bfrtip', // Add this to enable export buttons
            buttons: [ // Add this to choose which buttons to display
                'copy',
                // CSV options
                {
                    extend: 'csvHtml5',
                    title: 'dmr_aq_lpas_export'
                },
                // Excel options
                {
                    extend: 'excelHtml5',
                    title: 'dmr_aq_lpas_export'
                },
                'print',
                // PDF options
                {
                    extend: 'pdfHtml5',
                    orientation: 'landscape',
                    pageSize: 'LETTER',
                    title: 'dmr_aq_lpas_export'
                }
            ],
            "autoWidth": false, // Feature control DataTables' smart column width handling
            "deferRender": true, // Feature control deferred rendering for additional speed of initialisation.
            "info": true, // Display info about table including filtering
            "lengthChange": false, // If pagination is enabled, allow the page length to be changed by user
            "ordering": true, // Toggle user ordering of table columns
            "paging": false, // Toggle table paging
            "processing": true, // Toggle "processing" indicator useful when loading large table/filter
            "scrollX": true, // Left/right scrolling option, in pixels or false to disable
            "sScrollX": "100%",
            "scrollY": "400px", // Table height in pixels before up/down scrolling, or false to disable scrolling
            "searching": true, // Toggle search all columns field
            "stateSave": false, // If true, table will restore to user filtered state when page is reopened 				
            "scrollCollapse": true, // If true, the table will be collapsed if the height of the records is < the scrollY option; prevents footer from floating	 		
            "ajax": { // Load data from AJAX data source (JSON)
                "url": url, // JSON URL
                "dataSrc": "features" // Within the JSON, the source for the data. For AGOL tables this will be "features"
            },
            "columns": [ // Location within the JSON of each column to pipe into the HTML table, in order of columns. For AGOL items, fields stored within attributes array of JSON.
                // Create a link to the AQ map
                {
                    data: "attributes",
                    render: function(data, type, row) {
                        // Generate HTML link to AQ web app for given site ID
                        return '<a href="' + aq_map_url + query_string + "'" + data.SITE_ID + "'" +
                            '" target="_blank">' + data.SITE_ID + '</a>'
                    }
                },
                { data: "attributes.First_Name" },
                { data: "attributes.Last_Name" },
                { data: "attributes.Latitude" },
                { data: "attributes.Longitude" },
                { data: "attributes.Species" },
                { data: "attributes.Status" },
                { data: "attributes.Purpose" },
                { data: "attributes.Location" },
                { data: "attributes.WaterBody" },
                { data: "attributes.Site_Town" },
                { data: "attributes.Gear" }
            ],
            "language": {
                "emptyTable": "Loading...",
                "search": "Search all fields:"
            }
        });
        // Adjust column widths
        table.columns.adjust();
        // Apply the search, if using search fields for each column; remove if not using.
        table.columns().every(function() {
            var that = this;
            $('input', this.footer()).on('keyup change', function() {
                that
                    .search(this.value)
                    .draw();
            });
        }); // Remove up to here if not using field searches
    });