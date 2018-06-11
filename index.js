let jsonurl = "https://rawgit.com/blrzzzt/2018carsga/master/finalRes.json";

function buildTables(carData) {
  // specify the columns
  var columnDefs = [
    {
      headerName: "Vin Check",
      field: "vin",
      cellRenderer: function(params) {
        return `<a href="https://www.iseecars.com/vin-${
          params.value
        }" target="_blank">Press Analyze</a>`;
      }
    },
    { headerName: "Name", field: "heading" },
    { headerName: "Price", field: "price" },
    { headerName: "Miles", field: "miles" },
    {
      headerName: "Link",
      field: "url",
      cellRenderer: function(params) {
        return `<a href="${params.value}" target="_blank">Website</a>`;
      }
    },
    { headerName: "Miles from 628", field: "distance" }
  ];

  // specify the data
  var rowData = carData;

  // let the grid know which columns and what data to use
  var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    enableSorting: true,
    enableFilter: true,
    enableColResize: true
  };

  // lookup the container we want the Grid to use
  var eGridDiv = document.querySelector("#myGrid");

  // create the grid passing in the div to use together with the columns & data we want to use
  new agGrid.Grid(eGridDiv, gridOptions);
}

let caller = () => {
  fetch(jsonurl)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.log(data);
      buildTables(data);
      gridOptions.columnApi.autoSizeColumns();
    });
};

caller();
