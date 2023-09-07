using cp as cd from '../db/interactions';

service CatalogService {

   entity UNIQUE_ID_HEADER as projection on cd.UNIQUE_ID_HEADER;
   entity UNIQUE_ID_ITEM   as projection on cd.UNIQUE_ID_ITEM;
   entity CHARVAL_NUM      as projection on cd.CHARVAL_NUM;
   entity SEED_ORDER       as projection on cd.SEED_ORDER;
   function crud(FLAG : String, PRODUCT_ID : String, UNIQUE_DESC : String, UID_TYPE : String, ACTIVE : Boolean, VALUE : String, UNIQUE_ID : String)                         returns String;
   function order(FLAG : String, PRODUCT : String, UNIQUE_ID : String, ORDER_QUANTITY : Integer, MATERIAL_AVAIL_DATE : String, CREADTED_DATE : String, CREATED_BY : String) returns String;
   function excelorder(FLAG:String,OBJ:String) returns String;
   function tree(FLAG:String,OBJ:String) returns String;
}
