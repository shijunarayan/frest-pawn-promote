export const Capabilities = {
  // Dashboard
  VIEW_DASHBOARD: "view_dashboard",

  // Inventory
  VIEW_INVENTORY: "view_inventory",
  CREATE_INVENTORY: "create_inventory",
  UPDATE_INVENTORY: "update_inventory",
  DELETE_INVENTORY: "delete_inventory",
  CHECKIN_INVENTORY: "checkin_inventory",
  CHECKOUT_INVENTORY: "checkout_inventory",
  TRANSFER_INVENTORY: "transfer_inventory",
  ASSIGN_BIN_LOCATION: "assign_bin_location",

  // Orders
  VIEW_ORDERS: "view_orders",
  CREATE_ORDER: "create_order",
  APPROVE_ORDER: "approve_order",
  DISPATCH_ORDER: "dispatch_order",

  // Work Orders (placeholder if needed)
  UPLOAD_WORK_ORDER: "upload_work_order",

  // Shipments
  VIEW_SHIPMENTS: "view_shipments",
  UPDATE_SHIPMENT_STATUS: "update_shipment_status",

  // Warehouses
  VIEW_WAREHOUSES: "view_warehouses",
  ADD_EDIT_WAREHOUSE: "add_edit_warehouse",

  // Billing
  VIEW_BILLING: "view_billing",
  PROCESS_PAYMENT: "process_payment",
  UPDATE_PRICING_CONFIG: "update_pricing_config",

  // Reports
  VIEW_REPORTS: "view_reports",
  DOWNLOAD_REPORTS: "download_reports",
  VIEW_ZONE_CONFIGURATION: "view_zone_configuration",
  VIEW_CUMULATIVE_VOLUME_REPORT: "view_cumulative_volume_report",
  VIEW_LEDGER_REPORT: "view_ledger_report",
  VIEW_AGEING_REPORT: "view_ageing_report",
  VIEW_INVENTORY_BY_CUSTOMER: "view_inventory_by_customer",
  VIEW_TRANSACTION_HISTORY: "view_transaction_history",
  VIEW_WAREHOUSE_VOLUME_REPORT: "view_warehouse_volume_report",

  // Users & Roles
  VIEW_USERS: "view_users",
  MANAGE_USERS: "manage_users", // Assign/remove/invite users
  VIEW_ROLES: "view_roles",
  MANAGE_ROLES: "manage_roles", // Create/edit role definitions
  ASSIGN_ROLES: "assign_roles", // Assign roles to users
  VIEW_CAPABILITIES: "view_capabilities",
  MANAGE_ROLE_CAPABILITIES: "manage_role_capabilities",

  // Admin
  ACCESS_AUDIT_LOGS: "access_audit_logs",
  IMPERSONATE_USER: "impersonate_user",
  CONFIGURE_MENU_ACCESS: "configure_menu_access",
  CONFIGURE_MOBILE_BEHAVIOR: "configure_mobile_behavior",

  // Warehouse Ops
  TRACK_FORKLIFT_USAGE: "track_forklift_usage",
  TRACK_LABOUR_ALLOCATION: "track_labour_allocation",
  TRACK_VISITOR_ENTRY_EXIT: "track_visitor_entry_exit",
  TRACK_CONTAINER_ARRIVAL_DEPARTURE: "track_container_arrival_departure",
  PROCESS_SRF: "process_SRF",
  PROCESS_SOF: "process_SOF",
  MANAGE_PACKING_TASKS: "manage_packing_segregation_tasks",

  // Vehicle Handling
  LOG_VEHICLE_CONDITION: "log_vehicle_condition_report",
  UPLOAD_VEHICLE_DOCUMENTS: "upload_vehicle_documents",

  // Settings
  MANAGE_SETTINGS: "manage_settings",
} as const;

export type CapabilityId = (typeof Capabilities)[keyof typeof Capabilities];
