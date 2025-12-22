// JavaScript for leases under review table
$(document).ready(function() {
        // Put in URL to AGOL JSON, build using ArcGIS REST endpoint query tool (query 1=1, fields = *)
        var url = "https://services1.arcgis.com/RbMX0mRVOFNTdLzd/arcgis/rest/services/AQ_Lease_Apps_Under_Review_POLY_3_view/FeatureServer/15/query?where=1%3D1&outFields=*&f=pjson";
        // URL to AQ web app
        var aq_map_url = 'https://experience.arcgis.com/experience/12b3838db40b4484a6b39858528749ed';
        // Query string
        var query_string = '#data_s=where:13fa6ea6032449f7849ce430f879a454-18fa131ba23-layer-30:DMR_App_ID=';
        // DataTable settings - for more help see here: https://datatables.net/reference/option/
        var table = $('#review_table').DataTable({ // Change table element ID here
            dom: 'Bfrtip', // Add this to enable export buttons
            buttons: [ // Add this to choose which buttons to display
                'copy',
                // CSV options
                {
                    extend: 'csvHtml5',
                    title: 'dmr_aq_review_export'
                },
                // Excel options
                {
                    extend: 'excelHtml5',
                    title: 'dmr_aq_review_export'
                },
                'print',
                // PDF options
                {
                    extend: 'pdfHtml5',
                    orientation: 'landscape',
                    pageSize: 'LETTER',
                    title: 'dmr_aq_review_export'
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
                // Create a link to the lease PDF
                {
                    data: "attributes",
                    render: function(data, type, row) {
                        // Generate HTML link using URL and and leaseholder name if URL is not null, or just leaseholder if no URL is present
                        if (data.Link_To_Ap == null) {
                            return data.DMR_App_ID
                        } else {
                            return '<a href="' + data.Link_To_Ap + '" target="_blank">' + data.DMR_App_ID + '</a>'
                        }
                    }
                },
                { data: "attributes.Applicant" },
                { data: "attributes.App_Type" },
                // Create a link to the AQ map
                {
                    data: "attributes",
                    render: function(data, type, row) {
                        // Generate HTML link to AQ web app for given site ID
                        return '<a href="' + aq_map_url + query_string + "'" + data.DMR_App_ID + "'" +
                            '" target="_blank">View on AQ map</a>'
                    }
                },
                // Create a link to the application
                {
                    data: "attributes",
                    render: function(data, type, row) {
                        // Generate HTML link using URL if present, or null
                        if (data.Link_To_App == null) {
                            return 'No Application'
                        } else if (!(data.Link_To_App.startsWith("http"))) {
                            return 'No Application'
                        }
                        else {
                            return '<a href="' + data.Link_To_App + '" target="_blank">' + 
                            'App for ' + data.DMR_App_ID + '</a>'
                        }
                    }
                },
                // Create a link to the site report
                {
                    data: "attributes",
                    render: function(data, type, row) {
                        // Generate HTML link using URL if present, or null
                        if (data.Link_To_SR == null) {
                            return 'No Site Report'
                        } else if (!(data.Link_To_SR.startsWith("http"))) {
                            return 'No Site Report'
                        }
                        else {
                            return '<a href="' + data.Link_To_SR + '" target="_blank">' + 
                            'SR for ' + data.DMR_App_ID + '</a>'
                        }
                    }
                }
            ],
            "language": {
                "emptyTable": "Loading...",
                "search": "Search all fields:"
            }
        });
    });