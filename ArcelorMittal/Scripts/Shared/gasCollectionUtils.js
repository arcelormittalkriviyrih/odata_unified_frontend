/**
 * Created by daf on 24.11.2016.
 */

function getGasCollectionData(isOnlineData, queryGasCollection, queryTable) {
    if (!isOnlineData) {
        return ({
            "@odata.context": "http://krr-tst-palbp01/odata_unified_svc/api/Dynamic/$metadata#v_GasCollectionData", "value": [
              {
                  "ID": "189d5539-7422-4543-8807-e5bff6a1290d", "dtStart": "2016-11-21T09:00:00+02:00", "dtEnd": "2016-11-21T10:00:00+02:00", "FE": 123456.789, "TE": 12.34, "PE": 34.56, "QE": 56.78, "type": "1", "IDeq": 10010, "Description": "\u0410\u0437\u043e\u0442 \u043e\u0442 \u041b\u0438\u043d\u0434\u0435\u0413\u0430\u0437 (\u043a\u043e\u043d\u0442\u043e\u0440\u0430 \u0433\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u0446\u0435\u0445\u0430)"
              }, {
                  "ID": "c4ebe404-bbc4-420f-b5f2-dfee8cf74040", "dtStart": "2016-11-21T09:00:00+02:00", "dtEnd": "2016-11-21T10:00:00+02:00", "FE": 123456.789, "TE": 12.34, "PE": 34.56, "QE": 56.78, "type": "1", "IDeq": 10010, "Description": "\u0410\u0437\u043e\u0442 \u043e\u0442 \u041b\u0438\u043d\u0434\u0435\u0413\u0430\u0437 (\u043a\u043e\u043d\u0442\u043e\u0440\u0430 \u0433\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u0446\u0435\u0445\u0430)"
              }, {
                  "ID": "e0af8ea7-eb59-47fa-ac9b-f73d9b1e99a4", "dtStart": "2016-11-21T09:00:00+02:00", "dtEnd": "2016-11-21T10:00:00+02:00", "FE": 123456.789, "TE": 12.34, "PE": 34.56, "QE": 56.78, "type": "1", "IDeq": 10010, "Description": "\u0410\u0437\u043e\u0442 \u043e\u0442 \u041b\u0438\u043d\u0434\u0435\u0413\u0430\u0437 (\u043a\u043e\u043d\u0442\u043e\u0440\u0430 \u0433\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u0446\u0435\u0445\u0430)"
              }, {
                  "ID": "4855f450-8b71-45ed-b905-fdaa74750132", "dtStart": "2016-11-21T09:00:00+02:00", "dtEnd": "2016-11-21T10:00:00+02:00", "FE": 123456.789, "TE": 12.34, "PE": 34.56, "QE": 56.78, "type": "1", "IDeq": 10010, "Description": "\u0410\u0437\u043e\u0442 \u043e\u0442 \u041b\u0438\u043d\u0434\u0435\u0413\u0430\u0437 (\u043a\u043e\u043d\u0442\u043e\u0440\u0430 \u0433\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u0446\u0435\u0445\u0430)"
              }, {
                  "ID": "6597611d-ee6b-4047-a45a-2373842e7dd0", "dtStart": "2016-11-21T09:00:00+02:00", "dtEnd": "2016-11-21T10:00:00+02:00", "FE": 123456.789, "TE": 12.34, "PE": 34.56, "QE": 56.78, "type": "1", "IDeq": 10010, "Description": "\u0410\u0437\u043e\u0442 \u043e\u0442 \u041b\u0438\u043d\u0434\u0435\u0413\u0430\u0437 (\u043a\u043e\u043d\u0442\u043e\u0440\u0430 \u0433\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u0446\u0435\u0445\u0430)"
              }, {
                  "ID": "ad4763aa-1455-407f-a6a1-d29eff0dd72e", "dtStart": "2016-11-21T09:00:00+02:00", "dtEnd": "2016-11-21T10:00:00+02:00", "FE": 123456.789, "TE": 12.34, "PE": 34.56, "QE": 56.78, "type": "1", "IDeq": 10010, "Description": "\u0410\u0437\u043e\u0442 \u043e\u0442 \u041b\u0438\u043d\u0434\u0435\u0413\u0430\u0437 (\u043a\u043e\u043d\u0442\u043e\u0440\u0430 \u0433\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u0446\u0435\u0445\u0430)"
              }, {
                  "ID": "89a370af-907c-465d-b545-1baff867e270", "dtStart": "2016-11-21T09:00:00+02:00", "dtEnd": "2016-11-21T10:00:00+02:00", "FE": 123456.789, "TE": 12.34, "PE": 34.56, "QE": 56.78, "type": "1", "IDeq": 10010, "Description": "\u0410\u0437\u043e\u0442 \u043e\u0442 \u041b\u0438\u043d\u0434\u0435\u0413\u0430\u0437 (\u043a\u043e\u043d\u0442\u043e\u0440\u0430 \u0433\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u0446\u0435\u0445\u0430)"
              }, {
                  "ID": "46423a36-1711-4b02-922f-d3b52eb245c6", "dtStart": "2016-11-21T09:00:00+02:00", "dtEnd": "2016-11-21T10:00:00+02:00", "FE": 123456.789, "TE": 12.34, "PE": 34.56, "QE": 56.78, "type": "1", "IDeq": 10010, "Description": "\u0410\u0437\u043e\u0442 \u043e\u0442 \u041b\u0438\u043d\u0434\u0435\u0413\u0430\u0437 (\u043a\u043e\u043d\u0442\u043e\u0440\u0430 \u0433\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u0446\u0435\u0445\u0430)"
              }, {
                  "ID": "47c88998-821d-4504-b540-91580052c3f1", "dtStart": "2016-11-21T10:00:00Z", "dtEnd": "2016-11-22T10:00:00Z", "FE": 987.654, "TE": 21.54, "PE": 43.65, "QE": 65.87, "type": "2", "IDeq": 10010, "Description": "\u0410\u0437\u043e\u0442 \u043e\u0442 \u041b\u0438\u043d\u0434\u0435\u0413\u0430\u0437 (\u043a\u043e\u043d\u0442\u043e\u0440\u0430 \u0433\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u0446\u0435\u0445\u0430)"
              }, {
                  "ID": "aba89157-b352-4c30-a1fd-1fd8f7e7ce7c", "dtStart": "2016-10-22T10:00:00Z", "dtEnd": "2016-11-22T10:00:00Z", "FE": 1888.354, "TE": 18.43, "PE": 143.16, "QE": 88.36, "type": "3", "IDeq": 10010, "Description": "\u0410\u0437\u043e\u0442 \u043e\u0442 \u041b\u0438\u043d\u0434\u0435\u0413\u0430\u0437 (\u043a\u043e\u043d\u0442\u043e\u0440\u0430 \u0433\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u0446\u0435\u0445\u0430)"
              }
            ]
        });
    }
  var table = 'v_GasCollectionData';
  if (queryTable) {
    table = queryTable;
  }
  $.ajax({
    url: serviceUrl + table + queryGasCollection,
    dataType: "json"
  })
    .done(function (data) {
      return data;
    })
    .fail(function() {
      alert( "error" );
      return null;
    });
}

