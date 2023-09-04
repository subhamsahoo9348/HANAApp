sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        let that;
        return Controller.extend("spotify.controller.View2", {
            onInit: function () {
                that = this;
                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.attachRouteMatched(this.onSearch, this);
            },
            
            onPressHome:function(){
                that.getOwnerComponent().getRouter().navTo("RouteView1");
            },

            onSearch:function(){
                that.byId("homeIcon").removeStyleClass("homeIcon");
                that.byId("searchIcon").removeStyleClass("searchIcon");
                that.byId("homeIcon").addStyleClass("homeIconAtSearch");
                that.byId("searchIcon").addStyleClass("searchIconsAtSearch");

                that.byId("text").removeStyleClass("text");
                that.byId("text2").removeStyleClass("text2");
                that.byId("text").addStyleClass("textAtSearch");
                that.byId("text2").addStyleClass("text2AtSearch");
            },

            onPressLogIn:function(){
                that.getOwnerComponent().getRouter().navTo("Login");
            },
        });
    });
