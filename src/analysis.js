const { getTrips, getDriver } = require('api');

/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
  // Your code goes here
  // Get the trips data from the imported functions
  let tripsArr;
  await getTrips().then(data => tripsArr = data.slice());
  // let tripsArr = await  getTrips();

  // Prepare an output object to be returned by the analysis function.
  const outputObj = {
    noOfCashTrips: 0,
    noOfNonCashTrips: 0,
    billedTotal: 0,
    cashBilledTotal: 0,
    nonCashBilledTotal: 0,
    noOfDriversWithMoreThanOneVehicle: 0,
    mostTripsByDriver: {},
    highestEarningDriver: {}
  };

  // Capture all driver information
  const drvInfoByTrips = {};
  const drvPersonalInfo = [];
  // Loop through the trips data and populate some fields in the output object
  tripsArr.forEach((element) => {
    const {
      billedAmount: bA,
      driverID: dI,
    } = element;
    const moni = Number(bA) || Number(bA.split(',').join(''));

    // Populate the drvInfoByTrips
    if (Object.keys(drvInfoByTrips).includes(dI)) {
      drvInfoByTrips[dI]['tripCount'] += 1;
      drvInfoByTrips[dI]['earnings'] += moni;
    } else {
      drvInfoByTrips[dI] = {};
      drvInfoByTrips[dI]['tripCount'] = 1;
      drvInfoByTrips[dI]['earnings'] = moni;
    }
    // Populate the outputObj
    outputObj['billedTotal'] += moni;
    if (element.isCash) {
      outputObj['noOfCashTrips'] += 1;
      outputObj['cashBilledTotal'] += moni;
    } else {
      outputObj['noOfNonCashTrips'] += 1;
      outputObj['nonCashBilledTotal'] += moni;
    }

  });

  // Arithemetic accuracy adjustment
  for (const objs in outputObj) {
    // outputObj[objs] = Math.round(outputObj[objs]);
    outputObj[objs] = Math.round(outputObj[objs] * 100) / 100;
  }

  // Find the maximum trips by driver and maximum earning by driver
  const maxTrip = {
    trpCnt: 0,
    earn: 0,
    iD: '',
  };
  
  const maxCash = {
    trpCnt: 0,
    earn: 0,
    iD: '',
  };

  for (const key in drvInfoByTrips) {
    //Check for max trips
      if (drvInfoByTrips[key]['tripCount'] > maxTrip['trpCnt']) {
        maxTrip['trpCnt'] = drvInfoByTrips[key]['tripCount'];
        maxTrip['earn'] = drvInfoByTrips[key]['earnings'];
        maxTrip['iD'] = key;
      }
    // Check for max cash
    if (drvInfoByTrips[key]['earnings'] > maxCash['earn']) {
      maxCash['trpCnt'] = drvInfoByTrips[key]['tripCount'];
      maxCash['earn'] = drvInfoByTrips[key]['earnings'];
      maxCash['iD'] = key;
    }
    // Get Drivers personal details
    try {
      drvPersonalInfo.push(await getDriver(key));
    } catch (error) {
      continue;
    }
  }
  
  // Find drivers with more than one vehicle
  for (const {vehicleID: vID} of drvPersonalInfo) {
    if (vID.length > 1) outputObj['noOfDriversWithMoreThanOneVehicle'] += 1;
  }

  // // Put in the mostTripsBydriver and highestEarningDriver properties
  // For driver with MaxTrips
  const {
    name: mxTrpName,
    email: mxTrpEmail,
    phone: mxTrpPhone,
  } = await getDriver(maxTrip['iD']);
  // For MaxCash
  const {
    name: mxCshName,
    email: mxCshEmail,
    phone: mxCshPhone,
  } = await getDriver(maxCash['iD']);

  // Finishing up on the output object
  outputObj['mostTripsByDriver'] = {
    name: mxTrpName,
    email: mxTrpEmail,
    phone: mxTrpPhone,
    noOfTrips: maxTrip['trpCnt'],
    totalAmountEarned: Number(maxTrip['earn'].toFixed(2))
  };
  outputObj['highestEarningDriver'] = {
    name: mxCshName,
    email: mxCshEmail,
    phone: mxCshPhone,
    noOfTrips: maxCash['trpCnt'],
    totalAmountEarned: Number(maxCash['earn'].toFixed(2))
  }
  return outputObj;
}
module.exports = analysis;
