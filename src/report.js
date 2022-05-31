const { getTrips, getDriver, getVehicle } = require('api');

/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */
async function driverReport() {
  // Get the information about each driver using their trips
  const drvInfoObjectByTrips = {};

  // Collect information from the trips array of Objects
  for (const element of await getTrips()) {
    // Destructure the current trip object to extract useful values
    const {
      billedAmount: bA,
      driverID: dI,
      isCash: csh,
      user: {
        name: userName,
      },
      created: rideDate,
      pickup: {address: pickupAddr},
      destination: {address: endAddr}
    } = element;
    // Convert the billed amount to number for arithemetic operations
    const moni = Number(bA) || Number(bA.split(',').join(''));

    // Capture the details for each trip to be added to the trip array of the report
    const tripData = {
        user: userName,
        created: rideDate,
        pickup: pickupAddr,
        destination: endAddr,
        billed: moni,
        isCash: csh
      };

    // Populate the drvInfoByTrips object.
    if (Object.keys(drvInfoObjectByTrips).includes(dI)) {
      drvInfoObjectByTrips[dI]['noOfTrips'] += 1;
      drvInfoObjectByTrips[dI]['totalAmountEarned'] += moni;
      drvInfoObjectByTrips[dI]['totalAmountEarned'] = Math.round(drvInfoObjectByTrips[dI]['totalAmountEarned'] * 100) / 100;
      drvInfoObjectByTrips[dI]['trips'].push(tripData);
      if (csh) {
        !drvInfoObjectByTrips[dI]['noOfCashTrips'] ? drvInfoObjectByTrips[dI]['noOfCashTrips'] = 1 : drvInfoObjectByTrips[dI]['noOfCashTrips'] += 1;
        !drvInfoObjectByTrips[dI]['totalCashAmount'] ? drvInfoObjectByTrips[dI]['totalCashAmount'] = moni : drvInfoObjectByTrips[dI]['totalCashAmount'] += moni;
        drvInfoObjectByTrips[dI]['totalCashAmount'] = Math.round(drvInfoObjectByTrips[dI]['totalCashAmount'] * 100) / 100;
      } else {
        !drvInfoObjectByTrips[dI]['noOfNonCashTrips'] ? drvInfoObjectByTrips[dI]['noOfNonCashTrips'] = 1 : drvInfoObjectByTrips[dI]['noOfNonCashTrips'] += 1;
        !drvInfoObjectByTrips[dI]['totalNonCashAmount'] ? drvInfoObjectByTrips[dI]['totalNonCashAmount'] = moni : drvInfoObjectByTrips[dI]['totalNonCashAmount'] += moni;
        drvInfoObjectByTrips[dI]['totalNonCashAmount'] = Math.round(drvInfoObjectByTrips[dI]['totalNonCashAmount'] * 100) / 100;
      }
    } else {
      drvInfoObjectByTrips[dI] = await getDriverBioAndVehicle (dI);
      drvInfoObjectByTrips[dI]['id'] = dI;
      drvInfoObjectByTrips[dI]['trips'] = [];
      drvInfoObjectByTrips[dI]['trips'].push(tripData);
      drvInfoObjectByTrips[dI]['noOfTrips'] = 1;
      drvInfoObjectByTrips[dI]['totalAmountEarned'] = moni;
      if (csh) {
        drvInfoObjectByTrips[dI]['noOfCashTrips'] = 1;
        drvInfoObjectByTrips[dI]['totalCashAmount'] = moni;
      } else {
        drvInfoObjectByTrips[dI]['noOfNonCashTrips'] = 1;
        drvInfoObjectByTrips[dI]['totalNonCashAmount'] = moni;
      }
    }
  };

  return Object.values(drvInfoObjectByTrips);
}

// Use an async function to get the name, phone and vehicle numbers of the driver
async function getDriverBioAndVehicle (drvId) {
  const drvReportObj = {};
  // Destructure the return value of the getDriver function invocation to get useful values
  try {
    const {
      name: driverName,
      phone: driverPhone,
      vehicleID: driverCars
    } = await getDriver(drvId);
    drvReportObj['fullName'] = driverName;
    drvReportObj['phone'] = driverPhone;
    drvReportObj['vehicles'] = [];
      // Get the vehicle particulars of each vehicle in the array that is return by getDriver
    for (const car of driverCars) {
        const {
          plate: carNumber,
          manufacturer: carBrand,
        } = await getVehicle(car);
        drvReportObj['vehicles'].push({plate: carNumber, manufacturer: carBrand,});
    }
  } catch (error) {
    drvReportObj['vehicles'] = [];
  }
  return drvReportObj;
}
module.exports = driverReport;
