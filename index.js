let loading = document.querySelector("#loading");
function addLoad(data) {
  loading.innerHTML += "<br>" + String(data);
}
let searchOpts;
function submitValues () {
  let _searchOpts = {
  headers: new Headers({
    Host: "marketcheck-prod.apigee.net",
    "Content-Type": "application/json"
  }),
  protocol: "https",
  mod: "://",
  apiBaseUrl: "marketcheck-prod.apigee.net/v1/",
  method: "search",
  qualifier: "?",
  criteria: {
    api_key: "zmpS0ZL0SRUVX6GMteTiginWwKbLdxOy",
    year: year.value,
    latitude: latitude.value,
    longitude: longitude.value,
    radius: radius.value,
    body_type: body_type.value,
    drivetrain: drivetrain.value,
    start: "0",
    rows: "50",
    seller_type: "dealer",
    carfax_clean_title: "true",
    price_range: "0-38000",
    miles_range: "0-50000"
  }
};
  searchOpts = _searchOpts
  beginRequest()
}


let constructSearch = x => {
  let searchArr = Object.entries(x.criteria);
  let searchString = "";
  searchArr.forEach(y => {
    searchString += `${y[0]}=${y[1]}&`;
  });
  return searchString;
};

let constructURL = (x, y) => {
  let url = x.protocol + x.mod + x.apiBaseUrl + x.method + x.qualifier + y;
  return url;
};

let finalUrl = () => {
  let url = constructURL(searchOpts, constructSearch(searchOpts));
  //addLoad(url);
  return url;
};

let finalJson;
let stopGap = 0;
let premain = 0;
let finalResults = [];
let caller = (x, recked) => {
  fetch(finalUrl(), x.headers)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
    let remainingEntries = data.num_found - (50 * (reqNum - 1));
      stopGap = Math.ceil(data.num_found / 50);
      addLoad(`Found ${data.num_found} listings.`);
      addLoad(`${premain ? "Remaining" : "Projected"} Queries ${stopGap - reqNum + 1}.`);
      premain = 1
      finalResults.push(data.listings);
      addLoad(`Remaining entries ${remainingEntries}.`);
      addLoad("Written to array.");

      if (reqNum > stopGap) {
        setTimeout(() => {
          addLoad("Requests Complete!");
          addLoad("Processing...");
        }, 5000);
        clearInterval(recked);

        // process and render results

        buildTables(parseResults(finalResults));
      }
    });
};

let reqNum = 1;

function beginRequest() {
  let requestID = setInterval(() => {
    addLoad("Querying...");
    addLoad(`Request number ${reqNum}`);

    caller(searchOpts, requestID);
    reqNum++;
    searchOpts.criteria.start = (
      parseInt(searchOpts.criteria.start) + 50
    ).toString();
  }, 5000);
}

function parseResults(cars) {
  let pre = [];

  cars.forEach(x => {
    if (x != null) {
      x.forEach(y => {
        pre.push(y);
      });
    }
  });

  addLoad(`Total cars: ${pre.length}`);
  let preDisplay = (arrObjs, prop) => {
    return arrObjs.filter((obj, pos, acc) => {
      return acc.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  };

  display = preDisplay(pre, "vin");

  addLoad(`Removed ${pre.length - display.length} duplicates`);

  let results = [];

  display.forEach(x => {
    let obj = {};
    obj.vin = x.vin;
    obj.heading = x.heading;
    obj.price = x.price;
    obj.miles = x.miles;
    obj.url = x.vdp_url;
    obj.clean = x.carfax_clean_title;
    obj.build = x.build;
    obj.distance = x.dist;
    results.push(obj);
  });
  return results;
}

function buildTables(carData) {
  // specify the columns
  let columnDefs = [
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
    { headerName: "Miles Away", field: "distance" }
  ];

  // specify the data
  let rowData = carData;

  // let the grid know which columns and what data to use
  let gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    onFirstDataRendered: function(params) {
      params.api.sizeColumnsToFit();
    }
  };

  // lookup the container we want the Grid to use
  let eGridDiv = document.querySelector("#myGrid");

  loading.hidden = true;
  eGridDiv.hidden = false;

  // create the grid passing in the div to use together with the columns & data we want to use
  new agGrid.Grid(eGridDiv, gridOptions);
}
