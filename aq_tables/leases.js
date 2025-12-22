    // JavaScript to populate lease table from map service
    
    // Register sum function with jquery api
    jQuery.fn.dataTable.Api.register('sum()', function() {
        return this.flatten().reduce(function(a, b) {
            return (a * 1) + (b * 1); // cast values in-case they are strings
        });
    });


    $(document).ready(function() {
        // Setup - add a text input to each footer cell. Omit this if no search fields needed.
        $('#lease_table tfoot th').each(function() { // Change table element ID here
            var title = $('#lease_table thead th').eq($(this).index()).text(); // Change table element ID here
            $(this).html('<input type="text" placeholder="Search ' + title + '" />');
        });
        // URL to AQ web app
        var aq_map_url = 'https://experience.arcgis.com/experience/12b3838db40b4484a6b39858528749ed';
        // Query string
        var query_string = '#data_s=where:13fa6ea6032449f7849ce430f879a454-197655a67d5-layer-39:SITE_ID=';
        // DataTable settings - for more help see here: https://datatables.net/reference/option/
        var table = $('#lease_table').DataTable({ // Change table element ID here
            dom: 'Bfrtip', // Add this to enable export buttons
            buttons: [ // Add this to choose which buttons to display
                'copy',
                // CSV options
                {
                    extend: 'csvHtml5',
                    title: 'dmr_aq_leases_export'
                },
                // Excel options
                {
                    extend: 'excelHtml5',
                    title: 'dmr_aq_leases_export'
                },
                'print',
                // PDF options
                {
                    extend: 'pdfHtml5',
                    orientation: 'landscape',
                    pageSize: 'LETTER',
                    title: 'dmr_aq_leases_export'
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
                "url": "https://gis.maine.gov/mapservices/rest/services/dmr/DMR_Aquaculture/MapServer/2/query?where=STATUS+Like+" +
                    document.formSelectors.selStatus.value + 
                    "&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson", // JSON URL
                "dataSrc": "features" // Within the JSON, the source for the data. For AGOL tables this will be "features"
            },
            "columns": [ // Location within the JSON of each column to pipe into the HTML table, in order of columns. For AGOL items, fields stored within attributes array of JSON.
                // Create a link to the lease PDF
                {
                    data: "attributes",
                    render: function(data, type, row) {
                        // Generate HTML link using URL and and leaseholder name if URL is not null, or just leaseholder if no URL is present
                        if (data.decision_url == null) {
                            return data.LEASEHOLDE
                        } else {
                            return '<a href="' + data.decision_url + '" target="_blank">' + data.LEASEHOLDE + '</a>'
                        }
                    }
                },
                // Create a link to the AQ map
                {
                    data: "attributes",
                    render: function(data, type, row) {
                        // Generate HTML link to AQ web app for given site ID
                        return '<a href="' + aq_map_url + query_string + "'" + data.SITE_ID + "'" +
                            '" target="_blank">' + data.SITE_ID + '</a>'
                    }
                },                
                { data: "attributes.PRIMARYSP" },
                { data: "attributes.LEASE_TYPE" },
                { data: "attributes.STATUS" },
                { data: "attributes.WATERBODY" },
                { data: "attributes.CITY" },
                {
                    data: "attributes.EXPIRATION",
                    // Expiration is in UNIX time, microseconds since Jan 1, 1970 
                    render: function(data, type, row) {
                        var exp_date = new Date(data); // Convert UNIX Epoch to date
                        return (exp_date.getMonth() + 1) + '/' + exp_date.getDate() + '/' + exp_date.getFullYear(); // Return local date
                    }
                },
                {
                    data: "attributes.Acres",
                    render: function(data, type, row) {
                        return Math.round(data * 100)/100; // Round acreage to two decimal places
                    }
                }
            ],
            "language": {
                "emptyTable": "Loading...",
                "search": "Search all fields:"
            }
        });
        // Apply the search to all fields, if using search fields for each column; remove if not using.
        table.columns().every(function() {
            var that = this;
            $('input', this.footer()).on('keyup change', function() {
                that
                    .search(this.value)
                    .draw();
            });
        }); // Remove up to here if not using field searches

        $("#lease_table").on('search.dt', function() {
            var data = table.column(8, { page: 'current' }).data()
            if (data.length >= 1) {
                var total = table.column(8, { page: 'current' }).data().sum();
                $("#totalAcreage").html('<br>Total Acreage of Selected Leases: ' + Math.round(total * 100)/100);
                console.log(total);
            }
        });
    });



    function ChangeStatus() {
        // Get new data when the lease status selector changes
        var table = $('#lease_table').DataTable();
        table.clear();
        table.draw();
        table.ajax.url("https://gis.maine.gov/mapservices/rest/services/dmr/DMR_Aquaculture/MapServer/2/query?where=STATUS+Like+" +
            document.formSelectors.selStatus.value + 
            "&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson").load();
    }