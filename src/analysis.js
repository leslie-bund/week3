const { getTrips, getDriver } = require('api');

/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
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
  const driverInfo = [];

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
  // Loop through the trips data and populate some fields in the output object
  for (let trip of await getTrips()) {
    // Destructure the trip data
    const {
      billedAmount: bA,
      driverID: dI,
      isCash: csh,
    } = trip;
    // Get the amount billed for each transaction in number format
    const moni = Number(bA) || Number(bA.split(',').join(''));
    // Populate the drvInfoByTrips
    if (Object.keys(drvInfoByTrips).includes(dI)) {
      drvInfoByTrips[dI]['tripCount'] += 1;
      drvInfoByTrips[dI]['earnings'] += moni;
      // Arithemetic correction each drivers earnings
      drvInfoByTrips[dI]['earnings'] = Math.round(drvInfoByTrips[dI]['earnings'] * 100) / 100;
    } else {
      drvInfoByTrips[dI] = {};
      drvInfoByTrips[dI]['tripCount'] = 1;
      drvInfoByTrips[dI]['earnings'] = moni;

      // Push the promises into driverInfo Array
      driverInfo.push(getDriver(dI));
    }

    // Populate the outputObj
    outputObj['billedTotal'] += moni;
    outputObj['billedTotal'] = Math.round(outputObj['billedTotal'] * 100) / 100;

    if (csh) {
      outputObj['noOfCashTrips'] += 1;
      outputObj['cashBilledTotal'] += moni;
      // Arithemetic correction of cashBilledtotal
      outputObj['cashBilledTotal'] = Math.round(outputObj['cashBilledTotal'] * 100) / 100;
    } else {
      outputObj['noOfNonCashTrips'] += 1;
      outputObj['nonCashBilledTotal'] += moni;
      // Arithemetic correction of nonCashBilledTotal
      outputObj['nonCashBilledTotal'] = Math.round(outputObj['nonCashBilledTotal'] * 100) / 100;
    }
    //Check for max trips
    if (drvInfoByTrips[dI]['tripCount'] >= maxTrip['trpCnt']) {
      maxTrip['trpCnt'] = drvInfoByTrips[dI]['tripCount'];
      maxTrip['earn'] = drvInfoByTrips[dI]['earnings'];
      maxTrip['iD'] = dI;
    }
    // Check for max cash
    if (drvInfoByTrips[dI]['earnings'] > maxCash['earn']) {
      maxCash['trpCnt'] = drvInfoByTrips[dI]['tripCount'];
      maxCash['earn'] = drvInfoByTrips[dI]['earnings'];
      maxCash['iD'] = dI;
    }
  }

  const drivers = await Promise.allSettled(driverInfo);
  
  for (const driver of drivers){
    if (driver['status'] === 'fulfilled') {
      driver['value']['vehicleID'].length > 1 ? outputObj['noOfDriversWithMoreThanOneVehicle'] += 1 : null;
    }
  }

  // Put in the mostTripsBydriver and highestEarningDriver properties
  const [{ value: {
              name: mxTrpName,
              email: mxTrpEmail,
              phone: mxTrpPhone,
            }
          },
          { value: {
              name: mxCshName,
              email: mxCshEmail,
              phone: mxCshPhone,
            }
          }] = await Promise.allSettled([getDriver(maxTrip['iD']), getDriver(maxCash['iD'])])
          

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
