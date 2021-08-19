sap.ui.define([
	"fiori/training/crudfiori-training-crud/model/DateFormatter"	
], function (DateFormatter) {
	"use strict";
	return {
		jonitDetailTitle: function(title1, title2) {
			if (title1 && title2) {
				return title1.trim() + " " + title2.trim();
			} else if (title2) {
				return title2.trim();
			}
			return "";
		},

		/**
		 * Creates a human readable date
		 *
		 * @public
		 * @param {Date} oDate the date of the property.
		 * @returns {string} sValue the formatted date
		 */
		date: function(oDate) {
			return new DateFormatter({ now: Date.now }).format(oDate);
		}
	};
});