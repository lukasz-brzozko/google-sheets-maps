function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Mapa')
    .addItem('Pobierz współrzędne geograficzne', 'dupa')
    .addSeparator()
    .addItem('Mapa w ramce', 'openModal')
    .addItem('Mapa z prawej', 'openShowbar')
    .addToUi();
}

function openModal() {
  openDialog('showModelessDialog', 'Mapa');
}

function openShowbar() {
  openDialog('showSidebar');
}

function openDialog(modalMethod, title = null) {
  const html = HtmlService
    .createHtmlOutputFromFile('template/index.html')
    .setTitle('Mapa')
    .setHeight(700)
    .setWidth(700);
  const ui = SpreadsheetApp.getUi();
  if (title !== null) {
    return ui[modalMethod](html, title);
  }
  ui[modalMethod](html);
}
