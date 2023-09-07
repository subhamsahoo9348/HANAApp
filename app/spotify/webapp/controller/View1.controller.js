sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        let that;
        return Controller.extend("spotify.controller.View1", {
            onInit: function () {
                that = this;
                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.attachRouteMatched(this.onHome, this);
            },
            onPressSearch: function () {
                that.getOwnerComponent().getRouter().navTo("View2");
            },
            onHome: function () {
                document.title = "Spotify - Web Player: Music for everyone"
                that.byId("homeIcon").removeStyleClass("homeIconAtSearch");
                that.byId("searchIcon").removeStyleClass("searchIconsAtSearch");
                that.byId("homeIcon").addStyleClass("homeIcon");
                that.byId("searchIcon").addStyleClass("searchIcon");
                that.byId("text").removeStyleClass("textAtSearch");
                that.byId("text2").removeStyleClass("text2AtSearch");
                that.byId("text").addStyleClass("text");
                that.byId("text2").addStyleClass("text2");
            },

            onPressLogIn: function () {
                that.getOwnerComponent().getRouter().navTo("Login");
            },

            onPressSignUP: function () {
                that.getOwnerComponent().getRouter().navTo("Signup");
            },
        });
    });
