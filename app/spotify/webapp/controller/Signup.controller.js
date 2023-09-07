sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        let that;
        return Controller.extend("spotify.controller.Signup", {
            onInit: function () {
                that = this;
                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.attachRouteMatched(this.onSignup, this);
            },

            onSignup: function () {
                document.title = "Sign up - Spotify"
            },

            onPressLogin:function(){
                that.getOwnerComponent().getRouter().navTo("RouteView1");
            }
        });
    });