function gasCollectionTableData() {
  //  {datetime: '23:59', valPE: 11.4, valTE: 19, valQE: 0.86, val: 109, sumVal: 2439 }
  // "ID":"189d5539","dtStart":"2016-11-21T09:00:00+02:00","dtEnd":"2016-11-21T10:00:00+02:00","FE":123456.789,"TE":12.34,"PE":34.56,"QE":56.78,"type":"1","IDeq":10010,"Description":"qqqq"
  var gasColectionRawData = getGasCollectionData();
  var gasCollectionArray = [];
  gasCollectionArray = gasColectionRawData.value.map(function (curr) {
      var myDateTime = Date.parse(curr.dtStart);
    //const stringDateTime = dateTime.getFullYear();
    return ({
      datetime: curr.dtStart, //"2016-11-21T09:00:00+02:00",
      valPE: curr.PE,
      valTE: curr.TE,
      valQE: curr.QE,
      val: curr.FE,
      sumVal: 0,
    });
  });
  return gasCollectionArray; //gasColectionRawData.value; //gasColectionRawData.value;
}

function getEquipmentList() {
  return [
    {description: "Азот от ЛиндеГаз (контора газового цеха)", id: 10010},
    {description: "Азот на входе в ККЦ в АРП", id: 10016},
    {description: "Кислород от ЛиндеГаз на ККЦ №1", id: 10022},
    {description: "Кислород от ЛиндеГаз на ККЦ №2", id: 10028},
    {description: "Кислород КРП №1 ККЦ", id: 10034},
    {description: "Кислород КРП №2 ККЦ", id: 10040},
    {description: "Кислород на входе ТЭЦ-1 (2а,5)", id: 10046},
    {description: "Кислород на входе ТВД-2а в ТЭЦ-1", id: 10052},
    {description: "Кислород на входе ТВД-8бис в ТЭЦ-1", id: 10062},
    {description: "Кислород на входе ТЭЦ-2", id: 10071},
    {description: "Кислород на входе ТВД-9 в ТЭЦ-2", id: 10077},
    {description: "Кислород на входе ТВД-11 в ТЭЦ-2", id: 10087},
    {description: "Азот на входе в ДП-9", id: 10095},
    {description: "Азот на входе в ДП-9 №2", id: 10101},
    {description: "Кислород на входе ТЭЦ-3", id: 10107},
    {description: "Воздух на ЦЛС-1 и пр.", id: 10113},
    {description: "Воздух на ЦЛС-2 и пр.", id: 10117},
    {description: "Воздух на ЦРВ-1 и пр.", id: 10121},
    {description: "Кислород на ТЭЦ-3", id: 10125},
    {description: "Кислород на коллектор ККЦ-1", id: 10131},
    {description: "Кислород на коллектор ККЦ-2", id: 10137},
    {description: "Кислород на мартен", id: 10143},
    {description: "Кислород  в цех компрессии №1 (PE 3.14)", id: 10148},
    {description: "Кислород в цех компрессии №1 (PE 3.15)", id: 10149},
    {description: "Кислород на ТЭЦ-1", id: 10150},
    {description: "Кислород на ТЭЦ 1,2", id: 10156},
    {description: "Кислород ЦРВ-КАр-30 №6", id: 10162},
    {description: "Кислород ЦРВ-КАр-30М1 №7", id: 10168},
    {description: "Кислород ЦРВ-КАр-30 №8", id: 10174},
    {description: "Кислород ЦРВ-АКАр-40/35 №2", id: 10180},
    {description: "Кислород низкого давления от ЛиндеГаз", id: 10197},
    {description: "Азот от ЛиндеГаз", id: 10202}
  ]
}

function getGasData() {
  return 'pressed';
}