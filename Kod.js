const onOpen = () => {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Mapa")
    .addItem("Pobierz współrzędne geograficzne", "getCoordinatesList")
    .addSeparator()
    .addItem("Mapa w ramce", "openModal")
    .addItem("Mapa z prawej", "openShowbar")
    .addToUi();
};

const openModal = () => {
  openDialog("showModelessDialog", "Mapa");
};

const openShowbar = () => {
  openDialog("showSidebar");
};

const openDialog = (modalMethod, title = null) => {
  const html = HtmlService.createTemplateFromFile("template/index.html")
    .evaluate()
    .setHeight(700)
    .setWidth(700)
    .setTitle("Mapa");

  const ui = SpreadsheetApp.getUi();
  if (title !== null) {
    return ui[modalMethod](html, title);
  }
  ui[modalMethod](html);
};

const include = (filename) => {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
};

const getCooridnates = (address) => {
  const coordinates = [];
  const { results } = Maps.newGeocoder().geocode(address);
  results.forEach(
    ({
      geometry: {
        location: { lat, lng },
      },
    }) => {
      coordinates.push(lat);
      coordinates.push(lng);
    }
  );
  return coordinates;
};

const getSheet = () => {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
};

const getRangeValues = () => {
  const ss = getSheet();
  const [headers, ...values] = ss.getDataRange().getValues();
  return values;
};

const getCoordinatesList = () => {
  const values = getRangeValues();
  const newData = values.map(
    ([
      client,
      city,
      address,
      telephone,
      sale,
      lastSale,
      lastSaleDayCount,
      lat,
      lng,
    ]) => {
      if (city === "" && address === "") {
        return ["", ""];
      }

      const linkedAddress = `${city}, ${address}`;
      return getCooridnates(linkedAddress);
    }
  );

  // do wydzielenia
  getSheet().getRange(2, 8, values.length, 2).setValues(newData);
};

const getMarkers = () => {
  const values = getRangeValues();
  const markers = values.map((row) => {
    const objKeys = [
      "client",
      "city",
      "address",
      "telephone",
      "sale",
      "lastSale",
      "lastSaleDayCount",
      "lat",
      "lng",
    ];
    const res = row.reduce(
      (acc, curr, index) => ((acc[objKeys[index]] = curr), acc),
      {}
    );

    return res;
  });
  return JSON.stringify(markers);
};

const findValueRange = () => {
  const ss = getSheet();
};
