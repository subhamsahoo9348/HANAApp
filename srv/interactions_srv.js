const cds = require("@sap/cds");
module.exports = (srv) => {
  srv.on("crud", async (req) => {
    if (req.data.FLAG === "C") {
      try {
        const value = JSON.parse(req.data.VALUE).value;
        const v = await cds.run(SELECT.from("CP_UNIQUE_ID_HEADER"));
        const data = await cds.run(SELECT.from("CP_CHARVAL_NUM"));
        const id = v.length + 1;
        value.forEach(async (obj) => {
          const item = await data.find((o) => {
            return (
              o.CHARVAL_NUM === obj.CHARVAL_NUM &&
              o.CHAR_VALNUMDESC === obj.CHAR_VALNUMDESC
            );
          });
          await cds.run(
            INSERT.into("CP_UNIQUE_ID_ITEM").entries({
              UNIQUE_ID: id,
              PRODUCT: req.data.PRODUCT_ID,
              CHAR_NUM: item.CHAR_NUM,
              CHAR_NUM_VAL: null,
              CHAR_VALNUMDESC: item.CHAR_VALNUMDESC,
            })
          );
        });
        await cds.run(
          INSERT.into("CP_UNIQUE_ID_HEADER").entries({
            UNIQUE_ID: id,
            PRODUCT_ID: req.data.PRODUCT_ID,
            UNIQUE_DESC: req.data.UNIQUE_DESC,
            UID_TYPE: req.data.UID_TYPE,
            ACTIVE: req.data.ACTIVE,
          })
        );
      } catch (e) {
        throw e;
      }
    } else if (req.data.FLAG === "SELECT") {
      try {
        let store = [];
        //await cds.run(DELETE.from("CP_SEED_ORDER"));
        const CP_UNIQUE_ID_ITEM = await cds.run(
          SELECT.from("CP_UNIQUE_ID_ITEM").where({
            UNIQUE_ID: req.data.UNIQUE_ID,
          })
        );
        const CP_CHARVAL_NUM = await cds.run(SELECT.from("CP_CHARVAL_NUM"));
        function randomIntFromInterval(min, max) {
          return Math.floor(Math.random() * (max - min + 1) + min);
        }
        const filter = CP_UNIQUE_ID_ITEM.forEach((item) => {
          if (item.CHAR_VALNUMDESC === null) {
            let v = CP_CHARVAL_NUM.filter((obj) => {
              return (
                obj.CHAR_NUM === item.CHAR_NUM &&
                obj.CHAR_NUM_VAL === item.CHAR_NUM_VAL
              );
            });
            v.forEach((obj) => {
              store.push(obj);
            });
            store = [store[randomIntFromInterval(0, 2)]];
          } else {
            let v = CP_CHARVAL_NUM.filter((obj) => {
              return (
                obj.CHAR_NUM === item.CHAR_NUM &&
                obj.CHAR_VALNUMDESC === item.CHAR_VALNUMDESC
              );
            });
            v.forEach((obj) => {
              store.push(obj);
            });
          }
        });
        return JSON.stringify({ store });
      } catch (e) {
        throw e;
      }
    } else if (req.data.FLAG === "ACTIVE") {
      try {
        await cds.run(
          UPDATE("CP_UNIQUE_ID_HEADER", { UNIQUE_ID: req.data.UNIQUE_ID }).set({
            ACTIVE: req.data.ACTIVE,
          })
        );
      } catch (e) {
        throw e;
      }
    }
  });
  srv.on("order", async (req) => {
    if (req.data.FLAG === "C") {
      try {
        const UNIQUE_ID_HEADER = await cds.run(SELECT.from("CP_UNIQUE_ID_HEADER"));
        const CP_SEED_ORDER = await cds.run(SELECT.from("CP_SEED_ORDER"));
        const CP_SEED_ORDER_ID = [];
        CP_SEED_ORDER.forEach(obj => { CP_SEED_ORDER_ID.push(obj.SEEDORDER) });
        let lastCount = Number(CP_SEED_ORDER_ID[CP_SEED_ORDER_ID.length - 1]?.split('SE000')[1]);
        if (!lastCount) {
          lastCount = 0
        }
        const find = UNIQUE_ID_HEADER.find(i => i.PRODUCT_ID === req.data.PRODUCT && i.UNIQUE_ID == req.data.UNIQUE_ID);
        var orderId = undefined;
        const findDate = CP_SEED_ORDER.find(i => new Date(i.MATERIAL_AVAIL_DATE).getTime() === new Date(req.data.MATERIAL_AVAIL_DATE).getTime() && i.UNIQUE_ID == req.data.UNIQUE_ID)
        if (find && !findDate) {
          orderId = "SE000" + (lastCount + 1);
          const mail = req.headers["x-username"];
          await cds.run(
            INSERT.into("CP_SEED_ORDER").entries({
              SEEDORDER: orderId,
              PRODUCT: req.data.PRODUCT,
              UNIQUE_ID: req.data.UNIQUE_ID,
              ORDER_QUANTITY: req.data.ORDER_QUANTITY,
              MATERIAL_AVAIL_DATE: req.data.MATERIAL_AVAIL_DATE,
              CREADTED_DATE: req.data.CREADTED_DATE,
              CREATED_BY: mail,
            })
          );
        }
        return orderId ? orderId : (find && findDate) ?
          `${req.data.PRODUCT} WITH ID ${req.data.UNIQUE_ID} ALREADY EXIST ON ${req.data.MATERIAL_AVAIL_DATE}` :
          `${req.data.PRODUCT} WITH ID ${req.data.UNIQUE_ID} DOES NOT EXIST`;
      } catch (e) {
        throw e;
      }
    }
  });
  srv.on("excelorder", async (req) => {
    if (req.data.FLAG === "C") {
      try {
        const returnsData = [];
        const invalidReturnsData1 = [];
        const invalidReturnsData2 = [];
        const UNIQUE_ID_HEADER = await cds.run(SELECT.from("CP_UNIQUE_ID_HEADER"));
        var CP_SEED_ORDER = await cds.run(SELECT.from("CP_SEED_ORDER"));
        const CP_SEED_ORDER_ID = [];
        CP_SEED_ORDER.forEach(obj => { CP_SEED_ORDER_ID.push(obj.SEEDORDER) });
        let lastCount = Number(CP_SEED_ORDER_ID[CP_SEED_ORDER_ID.length - 1]?.split('SE000')[1]);
        if (!lastCount) {
          lastCount = 0
        }
        var id = (lastCount + 1);
        var count = 0;
        var data = JSON.parse(req.data.OBJ);
        var mail = req.headers["x-username"];
        for (let i = 0; i < data.length; i++) {
          var obj = data[i];
          const find = UNIQUE_ID_HEADER.find(i => i.PRODUCT_ID === obj.PRODUCT && i.UNIQUE_ID == obj.UNIQUE_ID);
          const findDate = CP_SEED_ORDER.find(i => new Date(i.MATERIAL_AVAIL_DATE).getTime() === new Date(obj.MATERIAL_AVAIL_DATE).getTime() && i.UNIQUE_ID == obj.UNIQUE_ID)
          if (find && !findDate) {
            var orderId = "SE000" + (id + count);
            count = count + 1;
            const ORDER = {
              SEEDORDER: orderId,
              PRODUCT: obj.PRODUCT,
              UNIQUE_ID: obj.UNIQUE_ID + '',
              ORDER_QUANTITY: obj.ORDER_QUANTITY,
              MATERIAL_AVAIL_DATE: obj.MATERIAL_AVAIL_DATE,
              CREADTED_DATE: new Date().toLocaleDateString(),
              CREATED_BY: mail,
            }
            returnsData.push(ORDER.UNIQUE_ID)
            await cds.run(INSERT.into("CP_SEED_ORDER").entries(ORDER))
          }
        }
        return JSON.stringify(returnsData);
      } catch (e) {
        throw e;
      }
    }
  });

};
