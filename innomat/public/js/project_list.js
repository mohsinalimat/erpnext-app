frappe.listview_settings['Project'] = {
    onload: function(listview) {
        listview.page.add_menu_item( __("Create Project from Template"), function() {
            create_project_from_template();
        });
        listview.page.add_menu_item( __("Create Service Invoices"), function() {
            create_service_sales_invoices();
        });
        // default filter settings
        frappe.call({
            method:"frappe.client.get_list",
            args:{
                doctype:"Employee",
                filters: [
                    ["user_id","=", frappe.session.user]
                ],
                fields: ["name"],
            },
            async: false,
            callback: function(response) {
                if (response.message.length > 0) {
                    frappe.route_options = {"employee": response.message[0].name};
                }
            }
        });
    }
}

function create_service_sales_invoices() {
    frappe.prompt([
            {'fieldname': 'from_date', 'fieldtype': 'Date', 'label': __('From Date'), 'reqd': 1, 'default': get_start_last_quarter()},
            {'fieldname': 'to_date', 'fieldtype': 'Date', 'label': __('To Date'), 'reqd': 1, 'default': get_end_last_quarter()}
        ],
        function(values){
            frappe.call({
                "method": "innomat.innomat.utils.create_sinvs_for_date_range",
                "args": {
                    "from_date": values.from_date,
                    "to_date": values.to_date
                },
                "callback": function(response) {
                    frappe.show_alert( response.message );
                }
            });
        },
        __('Create Service Invoices'),
        __('Create')
    );
}

function get_start_last_quarter() {
    var today = new Date(frappe.datetime.get_today());
    var act_month = today.getMonth();
    var fullyear = today.getFullYear();
    if ([0, 1, 2].includes(act_month)) {
        fullyear = fullyear - 1;
        var start = new Date(String(fullyear) + "-10-01");
    }
    if ([3, 4, 5].includes(act_month)) {
        var start = new Date(String(fullyear) + "-01-01");
    }
    if ([6, 7, 8].includes(act_month)) {
        var start = new Date(String(fullyear) + "-04-01");
    }
    if ([9, 10, 11].includes(act_month)) {
        var start = new Date(String(fullyear) + "-07-01");
    }
    return start;
}

function get_end_last_quarter() {
    var today = new Date(frappe.datetime.get_today());
    var act_month = today.getMonth();
    var fullyear = today.getFullYear();
    if ([0, 1, 2].includes(act_month)) {
        fullyear = fullyear - 1;
        var end = new Date(String(fullyear) + "-12-31");
    }
    if ([3, 4, 5].includes(act_month)) {
        var end = new Date(String(fullyear) + "-03-31");
    }
    if ([6, 7, 8].includes(act_month)) {
        var end = new Date(String(fullyear) + "-06-30");
    }
    if ([9, 10, 11].includes(act_month)) {
        var end = new Date(String(fullyear) + "-09-30");
    }
    
    return end;
}

function create_project_from_template() {
    frappe.prompt([
            {'fieldname': 'template', 'fieldtype': 'Link', 'label': __('Template'), 'reqd': 1, 'options': 'Project Template', 'default': 'Service'},
            {'fieldname': 'customer', 'fieldtype': 'Link', 'label': __('Customer'), 'reqd': 1, 'options': 'Customer'},
            {'fieldname': 'company', 'fieldtype': 'Link', 'label': __('Company'), 'reqd': 1, 'options': 'Company', 'default': frappe.defaults.get_default("Company")}            
        ],
        function(values){
            frappe.call({
                "method": "innomat.innomat.utils.create_project_from_template",
                "args": {
                    "template": values.template,
                    "company": values.company,
                    "customer": values.customer
                },
                "callback": function(response) {
                    frappe.set_route("Form", "Project", response.message);
                }
            });
        },
        __('Create Project from Template'),
        __('Create')
    );
}
