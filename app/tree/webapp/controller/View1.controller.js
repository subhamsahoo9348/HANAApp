sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        let that;
        return Controller.extend("tree.controller.View1", {
            onInit: function () {
                that = this;

                that.fetchTreeData();
                if (!that.createDialog) {
                    that.createDialog = that.loadFragment({
                        name: "tree.view.create"
                    })
                }
                if (!that.updateDialog) {
                    that.updateDialog = that.loadFragment({
                        name: "tree.view.update"
                    })
                }
            },
            fetchTreeData: function () {
                const oModel = that.getOwnerComponent().getModel();
                oModel.callFunction("/tree", {
                    method: "GET",
                    urlParameters: {
                        FLAG: "read",
                        OBJ: null
                    },
                    success: function (res) {
                        const data = JSON.parse(res.tree);

                        const array = data.map(obj => {
                            return {
                                PAGEID: obj.PAGEID,
                                PARENTNODEID: obj.PARENTNODEID,
                                DESCRIPTION: obj.DESCRIPTION,
                                nodes: []
                            }
                        })

                        array.forEach((obj, index) => {
                            const myNodes = array.filter(item => item.PARENTNODEID === obj.PAGEID).map(o => {
                                return {
                                    PAGEID: o.PAGEID,
                                    PARENTNODEID: o.PARENTNODEID,
                                    DESCRIPTION: o.DESCRIPTION,
                                    nodes: []
                                }
                            });
                            if (myNodes.length) {
                                array[index].nodes = myNodes;
                            }
                        })

                        array.forEach((obj, index1) => {
                            obj.nodes.forEach((item, index2) => {
                                const orginal = array.find(i => i.PAGEID === item.PAGEID);
                                array[index1].nodes[index2] = orginal;
                            })
                        })
                        const main = array.filter(obj => obj.PARENTNODEID === 0)
                        that.byId("tree").setModel(new sap.ui.model.json.JSONModel({
                            data: main
                        }))
                    },
                    error: function (error) {
                        console.log(error);
                    }
                })
            },

            onDragStart: function (oEvent) {
                var oTree = this.byId("tree");
                var oBinding = oTree.getBinding("items");
                var oDragSession = oEvent.getParameter("dragSession");
                var oDraggedItem = oEvent.getParameter("target");
                var iDraggedItemIndex = oTree.indexOfItem(oDraggedItem);
                var aSelectedIndices = oTree.getBinding("items").getSelectedIndices();
                var aSelectedItems = oTree.getSelectedItems();
                var aDraggedItemContexts = [];

                if (aSelectedItems.length > 0) {
                    if (aSelectedIndices.indexOf(iDraggedItemIndex) === -1) {
                        oEvent.preventDefault();
                    } else {
                        for (var i = 0; i < aSelectedItems.length; i++) {
                            aDraggedItemContexts.push(oBinding.getContextByIndex(aSelectedIndices[i]));
                        }
                    }
                } else {
                    aDraggedItemContexts.push(oBinding.getContextByIndex(iDraggedItemIndex));
                }

                oDragSession.setComplexData("hierarchymaintenance", {
                    draggedItemContexts: aDraggedItemContexts
                });
            },

            onDrop: function (oEvent) {
                var oTree = this.byId("tree");
                var oBinding = oTree.getBinding("items");
                var oDragSession = oEvent.getParameter("dragSession");
                var oDroppedItem = oEvent.getParameter("droppedControl");
                var aDraggedItemContexts = oDragSession.getComplexData("hierarchymaintenance").draggedItemContexts;
                var iDroppedIndex = oTree.indexOfItem(oDroppedItem);
                var oNewParentContext = oBinding.getContextByIndex(iDroppedIndex);

                if (aDraggedItemContexts.length === 0 || !oNewParentContext) {
                    return;
                }

                const dragObject = aDraggedItemContexts[0].getObject();
                const dropObject = oDroppedItem.getBindingContext().getObject();

                const oModel = that.getOwnerComponent().getModel();
                oModel.callFunction("/tree", {
                    method: "GET",
                    urlParameters: {
                        FLAG: "drop",
                        OBJ: JSON.stringify({
                            dragObject: dragObject,
                            dropObject: dropObject
                        })
                    },
                    success: function (res) {
                        //AS file change automatic page will be reload
                    },
                    error: function (error) {
                        console.log(error);
                    }
                })
            },

            onPressAdd: function () {
                const selectedItem = that.byId("tree").getSelectedItems();
                let parentNodeId = 0;
                if (selectedItem.length) {
                    if (selectedItem.length > 1) return sap.m.MessageToast.show("Select one Node")
                    parentNodeId = selectedItem[0].getBindingContext().getObject().PAGEID;
                }
                const oModel = that.getOwnerComponent().getModel();
                oModel.callFunction("/tree", {
                    method: "GET",
                    urlParameters: {
                        FLAG: "read",
                        OBJ: null
                    },
                    success: function (res) {
                        const array = JSON.parse(res.tree);
                        const pageId = Math.max(...array.map(obj => obj.PAGEID)) + 1;
                        that.createDialog.then(
                            dialog => {
                                dialog.open();
                                that.byId("pageid").setValue(pageId);
                                that.byId("parentNodeId").setValue(parentNodeId);
                            }
                        )
                    },
                    error: function (error) {
                        console.log(error);
                    }
                })
            },

            onPressEdit: function () {
                const selectedItem = that.byId("tree").getSelectedItems();
                let object;
                if (selectedItem.length) {
                    if (selectedItem.length > 1) return sap.m.MessageToast.show("Select one  Node")
                    object = selectedItem[0].getBindingContext().getObject();
                }
                else {
                    return sap.m.MessageToast.show("Select one  Node")
                }
                that.updateDialog.then(
                    dialog => {
                        dialog.open();
                        that.byId("pageidUpdate").setValue(object.PAGEID);
                        that.byId("descUpdate").setValue(object.DESCRIPTION);
                        that.byId("parentNodeIdUpdate").setValue(object.PARENTNODEID);
                    }
                )
            },

            onCloseCreate: function () {
                that.byId("desc").setValue("");
                that.byId("createDialog").close();
            },

            onCloseUpdate: function () {
                that.byId("desc").setValue("");
                that.byId("updateDialog").close();
            },

            onAdd: function () {
                if (!that.byId("desc").getValue()) return sap.m.MessageToast.show("DESCRIPTION REQUIRED");
                const oModel = that.getOwnerComponent().getModel();
                oModel.callFunction("/tree", {
                    method: "GET",
                    urlParameters: {
                        FLAG: "C",
                        OBJ: JSON.stringify({
                            PAGEID: Number(that.byId("pageid").getValue()),
                            PARENTNODEID: Number(that.byId("parentNodeId").getValue()),
                            DESCRIPTION: that.byId("desc").getValue()
                        })
                    },
                    success: function (res) {
                        that.onCloseCreate();
                        that.fetchTreeData();
                    },
                    error: function (error) {
                        console.log(error);
                    }
                })
            },

            onUpdate: function () {
                if (!that.byId("descUpdate").getValue()) return sap.m.MessageToast.show("DESCRIPTION REQUIRED");
                const oModel = that.getOwnerComponent().getModel();
                oModel.callFunction("/tree", {
                    method: "GET",
                    urlParameters: {
                        FLAG: "U",
                        OBJ: JSON.stringify({
                            PAGEID: Number(that.byId("pageidUpdate").getValue()),
                            PARENTNODEID: Number(that.byId("parentNodeIdUpdate").getValue()),
                            DESCRIPTION: that.byId("descUpdate").getValue()
                        })
                    },
                    success: function (res) {
                        that.onCloseUpdate();
                        that.fetchTreeData();
                    },
                    error: function (error) {
                        console.log(error);
                    }
                })
            },

            onPressDelete: function () {
                const selectedItems = that.byId("tree").getSelectedItems();
                if (selectedItems.length === 0) return sap.m.MessageToast.show("SELECT SOME NODE FOR DELETE");
                const array = selectedItems.map(item => item.getBindingContext().getObject())
                const deleteIds = [...array.map(obj => obj.PAGEID)]
                const oModel = that.getOwnerComponent().getModel();
                oModel.callFunction("/tree", {
                    method: "GET",
                    urlParameters: {
                        FLAG: "D",
                        OBJ: JSON.stringify({
                            deleteIds:deleteIds
                        })
                    },
                    success: function (res) {
                        return sap.m.MessageToast.show("DELETE DONE");
                    },
                    error: function (error) {
                        console.log(error);
                    }
                })
            },
        });
    });
