const onOpen = () => {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Mapa")
    .addItem("Pobierz współrzędne geograficzne", "getCoordinatesList")
    .addSeparator()
    .addItem("Mapa w ramce", "openModal")
    .addItem("Mapa z prawej", "openShowbar")
    .addSeparator()
    .addSubMenu(
      ui
        .createMenu("Ustawienia")
        .addItem("Wymiary okna mapy", "openMapDimensionsSettings")
        .addItem("Wartości dla kolorów znaczników", "openMarkersSettings")
    )
    .addToUi();
};

const openModal = () => {
  openDialog("showModelessDialog", "Mapa");
};

const openShowbar = () => {
  openDialog("showSidebar");
};

const openDialog = (modalMethod, title = null) => {
  const { width, height } = getMapDimensions();
  const template = HtmlService.createTemplateFromFile("template/index.html")
  const markersValues = getMarkersValues();
  template.markersValues = JSON.stringify(markersValues);
  const html = template.evaluate();
  html
    .setHeight(height)
    .setWidth(width)
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
  const ss = getSheetByID(CONSTANTS.SHEETS.DATA_ID);
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
  getSheetByID(CONSTANTS.SHEETS.DATA_ID).getRange(2, 8, values.length, 2).setValues(newData);
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

const roundValue = (number, precision) => {
  const round = (
    Math.round(number * Math.pow(10, precision)) / Math.pow(10, precision)
  ).toFixed(precision);
  return round;
};

const findValueRange = (value) => {
  const { lat, lng } = JSON.parse(value);
  const ss = getSheetByID(CONSTANTS.SHEETS.DATA_ID);
  const latFixed = roundValue(lat, 6);
  const lngFixed = roundValue(lng, 6);
  const latString = String(latFixed).replace(".", ",");
  const lngString = String(lngFixed).replace(".", ",");
  const mergedCoordinates = `${latString}${lngString}`;
  const foundRange = ss
    .getDataRange()
    .createTextFinder(mergedCoordinates)
    .findNext();
  if (foundRange) {
    const row = foundRange.getRow();
    const rangeToSelect = ss.getRange(`${row}:${row}`);
    ss.setActiveSelection(rangeToSelect);
    return row;
  }
  return null;
};

const getSheetByID = (id) => {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  const [properSheet] = sheets.filter(sheet => sheet.getSheetId() === id)
  return properSheet;
}

const getRangeByName = (name) => {
  return SpreadsheetApp.getActiveSpreadsheet().getRangeByName(name)
}

const getMapDimensions = () => {
  const { MAP_DIMENSIONS: { MIN }, RANGE_NAMES: { MAP_VALUES } } = CONSTANTS;
  const [dimensions] = getRangeByName(MAP_VALUES).getValues();
  let [width, height] = dimensions;
  width = width || MIN;
  height = height || MIN;
  return { width, height };
}

const getMarkersValues = () => {
  const { MAP_DIMENSIONS: { MIN }, RANGE_NAMES: { MARKERS_COLORS } } = CONSTANTS;
  const [values] = getRangeByName(MARKERS_COLORS).getValues();
  return values;
}

const setMapDimensions = (rangeValuesJSON) => {
  const rangeValues = JSON.parse(rangeValuesJSON);
  const range = getRangeByName(CONSTANTS.RANGE_NAMES.MAP_VALUES);
  range.setValues(rangeValues);
}

const setMarkersValues = (markersValuesJSON) => {
  const rangeValues = JSON.parse(markersValuesJSON);
  const range = getRangeByName(CONSTANTS.RANGE_NAMES.MARKERS_COLORS);
  range.setValues(rangeValues);
}

const openMapDimensionsSettings = () => {
  const template = HtmlService.createTemplateFromFile('template/mapWindow/mapWindow.html');
  const { width, height } = getMapDimensions();
  template.width = width;
  template.height = height;
  template.minDimVal = 300;
  template.maxDimVal = 1000;
  const html = template.evaluate();
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'Podaj wymiary okna');
}

const openMarkersSettings = () => {
  const template = HtmlService.createTemplateFromFile('template/markersSettings/markersSettings.html');
  const initialValues = getMarkersValues();
  template.initialValues = JSON.stringify(initialValues);
  const html = template.evaluate();
  html.setWidth(700).setHeight(500)
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'Podaj wartości dla kolorów znaczników mapy');
}
