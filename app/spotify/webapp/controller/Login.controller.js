sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/library'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, mobileLibrary) {
        "use strict";

        let that;
        return Controller.extend("spotify.controller.Login", {
            onInit: function () {
                that = this;
                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.attachRouteMatched(this.onLogin, this);
            },

            onLogin: function () {
                document.title = "Login - Spotify"
            },

            onPressSpotify: function () {
                that.getOwnerComponent().getRouter().navTo("RouteView1");
            },

            openGoogle: function () {
                const URLhelper = mobileLibrary.URLHelper;
                URLhelper.redirect("https://www.google.co.in/", true);
            },

            onPressSignUP: function () {
                that.getOwnerComponent().getRouter().navTo("Signup");
            },
        });
    });
