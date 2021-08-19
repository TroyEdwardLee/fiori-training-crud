sap.ui.define([
	"fiori/training/crudfiori-training-crud/common/BaseController",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("fiori.training.crudfiori-training-crud.controller.Detail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fiori.training.crudfiori-training-crud.view.Detail
		 */
		onInit: function() {
			this.oDataModel = this.getOwnerComponent().getModel();
			this.oView.setModel(new JSONModel({
				"bEditState": false
			}), "viewModel");
			this.oViewModel = this.oView.getModel("viewModel");
			this.getRouter().getRoute("Detail").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched : function (oEvent) {
			var oArgs, sEmployeeID;
			oArgs = oEvent.getParameter("arguments");
			sEmployeeID = oArgs.EmployeeID;
			this.sPath = "/ZEMPLOYEEINFOSet('" + sEmployeeID + "')";
			this.oView.byId("dynamicPageId").bindElement(this.sPath);
			// this._fetchJSONData(sProductPath);
		},
		
		handleEditPress: function() {
			this.oViewModel.setProperty("/bEditState", true);
		},
		
		handleSavePress: function() {
			var oObject = this.oView.byId("dynamicPageId").getBindingContext().getProperty();
			this.oView.byId("dynamicPageId").setBusy(true);
			this.oDataModel.update(this.sPath, oObject, {
				/*headers: {
					"Content-ID": 1
				},*/
				groupId: "updateEmployee",
				success: function(oRes) {
					this.oView.byId("dynamicPageId").setBusy(false);
					this.oViewModel.setProperty("/bEditState", false);
					sap.m.MessageToast.show("Update Employee info successfully.");
					this.getRouter().navTo("List", {
						"refresh": "refresh"
					});
				}.bind(this),
				error: function(error) {
					this.oView.byId("dynamicPageId").setBusy(false);
					sap.m.MessageToast.show("Update Employee info failed.");
				}.bind(this),
				refreshAfterChange: true
			});
		},
		
		handleCancelPress: function() {
			this.oViewModel.setProperty("/bEditState", false);
			this.oDataModel.resetChanges([this.sPath]);
		}

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fiori.training.crudfiori-training-crud.view.Detail
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fiori.training.crudfiori-training-crud.view.Detail
		 */
		//	onExit: function() {
		//
		//	}

	});

});