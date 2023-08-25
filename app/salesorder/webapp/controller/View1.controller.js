sap.ui.define(
  ["sap/ui/core/mvc/Controller",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Spreadsheet) {
    "use strict";

    let that, validList = [], allDate;
    return Controller.extend("salesorder.controller.View1", {
      onInit: function () {
        that = this;
        that.suggestDialog = that.loadFragment({
          name: "salesorder.view.suggest",
        });
        that.uniqueDialog = that.loadFragment({
          name: "salesorder.view.uniqueid",
        });
        that.orderDialog = that.loadFragment({
          name: "salesorder.view.order",
        });
        that.datePicker = that.loadFragment({
          name: "salesorder.view.DatePicker",
        });
        that.errorTable = that.loadFragment({
          name: "salesorder.view.errorTable",
        });
        that.byId("table").setModel(new sap.ui.model.json.JSONModel({ salesOrder: [] }));
      },

      go: function () {
        const to = that.byId("date").getTo(),
          from = that.byId("date").getFrom(),
          product = that.byId("input").getValue(),
          uniqueId = that.byId("uniqueIDinput").getValue();
        that.byId("search").setValue("");
        if (!product) {
          return sap.m.MessageToast.show("Select a PRODUCT");
        }
        if (!uniqueId) {
          return sap.m.MessageToast.show("Select a ID");
        }
        const oTable = that.byId("table"),
          oModel = that.getOwnerComponent().getModel();
        oModel.read("/SEED_ORDER", {
          success: function (data) {
            let items = data.results;
            items = data.results.filter((obj) => {
              return (obj.PRODUCT === product) && (obj.UNIQUE_ID === uniqueId);
            });
            if (from && to) {
              items = items.filter((obj) => {
                return (
                  new Date(obj.CREADTED_DATE) >= new Date(from) &&
                  new Date(obj.CREADTED_DATE) <= new Date(to)
                );
              });
            }
            const model = new sap.ui.model.json.JSONModel();
            model.setData({
              salesOrder: items,
            });
            oTable.setModel(model);
            const OTable = that.byId("table");
            OTable.setModel(model);
            const oFirstItem = oTable.getItems()[0];
            if (oFirstItem) {
              OTable.setSelectedItem(oFirstItem);
              that.onselect();
            }
          },
          error: function (error) {
            console.log(error);
          },
        });
      },

      onValueHelpDialogSearch: function (oEvent) {
        const sValue = oEvent.getParameter("value"),
          oFilter = new sap.ui.model.Filter(
            "PRODUCT_ID",
            sap.ui.model.FilterOperator.Contains,
            sValue
          );
        oEvent.getSource().getBinding("items").filter(oFilter);
      },

      onValueHelpDialogSearch1: function (oEvent) {
        const sValue = oEvent.getParameter("value"),
          oFilter = new sap.ui.model.Filter(
            "UNIQUE_ID",
            sap.ui.model.FilterOperator.Contains,
            sValue
          );
        oEvent.getSource().getBinding("items").filter(oFilter);
      },

      onValueHelpRequest: function () {
        if (!that.suggestDialog) {
          that.suggestDialog = that.loadFragment({
            name: "salesorder.view.suggest",
          });
        }
        that.suggestDialog.then((dialog) => {
          dialog.open();
        })
          .then(() => {
            const oModel = that.getOwnerComponent().getModel();
            oModel.read("/UNIQUE_ID_HEADER", {
              success: async function (data) {
                const datas = [];
                data.results.forEach((obj) => {
                  if (!datas.includes(obj.PRODUCT_ID)) {
                    datas.push(obj.PRODUCT_ID);
                  }
                });
                const PRODUCT_ID = datas.map((item) => {
                  return {
                    PRODUCT_ID: item,
                  };
                });
                const model = new sap.ui.model.json.JSONModel();
                await model.setData({
                  PRODUCT_ID: PRODUCT_ID,
                });
                that.byId("selectDialog").setModel(model);
              },
              error: function (error) {
                console.log(error);
              },
            });
          })
      },
      onValueHelpRequest1: function () {
        let product;
        if (that.byId("orderDialog").isOpen()) {
          product = that.byId("orderProduct").getValue();
        } else {
          product = that.byId("input").getValue();
        }
        if (!product) {
          return sap.m.MessageToast.show("Select a PRODUCT");
        }
        if (!that.uniqueDialog) {
          that.uniqueDialog = that.loadFragment({
            name: "salesorder.view.uniqueid",
          });
        }
        that.uniqueDialog.then((dialog) => {
          dialog.open();
        });
        const oModel = that.getOwnerComponent().getModel();
        oModel.read("/UNIQUE_ID_HEADER", {
          success: async function (data) {
            let items = data.results;
            items = items.filter((obj) => obj.PRODUCT_ID === product);
            const model = new sap.ui.model.json.JSONModel();
            await model.setData({
              UNIQUE_ID: items.map((obj) => {
                return { UNIQUE_ID: obj.UNIQUE_ID + "" };
              }),
            });
            that.byId("uniqueDialog").setTitle(product);
            that.byId("uniqueDialog").setModel(model);
          },
          error: function (error) {
            console.log(error);
          },
        });
      },

      onValueHelpDialogClose: function (oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedItem");
        if (!oSelectedItem) {
          return true;
        }
        const title = oSelectedItem.getTitle();
        if (that.byId("orderDialog").isOpen()) {
          that.byId("orderProduct").setValue(title);
          that.byId("uniqueIDOrder").setValue("");
        } else {
          that.byId("input").setValue(title);
          that.byId("uniqueIDinput").setValue("");
        }
      },

      onValueHelpDialogClose1: function (oEvent) {
        const oSelectedItem = oEvent.getParameter("selectedItem");
        if (!oSelectedItem) {
          return true;
        }
        const title = oSelectedItem.getTitle();
        if (that.byId("orderDialog").isOpen()) {
          that.byId("uniqueIDOrder").setValue(Number(title));
        } else {
          that.byId("uniqueIDinput").setValue(Number(title));
        }
      },

      onSearch: function (oEvent) {
        const sValue = that.getView().byId("search").getValue(),
          table = that.getView().byId("table"),
          oBinding = table.getBinding("items"),
          filter = new sap.ui.model.Filter(
            [
              new sap.ui.model.Filter(
                "UNIQUE_ID",
                sap.ui.model.FilterOperator.Contains,
                sValue
              ),
              new sap.ui.model.Filter(
                "SEEDORDER",
                sap.ui.model.FilterOperator.Contains,
                sValue
              ),
            ],
            false
          );
        oBinding.filter(filter);
      },

      pressOrderNow: async function () {
        if (!that.orderDialog) {
          that.orderDialog = that.loadFragment({
            name: "salesorder.view.order",
          });
        }
        await that.orderDialog.then((dialog) => {
          dialog.open();
        });
      },

      orderNow: function () {
        const oModel = that.getOwnerComponent().getModel(),
          PRODUCT = that.byId("orderProduct").getValue(),
          UNIQUE_ID = that.byId("uniqueIDOrder").getValue(),
          ORDER_QUANTITY = Number(that.byId("orderQuantity").getValue()),
          MATERIAL_AVAIL_DATE = that.byId("materialDate").getValue();
        if (!PRODUCT) {
          that.byId("orderProduct").setValueState(sap.ui.core.ValueState.Error);
          return sap.m.MessageToast.show("GIVE A VALID PRODUCT");
        }
        that.byId("orderProduct").setValueState(sap.ui.core.ValueState.Success);
        if (!UNIQUE_ID) {
          that.byId("uniqueIDOrder").setValueState(sap.ui.core.ValueState.Error);
          return sap.m.MessageToast.show("GIVE A VALID UNIQUE_ID");
        }
        that.byId("uniqueIDOrder").setValueState(sap.ui.core.ValueState.Success);
        if (!ORDER_QUANTITY || ORDER_QUANTITY === 0) {
          that.byId("orderQuantity").setValueState(sap.ui.core.ValueState.Error);
          return sap.m.MessageToast.show("GIVE A VALID ORDER_QUANTITY");
        }
        that.byId("orderQuantity").setValueState(sap.ui.core.ValueState.Success);
        if (!new Date(MATERIAL_AVAIL_DATE).getDay()) {
          that.byId("materialDate").setValueState(sap.ui.core.ValueState.Error);
          return sap.m.MessageToast.show("GIVE A VALID MATERIAL_AVAIL_DATE");
        }
        that.byId("materialDate").setValueState(sap.ui.core.ValueState.Success);
        oModel.callFunction("/order", {
          method: "GET",
          urlParameters: {
            FLAG: "C",
            PRODUCT: PRODUCT,
            UNIQUE_ID: UNIQUE_ID,
            ORDER_QUANTITY: ORDER_QUANTITY,
            MATERIAL_AVAIL_DATE: MATERIAL_AVAIL_DATE,
            CREADTED_DATE: new Date().toLocaleDateString(),
            CREATED_BY: "",
          },
          success: function (message) {
            if (!message.order.startsWith("SE000")) {
              if (message.order.includes("ON")) that.byId("materialDate").setValueState(sap.ui.core.ValueState.Error);
              else {
                that.byId("uniqueIDOrder").setValueState(sap.ui.core.ValueState.Error);
                that.byId("orderProduct").setValueState(sap.ui.core.ValueState.Error);
              }
              sap.m.MessageToast.show(
                message.order
              );
            } else {
              that.byId("input").setValue(PRODUCT);
              that.byId("uniqueIDinput").setValue(UNIQUE_ID);
              that.byId("date").setFrom(new Date(new Date().setHours(0, 0, 0, 0)));
              that.byId("date").setTo(new Date(new Date().setHours(23, 59, 59, 59)));
              that.go();
              sap.m.MessageToast.show(`${message.order} HAS BEEN CREATED SUCCESSFULLY`);
              that.onCloseOrder();
            }
          },
          error: function (error) {
            console.log(error);
            sap.m.MessageToast.show("Create Failed");
          },
        });
      },

      checkOrderQuantity: function (oEvent) {
        const input = oEvent.getSource(),
          val = input.getValue();
        val = val.replace(/[^\d]/g, "");
        input.setValue(val);
      },

      onCloseOrder: function () {
        that.byId("orderProduct").setValueState(sap.ui.core.ValueState.None);
        that.byId("uniqueIDOrder").setValueState(sap.ui.core.ValueState.None);
        that.byId("orderQuantity").setValueState(sap.ui.core.ValueState.None);
        that.byId("materialDate").setValueState(sap.ui.core.ValueState.None);
        that.byId("uniqueIDOrder").setValue("");
        that.byId("orderProduct").setValue("");
        that.byId("orderQuantity").setValue("");
        that.byId("materialDate").setValue("");
        that.byId("orderDialog").close();
      },

      reset: function () {
        that.byId("input").setValue("");
        that.byId("search").setValue("");
        that.byId("uniqueIDinput").setValue("");
        that.byId("date").setValue("");
        that.byId("fileUpload").setValue("");
        that.byId("table").setModel(new sap.ui.model.json.JSONModel({ salesOrder: [] }));
      },

      checkOrderQuantity: function (oEvent) {
        const input = oEvent.getSource(),
          val = input.getValue();
        val = val.replace(/[^\d]/g, "");
        input.setValue(val);
      },
      ondownloadTemplete: function () {
        that.datePicker
          .then(dialog => {
            dialog.open()
          })
      },

      onCloseDate: function () {
        that.byId("dateRange").setValue("");
        that.byId("templeteName").setValue("");
        that.byId("templeteName").setValueState(sap.ui.core.ValueState.None);
        that.byId("dateRange").setValueState(sap.ui.core.ValueState.None);
        that.byId("dateDialog").close();
      },

      downloadTemplete: function () {
        const from = new Date(that.byId("dateRange").getFrom()),
          to = new Date(that.byId("dateRange").getTo()),
          name = that.byId("templeteName").getValue();
        if (!(that.byId("dateRange").getFrom())) {
          that.byId("dateRange").setValueState(sap.ui.core.ValueState.Error);
          return sap.m.MessageToast.show("GIVEN A RANGE");
        }
        that.byId("dateRange").setValueState(sap.ui.core.ValueState.Success);
        if (!name) {
          that.byId("templeteName").setValueState(sap.ui.core.ValueState.Error);
          return sap.m.MessageToast.show("GIVEN A NAME");
        }
        that.byId("templeteName").setValueState(sap.ui.core.ValueState.Success);
        const tempFrom = from,
          startDay = tempFrom.getDay(),
          monDays = [];
        if (startDay === 1) {
          monDays.push(tempFrom.toDateString());
        } else {
          let temp;
          if (startDay === 0) {
            temp = 1;
          } else {
            temp = 8 - startDay
          }
          tempFrom.setDate(tempFrom.getDate() + (temp))
          monDays.push(tempFrom.toDateString());
        }
        while (tempFrom <= to) {
          tempFrom.setDate(tempFrom.getDate() + 7);
          monDays.push(tempFrom.toDateString());
        }
        monDays.unshift("PRODUCT", "UNIQUE_ID");
        let aCols, oSettings, oSheet;
        aCols = that.createColumnConfig(monDays);
        oSettings = {
          workbook: {
            columns: aCols,
          },
          dataSource: [],
          fileName: `${name}.xlsx`,
          worker: true,
        };
        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
          that.onCloseDate();
        });
      },

      upload: function (oEvent) {
        //that.byId("table").setModel(new sap.ui.model.json.JSONModel({ salesOrder: [] }));
        let excelData = {},
          file = this.byId("fileUpload").oFileUpload.files[0],
          reader = new FileReader();
        this.byId("fileUpload").setValue("");
        validList = [];
        if (!file) {
          return sap.m.MessageToast.show("SELECT A EXCEL FILE");
        }
        reader.onload = function (e) {
          const data = e.target.result,
            workbook = XLSX.read(data, {
              type: "binary"
            });
          workbook.SheetNames.forEach(function (sheetName) {
            excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            allDate = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], { header: 1 })[0].filter(date => date !== "PRODUCT" && date !== "UNIQUE_ID");
            that.excelOrder(excelData);
          });
        };
        reader.readAsBinaryString(file);
      },

      createColumnConfig: function (list) {
        const aCols = [],
          noOfColumn = list.length;
        for (let i = 0; i < noOfColumn; i++) {
          const temp = {
            property: list[i],//property: list[i].split(' ').join('_')
          }
          if (list[i] != "PRODUCT") {
            temp.type = sap.ui.export.EdmType.Number
          }
          aCols.push(temp);
        }
        return aCols;
      },

      excelOrder: async function (catchData) {
        let SEED_ORDER, HEADER_ITEM;
        that.getOwnerComponent().getModel()
          .read("/SEED_ORDER", {
            success: function (seedorder) {
              SEED_ORDER = seedorder.results;
              that.getOwnerComponent().getModel()
                .read("/UNIQUE_ID_HEADER", {
                  success: function (headeritem) {
                    HEADER_ITEM = headeritem.results;
                    const dub = [],
                      data = [];
                    catchData.forEach(obj => {
                      if (!(dub.includes(obj.UNIQUE_ID))) {
                        data.push(obj)
                      }
                      dub.push(obj.UNIQUE_ID);
                    })
                    data.forEach(async row => {
                      const PRODUCT = row.PRODUCT,
                        UNIQUE_ID = row.UNIQUE_ID;
                      const temp = {
                        PRODUCT: PRODUCT ? PRODUCT : "+",
                        UNIQUE_ID: UNIQUE_ID ? UNIQUE_ID : "+",
                      }
                      const thisDate = [];
                      allDate.forEach(async date => {
                        const orderQuanrity = row[date];
                        temp[date.split(' ').join('_')] = orderQuanrity ? orderQuanrity : "+";//date format depend
                        thisDate.push(orderQuanrity ? orderQuanrity : "+")
                      })
                      const DATES = Object.keys(temp).filter(_date => _date !== "PRODUCT" && _date !== "UNIQUE_ID");
                      if (temp.PRODUCT === "+") {
                        temp.TYPE = "INVALID"
                        temp.REASON = "NULL_PRODUCT"
                      }
                      else if (temp.UNIQUE_ID === "+") {
                        temp.TYPE = "INVALID"
                        temp.REASON = "NULL_ID"
                      }
                      else if (thisDate.find(value => value === "+")) {
                        temp.TYPE = "INVALID"
                        temp.REASON = "NULL"
                      } else if (thisDate.find(value => !Number(value))) {
                        const string = thisDate.find(value => !Number(value)),
                          index = thisDate.indexOf(string);
                        temp[DATES[index]] = temp[DATES[index]] + " "
                        temp.TYPE = "INVALID"
                        temp.REASON = "INVALID_QUANTITY"
                      } else if (!HEADER_ITEM.find(obj => obj.PRODUCT_ID === temp.PRODUCT && obj.UNIQUE_ID == temp.UNIQUE_ID)) {
                        temp.UNIQUE_ID = temp.UNIQUE_ID + " "
                        temp.TYPE = "INVALID"
                        temp.REASON = "INVALID_ID"
                      }
                      else if (SEED_ORDER.find(obj => ((obj.UNIQUE_ID == temp.UNIQUE_ID) && DATES.includes(new Date(obj.MATERIAL_AVAIL_DATE).toDateString().split(" ").join("_"))))) {
                        const obj = SEED_ORDER.find(obj => ((obj.UNIQUE_ID == temp.UNIQUE_ID) && DATES.includes(new Date(obj.MATERIAL_AVAIL_DATE).toDateString().split(" ").join("_"))))
                        temp[new Date(obj.MATERIAL_AVAIL_DATE).toDateString().split(" ").join("_")] = temp[new Date(obj.MATERIAL_AVAIL_DATE).toDateString().split(" ").join("_")] + " "
                        temp.TYPE = "INVALID"
                        temp.REASON = "ALREADY_EXIST_ON_THAT_DATE"
                      } else {
                        temp.TYPE = "VALID"
                        temp.REASON = "_"
                      }
                      validList.push(temp)
                    })
                    const find = validList.find(obj => obj.TYPE === "INVALID")
                    if (find) {
                      that.errorTable.then(dialog => {
                        dialog.open();
                        that.byId("table2").setModel(new sap.ui.model.json.JSONModel({ items: validList }));
                        sap.m.MessageToast.show("BROWSE FAILED");
                        that.bindModel(validList, that.byId("table2"));
                        that.byId("typeSelect").setModel(new sap.ui.model.json.JSONModel({ types: [{ type: "ALL" }, { type: "VALID" }, { type: "INVALID" }] }));
                        that.byId("reasonSelect").setModel(new sap.ui.model.json.JSONModel({
                          reason:
                            [{ reason: "ALL" }, { reason: "NULL" }, { reason: "NULL_PRODUCT" }, { reason: "NULL_ID" },
                            { reason: "INVALID_QUANTITY" }, { reason: "INVALID_ID" }, { reason: "ALREADY_EXIST_ON_THAT_DATE" }]
                        }));
                      })
                    }
                    else {
                      validList = [];
                      const dub = [],
                        data = [],
                        allOrders = [],
                        oModel = that.getOwnerComponent().getModel();
                      catchData.forEach(obj => {
                        if (!(dub.includes(obj.UNIQUE_ID))) {
                          data.push(obj)
                        }
                        dub.push(obj.UNIQUE_ID);
                      })


                      if (data.length === 0) {
                        return sap.m.MessageToast.show("THE EXCEL IS EMPTY");
                      }
                      data.forEach(async row => {
                        const key = Object.keys(row),
                          dates = key.filter(item => new Date(item.split('_').join('/')).getDay()),
                          PRODUCT = row.PRODUCT,
                          UNIQUE_ID = row.UNIQUE_ID;
                        if (PRODUCT && UNIQUE_ID) {
                          dates.forEach(async date => {
                            const MATERIAL_AVAIL_DATE = new Date(date.split('_').join(' ')).toLocaleDateString(),
                              orderQuanrity = row[date];
                            if (Number(orderQuanrity)) {
                              allOrders.push(
                                {
                                  PRODUCT: PRODUCT,
                                  UNIQUE_ID: UNIQUE_ID + '',
                                  ORDER_QUANTITY: Number(orderQuanrity),
                                  MATERIAL_AVAIL_DATE: MATERIAL_AVAIL_DATE,
                                  CREADTED_DATE: new Date().toLocaleDateString(),
                                }
                              )
                            }
                          })
                        }
                      })

                      if (allOrders.length === 0) {
                        return sap.m.MessageToast.show("THE EXCEL DON'T HAVE ANY VALID DATA");
                      }
                      oModel.callFunction("/excelorder", {
                        method: "GET",
                        urlParameters: {
                          FLAG: "C",
                          OBJ: JSON.stringify(allOrders)
                        },
                        success: async function (returnsData) {
                          sap.m.MessageToast.show(JSON.parse(returnsData.excelorder).join(","), { duration: 2000 });
                        },
                        error: function (error) {
                          console.log(error);
                          sap.m.MessageToast.show("Create Failed");
                        },
                      });
                    }
                  },
                  error: function (error) {
                    console.log(error);
                  }
                })
            },
            error: function (error) {
              console.log(error);
            }
          })
      },

      onCloseErrorTable: function () {
        that.byId("errorTableDialog").close();
      },

      bindModel: function (array, oTable) {
        if (oTable.getColumns()[0]) {
          oTable.removeAllColumns();
          oTable.removeAllCustomData();
        }
        const noOfColumn = Object.keys(array[0]).length;
        for (let i = 0; i < noOfColumn; i++) {
          const oColumn = new sap.m.Column(
            {
              header: new sap.m.Label({
                text: Object.keys(array[0])[i],
              }),
            }
          );
          oTable.addColumn(oColumn);
        }
        const oCell = [];
        for (let i = 0; i < noOfColumn; i++) {
          const char = "{" + Object.keys(array[0])[i] + "}",
            cell1 = new sap.m.Text({
              text: char
            });
          oCell.push(cell1);
        }
        const aColList = new sap.m.ColumnListItem(
          {
            cells: oCell
          }
        );
        oTable.bindItems("/items", aColList);
        that.addClass(oTable);
      },
      addClass: function (oTable) {
        oTable.getItems()
          .forEach(items => {
            if (items.getCells()[items.getCells().length - 2].getText() === "INVALID")
              items.getCells()[items.getCells().length - 2].addStyleClass("red");
            else {
              items.getCells()[items.getCells().length - 2].addStyleClass("green");
              items.addStyleClass("greenBorder")
            }
          })
        oTable.getItems()
          .forEach(items => {
            const length = items.getCells().length - 2;
            for (let i = 0; i < length; i++) {
              const text = items.getCells()[i].getText();
              if (text === "+" || text.endsWith(" ")) {
                items.getCells()[i].addStyleClass("crimson");
                items.addStyleClass("redBorder")
              }
              if (text === "+") {
                items.getCells()[i].addStyleClass("rotate");
                items.addStyleClass("redBorder")
              }
            }
          })
      },
      removeClass: function (oTable) {
        oTable.getItems()
          .forEach(items => {
            const length = items.getCells().length - 1;
            for (let i = 0; i < length; i++) {
              items.getCells()[i].removeStyleClass("red");
              items.getCells()[i].removeStyleClass("crimson");
              items.getCells()[i].removeStyleClass("green");
              items.getCells()[i].removeStyleClass("rotate");
              items.removeStyleClass("redBorder");
              items.removeStyleClass("greenBorder");
            }
          })
      },
      onChangeType: function () {
        const key = that.byId("typeSelect").getSelectedKey();
        if (key === "VALID") {
          that.byId("reasonSelect").setModel(new sap.ui.model.json.JSONModel({ reason: [] }));
          that.byId("reasonBox").setVisible(false);
        }
        else {
          that.byId("reasonSelect").setModel(new sap.ui.model.json.JSONModel({ reason: [{ reason: "ALL" }, { reason: "NULL" }, { reason: "NULL_PRODUCT" }, { reason: "NULL_ID" }, { reason: "INVALID_QUANTITY" }, { reason: "INVALID_ID" }, { reason: "ALREADY_EXIST_ON_THAT_DATE" }] }));
          that.byId("reasonBox").setVisible(true);
        }
        const items = that.byId("table2").getBinding("items");
        let filter;
        if (key === "ALL")
          filter = new sap.ui.model.Filter("TYPE", sap.ui.model.FilterOperator.Contains, "");
        else
          filter = new sap.ui.model.Filter("TYPE", sap.ui.model.FilterOperator.EQ, key);
        items.filter(filter);
        that.removeClass(that.byId("table2"))
        that.addClass(that.byId("table2"))
      },
      onChangeReason: function () {
        let key1 = that.byId("typeSelect").getSelectedKey(),
          key2 = that.byId("reasonSelect").getSelectedKey();
        if (key1 === "ALL") key1 = "";
        const items = that.byId("table2").getBinding("items");
        let filter;
        if (key2 === "ALL")
          filter = new sap.ui.model.Filter([new sap.ui.model.Filter("REASON", sap.ui.model.FilterOperator.Contains, ""),
          new sap.ui.model.Filter("TYPE", sap.ui.model.FilterOperator.Contains, key1)],
            true
          );
        else
          filter = new sap.ui.model.Filter("REASON", sap.ui.model.FilterOperator.EQ, key2);
        items.filter(filter);
        that.removeClass(that.byId("table2"))
        that.addClass(that.byId("table2"))
      }
    });
  }
);
