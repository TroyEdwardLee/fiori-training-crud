sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createEmployeeValueHelpCols: function() {
			var oModel = new JSONModel({
				"cols": [{
					"label": "Employee ID",
					"template": "businessModel>Id",
					"width": "10rem"
				}, {
					"label": "Name",
					"template": "businessModel>Name"
				}]
			});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};
});