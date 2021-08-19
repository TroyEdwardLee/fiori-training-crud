sap.ui.define([
	"fiori/training/crudfiori-training-crud/common/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/ColumnListItem",
	"fiori/training/crudfiori-training-crud/model/models",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, JSONModel, Fragment, ColumnListItem, models, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("fiori.training.crudfiori-training-crud.controller.List", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fiori.training.crudfiori-training-crud.view.List
		 */
		onInit: function() {
			this.oI18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oDataModel = this.getOwnerComponent().getModel();

			this.oView.setModel(new JSONModel({
				"sTableTitle": this.oI18n.getText("tableTitle", [0]),
				"filters": {
					"Id": ""
				},
				"iTableSelectedLen": 0,
				"maintainEmployee": {
					"Id": "",
					"Name": "",
					"Age": null,
					"Birthdate": null,
					"Address": ""
				}
			}), "viewModel");
			this.oViewModel = this.oView.getModel("viewModel");

			this.oView.setModel(new JSONModel({
				"EmployeesF4": [],
				"Employees": []
			}), "businessModel");
			this.oBusinessModel = this.oView.getModel("businessModel");
			this._oTable = this.oView.byId("employeeTableId");
			this.getRouter().getRoute("List").attachMatched(this._onRouteMatched, this);
			this._fetchEmployeeF4();
		},
		
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fiori.training.crudfiori-training-crud.view.List
		 */
		// onAfterRendering: function() {
		//	
		// },
		
		_onRouteMatched : function (oEvent) {
			var oArgs, refresh;
			oArgs = oEvent.getParameter("arguments");
			refresh = oArgs.refresh;
			if (refresh) {
				this.oView.byId("filterBarId").fireSearch();
			}
		},
		
		_fetchEmployeeF4: function() {
			this.oBusinessModel.setProperty("/EmployeesF4", []);
			this.oView.byId("filterBarId").setBusy(true);
			this.oView.byId("employeeInputId").setBusy(true);
			this.oDataModel.read("/ZEMPLOYEEINFOSet", {
				groupId: "employeeF4Data",
				success: function(oData) {
					this.oView.byId("filterBarId").setBusy(false);
					this.oView.byId("employeeInputId").setBusy(false);
					this.oBusinessModel.setProperty("/EmployeesF4", oData.results);
				}.bind(this),
				error: function(error) {
					this.oView.byId("filterBarId").setBusy(false);
					this.oView.byId("employeeInputId").setBusy(false);
					sap.m.MessageBox.error("Filter Employee Name data load failed.");
				}.bind(this)
			});
		},

		_fetchEmployeeData: function() {
			var sName = this.oViewModel.getProperty("/filters/Id"),
				aFilter = [];
			if (sName && sName.trim().length) {
				var oFilter = new Filter({
					path: "Id",
					operator: FilterOperator.EQ,
					value1: sName.trim()
				});
				aFilter.push(oFilter);
			}
			this.oViewModel.setProperty("/sTableTitle", this.oI18n.getText("tableTitle", [0]));
			this.oBusinessModel.setProperty("/Employees", []);
			this._oTable.setBusy(true);
			this.oDataModel.read("/ZEMPLOYEEINFOSet", {
				groupId: "employeeData",
				filters: aFilter,
				success: function(oData) {
					this._oTable.setBusy(false);
					this.oViewModel.setProperty("/sTableTitle", this.oI18n.getText("tableTitle", [oData.results.length]));
					this.oBusinessModel.setProperty("/Employees", oData.results);
				}.bind(this),
				error: function(error) {
					this._oTable.setBusy(false);
					sap.m.MessageBox.error("Load data failed.");
				}.bind(this)
			});
		},
		
		handleEmployeesValueHelp: function() {
			var aCols = models.createEmployeeValueHelpCols().getProperty("/cols");
			Fragment.load({
				name: "fiori.training.crudfiori-training-crud.fragment.EmployeeValueHelpDialog",
				controller: this
			}).then(function(oFragment) {
				this._oEmployeeValueHelpDialog = oFragment;
				this.oView.addDependent(this._oEmployeeValueHelpDialog);
				this._oEmployeeValueHelpDialog.getTableAsync().then(function(oTable) {
					oTable.setModel(new JSONModel({
						"cols": aCols
					}), "columns");
					if (oTable.bindRows) {
						oTable.bindAggregation("rows", "businessModel>/EmployeesF4");
					}
					if (oTable.bindItems) {
						oTable.bindAggregation("items", "viewModel>/EmployeesF4", function() {
							return new ColumnListItem({
								cells: aCols.map(function(column) {
									return new sap.m.Label({
										text: "{" + column.template.split(">")[1] + "}"
									});
								})
							});
						});
					}
					this._oEmployeeValueHelpDialog.update();
				}.bind(this));

				var oToken = new sap.m.Token();
				oToken.setKey(Number(this.oView.byId("employeeInputId").getSelectedKey()));
				oToken.setText(this.oView.byId("employeeInputId").getValue());
				this._oEmployeeValueHelpDialog.setTokens([oToken]);
				this._oEmployeeValueHelpDialog.open();
			}.bind(this));
		},

		onEmployeeValueHelpOkPress: function(oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this.oView.byId("employeeInputId").setSelectedKey(aTokens[0].getKey());
			oEvent.getSource().close();
		},

		onValueHelpCancelPress: function(oEvent) {
			oEvent.getSource().close();
		},

		onValueHelpAfterClose: function(oEvent) {
			oEvent.getSource().destroy();
		},
		
		onSearch: function() {
			this._fetchEmployeeData();
		},
		
		handleListItemPress: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContextPath();
			var oPressData = oEvent.getSource().getBindingContext("businessModel").getProperty();
			this.getRouter().navTo("Detail", {
				"EmployeeID": oPressData.Id
			});
		},
		
		handleAddPress: function() {
			var oView = this.oView;
			// create dialog lazily
			if (!this._oAddDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "fiori.training.crudfiori-training-crud.fragment.AddDialog",
					controller: this
				}).then(function(oDialog) {
					this._oAddDialog = oDialog;
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.open();
				}.bind(this));
			} else {
				this._oAddDialog.open();
			}
		},
		
		handleConfirmAdd: function() {
			var oEmployee = this.oViewModel.getProperty("/maintainEmployee");
			this._oAddDialog.setBusy(true);
			this.oDataModel.create("/ZEMPLOYEEINFOSet", oEmployee, {
				groupId: "addEmployee",
				success: function(oRes) {
					this._oAddDialog.setBusy(false);
					this._oAddDialog.close();
					sap.m.MessageToast.show("Add Employee info successfully.");
					this._fetchEmployeeData();
				}.bind(this),
				error: function(error) {
					this._oAddDialog.setBusy(false);
					sap.m.MessageToast.show("Add Employee info failed.");
				}
			});
		},
		
		handleCancelOpreation: function(oEvent) {
			var oSource = oEvent.getSource();
			oSource.getParent().close();
		},
		
		handleAddDialogAfterOpen: function() {
			this.oViewModel.setProperty("/maintainEmployee/Id", this.generateGuid());
		},
		
		handleAddDialogAfterClose: function() {
			this.oViewModel.setProperty("/maintainEmployee", {
				"Id": "",
				"Name": "",
				"Age": null,
				"Birthdate": "",
				"Address": ""
			});
		},
		
		handleTableSelectionChange: function(oEvent) {
			var sPath = oEvent.getParameter("listItem").getBindingContextPath(),
				aSelectedItem = oEvent.getParameter("listItems"),
				oSelectedData = this.oBusinessModel.getProperty(sPath);
			// this.oViewModel.setProperty("/maintainEmployee", oSelectedData);
			this.oViewModel.setProperty("/iTableSelectedLen", aSelectedItem.length);
		},
		
		handleEditPress: function() {
			var oView = this.oView,
				aPath = this._oTable.getSelectedContextPaths();
			if  (!aPath.length) {
				return;
			}
			var oSelectedData = this.oBusinessModel.getProperty(aPath[0]);
			delete oSelectedData.__metadata;
			this.oViewModel.setProperty("/maintainEmployee", oSelectedData);
			// create dialog lazily
			if (!this._oEditDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "fiori.training.crudfiori-training-crud.fragment.EditDialog",
					controller: this
				}).then(function(oDialog) {
					this._oEditDialog = oDialog;
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.open();
				}.bind(this));
			} else {
				this._oEditDialog.open();
			}
		},
		
		handleConfirmEdit: function() {
			var oEmployee = this.oViewModel.getProperty("/maintainEmployee");
			this._oEditDialog.setBusy(true);
			this.oDataModel.update("/ZEMPLOYEEINFOSet('" + oEmployee.Id + "')", oEmployee, {
				groupId: "updateEmployee",
				success: function(oRes) {
					this._oEditDialog.setBusy(false);
					this._oEditDialog.close();
					sap.m.MessageToast.show("Update Employee info successfully.");
					this._oTable.removeSelections(true);
					this._fetchEmployeeData();
				}.bind(this),
				error: function(error) {
					this._oEditDialog.setBusy(false);
					sap.m.MessageToast.show("Update Employee info failed.");
				}
			});
		},
		
		handleDeletePress: function() {
			sap.m.MessageBox.confirm("Confirm delete employee?", {
				onClose: function(sAction) {
					if (sAction === "OK") {
						this._removeEmployee();
					}
				}.bind(this)
			});
		},
		
		_removeEmployee: function() {
			var aPath = this._oTable.getSelectedContextPaths();
			if  (!aPath.length) {
				return;
			}
			var sSelectedId = this.oBusinessModel.getProperty(aPath[0] + "/Id");
			this._oTable.setBusy(true);
			this.oDataModel.remove("/ZEMPLOYEEINFOSet('" + sSelectedId + "')", {
				groupId: "removeEmployee",
				success: function(oRes) {
					this._oTable.setBusy(false);
					sap.m.MessageToast.show("Delete Employee info successfully.");
					this._oTable.removeSelections(true);
					this._fetchEmployeeData();
				}.bind(this),
				error: function(error) {
					this._oTable.setBusy(false);
					sap.m.MessageToast.show("Delete Employee info failed.");
				}
			});
		}


		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fiori.training.crudfiori-training-crud.view.List
		 */
		//	onExit: function() {
		//
		//	}

	});

});